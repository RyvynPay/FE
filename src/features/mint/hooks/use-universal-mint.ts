import ERC20ABI from '@/abis/MockUSDC.json'; // Same ABI for USDC/IDRX
import RyUSDABI from '@/abis/RyUSD.json'; // Same ABI for ryUSD/ryIDR
import { BASE_SEPOLIA_CHAIN_ID } from '@/config/contracts';
import { CURRENCY_CONFIGS } from '@/config/currencies';
import { Currency } from '@/types/currency';
import { useEffect, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';

export function useUniversalMint(currency: Currency) {
  const { address } = useAccount();
  const config = CURRENCY_CONFIGS[currency];

  // Track current step for combined approve + deposit
  const [currentStep, setCurrentStep] = useState<
    'idle' | 'approving' | 'depositing'
  >('idle');
  const [isProcessing, setIsProcessing] = useState(false);

  // Read underlying balance (USDC or IDRX)
  const { data: underlyingBalance, refetch: refetchUnderlying } =
    useReadContract({
      address: config.underlyingToken,
      abi: ERC20ABI,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
      chainId: BASE_SEPOLIA_CHAIN_ID,
    });

  // Read stablecoin balance (ryUSD or ryIDR)
  const { data: stablecoinBalance, refetch: refetchStablecoin } =
    useReadContract({
      address: config.stablecoin,
      abi: RyUSDABI,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
      chainId: BASE_SEPOLIA_CHAIN_ID,
    });

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: config.underlyingToken,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address ? [address, config.stablecoin] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
  });

  const {
    writeContractAsync,
    isPending,
    data: txHash,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: BASE_SEPOLIA_CHAIN_ID,
  });

  // Helper to wait for transaction confirmation
  const waitForTransaction = async (
    hash: `0x${string}` | undefined
  ): Promise<void> => {
    if (!hash) return;

    // Poll for transaction receipt
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    while (attempts < maxAttempts) {
      try {
        const receipt = await fetch(
          `https://base-sepolia.blockscout.com/api/v2/transactions/${hash}`
        ).then(res => res.json());

        // Success - transaction confirmed
        if (receipt.status === 'ok' || receipt.result?.status === '1') {
          return;
        }

        // Failed - transaction reverted
        if (receipt.status === 'error' || receipt.result?.status === '0') {
          throw new Error('Transaction reverted on-chain');
        }

        // Check if transaction has a status field indicating failure
        if (receipt.result && receipt.result.status === 'error') {
          throw new Error(receipt.result.message || 'Transaction failed');
        }
      } catch (e: any) {
        // If it's a transaction failure, re-throw it
        if (
          e.message?.includes('Transaction') ||
          e.message?.includes('reverted')
        ) {
          throw e;
        }
        // Otherwise continue polling (network error, etc.)
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    // Timeout - throw error instead of silent fallback
    throw new Error(
      'Transaction confirmation timeout - please check block explorer'
    );
  };

  // Refetch balances on success
  useEffect(() => {
    if (isSuccess) {
      refetchUnderlying();
      refetchStablecoin();
      refetchAllowance();
    }
  }, [isSuccess, refetchUnderlying, refetchStablecoin, refetchAllowance]);

  const approveUnderlying = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');

    await writeContractAsync({
      address: config.underlyingToken,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [config.stablecoin, parseUnits(amount, config.decimals)],
    });
  };

  const deposit = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');

    await writeContractAsync({
      address: config.stablecoin,
      abi: RyUSDABI,
      functionName: 'deposit',
      args: [parseUnits(amount, config.decimals)],
    });
  };

  const withdraw = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');

    setIsProcessing(true);
    setCurrentStep('idle');

    try {
      const withdrawTxHash = await writeContractAsync({
        address: config.stablecoin,
        abi: RyUSDABI,
        functionName: 'withdraw',
        args: [parseUnits(amount, config.decimals)],
      });

      // Wait for withdrawal transaction to be confirmed
      await waitForTransaction(withdrawTxHash);

      // Refetch balances after successful withdrawal
      await refetchUnderlying();
      await refetchStablecoin();
      await refetchAllowance();
    } catch (error: any) {
      // Check if user rejected transaction
      if (
        error.message?.includes('User rejected') ||
        error.message?.includes('user rejected') ||
        error.message?.includes('User denied') ||
        error.code === 4001 ||
        error.code === 'ACTION_REJECTED'
      ) {
        throw new Error('Transaction rejected by user');
      }

      // Extract readable error message
      const errorMsg = error.shortMessage || error.message || 'Unknown error';
      throw new Error(`Withdrawal failed: ${errorMsg}`);
    } finally {
      // Always reset state, even on error
      setCurrentStep('idle');
      setIsProcessing(false);
    }
  };

  // Combined approve and deposit in one click
  const approveAndDeposit = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');

    setIsProcessing(true);
    try {
      const amountBigInt = parseUnits(amount, config.decimals);
      const currentAllowance = allowance
        ? BigInt(allowance.toString())
        : BigInt(0);

      // Step 1: Approve if needed
      if (currentAllowance < amountBigInt) {
        setCurrentStep('approving');
        try {
          const approveTxHash = await writeContractAsync({
            address: config.underlyingToken,
            abi: ERC20ABI,
            functionName: 'approve',
            args: [config.stablecoin, amountBigInt],
          });

          // Wait for approval transaction to be confirmed
          await waitForTransaction(approveTxHash);
          await refetchAllowance();
        } catch (approveError: any) {
          setCurrentStep('idle');
          // Check if user rejected transaction
          if (
            approveError.message?.includes('User rejected') ||
            approveError.message?.includes('user rejected') ||
            approveError.message?.includes('User denied') ||
            approveError.code === 4001 ||
            approveError.code === 'ACTION_REJECTED'
          ) {
            throw new Error('Transaction rejected by user');
          }
          throw new Error(
            `Approval failed: ${approveError.shortMessage || approveError.message || 'Unknown error'}`
          );
        }
      }

      // Step 2: Deposit
      setCurrentStep('depositing');
      try {
        const depositTxHash = await writeContractAsync({
          address: config.stablecoin,
          abi: RyUSDABI,
          functionName: 'deposit',
          args: [amountBigInt],
        });

        // Wait for deposit transaction to be confirmed
        await waitForTransaction(depositTxHash);

        if (!depositTxHash) {
          throw new Error('Transaction failed to submit');
        }

        // Refetch balances after successful deposit
        await refetchUnderlying();
        await refetchStablecoin();
        await refetchAllowance();
      } catch (depositError: any) {
        setCurrentStep('idle');
        // Check if user rejected transaction
        if (
          depositError.message?.includes('User rejected') ||
          depositError.message?.includes('user rejected') ||
          depositError.message?.includes('User denied') ||
          depositError.code === 4001 ||
          depositError.code === 'ACTION_REJECTED'
        ) {
          throw new Error('Transaction rejected by user');
        }
        // Check for contract-specific errors
        if (
          depositError.message?.includes('Only ryUSD can call') ||
          depositError.message?.includes('OnlyRyUSDCanCall')
        ) {
          throw new Error(
            'Contract error: ryIDR is not yet authorized. Please use ryUSD for now.'
          );
        }
        // Extract readable error message
        const errorMsg =
          depositError.shortMessage || depositError.message || 'Unknown error';
        throw new Error(`Mint failed: ${errorMsg}`);
      }
    } catch (error: any) {
      throw error;
    } finally {
      // Always reset state, even on error
      setCurrentStep('idle');
      setIsProcessing(false);
    }
  };

  // Check if approval is needed
  const needsApproval = (amount: string) => {
    if (!allowance) return true;
    const amountBigInt = parseUnits(amount, config.decimals);
    return BigInt(allowance.toString()) < amountBigInt;
  };

  return {
    // Balances (formatted)
    underlyingBalance: underlyingBalance
      ? formatUnits(underlyingBalance as bigint, config.decimals)
      : '0',
    stablecoinBalance: stablecoinBalance
      ? formatUnits(stablecoinBalance as bigint, config.decimals)
      : '0',
    allowance: allowance
      ? formatUnits(allowance as bigint, config.decimals)
      : '0',

    // Actions
    approveUnderlying,
    deposit,
    withdraw,
    approveAndDeposit, // Combined action
    needsApproval,

    // States
    isPending,
    isConfirming,
    isSuccess,
    error,
    currentStep, // Track approve vs deposit step
    isProcessing, // True while waiting for transaction confirmation

    // Refetch
    refetchBalances: () => {
      refetchUnderlying();
      refetchStablecoin();
      refetchAllowance();
    },
  };
}
