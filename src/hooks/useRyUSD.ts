import MockUSDCABI from '@/abis/MockUSDC.json';
import RyUSDABI from '@/abis/RyUSD.json';
import { BASE_SEPOLIA_CHAIN_ID, CONTRACTS } from '@/config/contracts';
import { useEffect } from 'react';
import { parseUnits } from 'viem';
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';

export function useRyUSD() {
  const { address } = useAccount();

  const { data: ryUSDBalance, refetch: refetchRyUSD } = useReadContract({
    address: CONTRACTS.ryUSD as `0x${string}`,
    abi: RyUSDABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.mockUSDC as `0x${string}`,
    abi: MockUSDCABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.ryUSD] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
  });

  const {
    writeContractAsync: approveAsync,
    isPending: isApproving,
    data: approveTxHash,
  } = useWriteContract();

  const {
    writeContractAsync: depositAsync,
    isPending: isDepositing,
    data: depositTxHash,
  } = useWriteContract();

  const {
    writeContractAsync: withdrawAsync,
    isPending: isWithdrawing,
    data: withdrawTxHash,
  } = useWriteContract();

  const { isLoading: isApprovingConfirm, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveTxHash,
    });

  const { isLoading: isDepositingConfirm, isSuccess: isDepositSuccess } =
    useWaitForTransactionReceipt({
      hash: depositTxHash,
    });

  const { isLoading: isWithdrawingConfirm, isSuccess: isWithdrawSuccess } =
    useWaitForTransactionReceipt({
      hash: withdrawTxHash,
    });

  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (isDepositSuccess) {
      refetchRyUSD();
      refetchAllowance();
    }
  }, [isDepositSuccess, refetchRyUSD, refetchAllowance]);

  useEffect(() => {
    if (isWithdrawSuccess) {
      refetchRyUSD();
      refetchAllowance();
    }
  }, [isWithdrawSuccess, refetchRyUSD, refetchAllowance]);

  const { switchChainAsync } = useSwitchChain();
  const { chain } = useAccount();

  const checkChain = async () => {
    if (chain?.id !== 5003) {
      try {
        await switchChainAsync({ chainId: BASE_SEPOLIA_CHAIN_ID });
        return true;
      } catch (error) {
        console.error('Failed to switch network:', error);
        return false;
      }
    }
    return true;
  };

  const approveUSDC = async (amount: string) => {
    const isCorrectChain = await checkChain();
    if (!isCorrectChain) return;

    return approveAsync({
      address: CONTRACTS.mockUSDC as `0x${string}`,
      abi: MockUSDCABI,
      functionName: 'approve',
      args: [CONTRACTS.ryUSD, parseUnits(amount, 6)],
      chainId: BASE_SEPOLIA_CHAIN_ID,
    });
  };

  const mintRyUSD = async (amount: string) => {
    const isCorrectChain = await checkChain();
    if (!isCorrectChain) return;

    return depositAsync({
      address: CONTRACTS.ryUSD as `0x${string}`,
      abi: RyUSDABI,
      functionName: 'deposit',
      args: [parseUnits(amount, 6)],
      chainId: BASE_SEPOLIA_CHAIN_ID,
    });
  };

  const withdrawRyUSD = async (amount: string) => {
    const isCorrectChain = await checkChain();
    if (!isCorrectChain) return;

    return withdrawAsync({
      address: CONTRACTS.ryUSD as `0x${string}`,
      abi: RyUSDABI,
      functionName: 'withdraw',
      args: [parseUnits(amount, 6)],
      chainId: BASE_SEPOLIA_CHAIN_ID,
    });
  };

  return {
    ryUSDBalance,
    allowance,
    approveUSDC,
    mintRyUSD,
    withdrawRyUSD,
    isApproving: isApproving || isApprovingConfirm,
    isDepositing: isDepositing || isDepositingConfirm,
    isWithdrawing: isWithdrawing || isWithdrawingConfirm,
    approveTxHash,
    depositTxHash,
    withdrawTxHash,
  };
}
