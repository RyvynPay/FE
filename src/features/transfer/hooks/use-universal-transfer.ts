import RyUSDABI from '@/abis/RyUSD.json';
import RyvynHandlerABI from '@/abis/RyvynHandler.json';
import { BASE_SEPOLIA_CHAIN_ID, CONTRACTS } from '@/config/contracts';
import { CURRENCY_CONFIGS } from '@/config/currencies';
import { config as wagmiConfig } from '@/lib/wagmi';
import { Currency } from '@/types/currency';
import { useState } from 'react';
import { formatUnits, isAddress, parseUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { readContract } from 'wagmi/actions';

interface RewardPreview {
  senderReward: string;
  receiverReward: string;
  senderShare: string;
  receiverShare: string;
}

export function useUniversalTransfer(currency: Currency) {
  const { address } = useAccount();
  const config = CURRENCY_CONFIGS[currency];

  const [rewardPreview, setRewardPreview] = useState<RewardPreview | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Read balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: config.stablecoin,
    abi: RyUSDABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
  });

  const { writeContractAsync, isPending } = useWriteContract();

  // Helper to wait for transaction confirmation
  const waitForTransaction = async (
    hash: `0x${string}` | undefined
  ): Promise<void> => {
    if (!hash) return;

    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      try {
        const receipt = await fetch(
          `https://base-sepolia.blockscout.com/api/v2/transactions/${hash}`
        ).then(res => res.json());

        if (receipt.status === 'ok' || receipt.result?.status === '1') {
          return;
        }

        if (receipt.status === 'error' || receipt.result?.status === '0') {
          throw new Error('Transaction reverted on-chain');
        }

        if (receipt.result && receipt.result.status === 'error') {
          throw new Error(receipt.result.message || 'Transaction failed');
        }
      } catch (e: any) {
        if (
          e.message?.includes('Transaction') ||
          e.message?.includes('reverted')
        ) {
          throw e;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error(
      'Transaction confirmation timeout - please check block explorer'
    );
  };

  const previewRewards = async (recipient: string, amount: string) => {
    if (!address || !isAddress(recipient) || !amount || Number(amount) === 0) {
      setRewardPreview(null);
      return;
    }

    try {
      const amountBigInt = parseUnits(amount, config.decimals);

      const result = (await readContract(wagmiConfig, {
        address: CONTRACTS.ryvynHandler,
        abi: RyvynHandlerABI,
        functionName: 'previewTransferRewards',
        args: [address, config.stablecoin, amountBigInt],
        chainId: BASE_SEPOLIA_CHAIN_ID,
      })) as [bigint, bigint, bigint, bigint];

      const [senderReward, receiverReward, senderShare, receiverShare] = result;

      setRewardPreview({
        senderReward: formatUnits(senderReward, 6),
        receiverReward: formatUnits(receiverReward, 6),
        senderShare: senderShare.toString(),
        receiverShare: receiverShare.toString(),
      });
    } catch (err) {
      console.error('Failed to preview rewards:', err);
      setRewardPreview(null);
    }
  };

  const transfer = async (to: string, amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    if (!isAddress(to)) throw new Error('Invalid recipient address');

    setIsProcessing(true);

    try {
      const transferTxHash = await writeContractAsync({
        address: config.stablecoin, // ryUSD or ryIDR
        abi: RyUSDABI,
        functionName: 'transfer',
        args: [to, parseUnits(amount, config.decimals)],
      });

      // Wait for transfer transaction to be confirmed
      await waitForTransaction(transferTxHash);

      // Refetch balance after successful transfer
      await refetchBalance();
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
      throw new Error(`Transfer failed: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    balance: balance ? formatUnits(balance as bigint, config.decimals) : '0',
    rewardPreview,
    previewRewards,
    transfer,
    isPending,
    isProcessing,
    isLoading: isPending || isProcessing,
    refetchBalance,
  };
}
