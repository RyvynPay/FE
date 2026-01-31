import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Currency } from '@/types/currency';
import { CURRENCY_CONFIGS } from '@/config/currencies';
import { CONTRACTS, BASE_SEPOLIA_CHAIN_ID } from '@/config/contracts';
import { parseUnits, formatUnits, isAddress } from 'viem';
import RyUSDABI from '@/abis/RyUSD.json';
import RyvynHandlerABI from '@/abis/RyvynHandler.json';

interface RewardPreview {
  senderReward: string;
  receiverReward: string;
  senderShare: string;
  receiverShare: string;
}

export function useUniversalTransfer(currency: Currency) {
  const { address } = useAccount();
  const config = CURRENCY_CONFIGS[currency];

  const [rewardPreview, setRewardPreview] = useState<RewardPreview | null>(null);

  // Read balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: config.stablecoin,
    abi: RyUSDABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
  });

  const {
    writeContractAsync,
    isPending,
    data: txHash,
    error,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Refetch balance on success
  useEffect(() => {
    if (isSuccess) {
      refetchBalance();
    }
  }, [isSuccess, refetchBalance]);

  // Preview transfer rewards (shared RyvynHandler for both currencies)
  const previewRewards = async (recipient: string, amount: string) => {
    if (!address || !isAddress(recipient) || !amount || Number(amount) === 0) {
      setRewardPreview(null);
      return;
    }

    try {
      const amountBigInt = parseUnits(amount, config.decimals);

      // Fallback: Just show estimated split
      const senderRewardEst = (BigInt(amountBigInt.toString()) * BigInt(70)) / BigInt(100);
      const receiverRewardEst = (BigInt(amountBigInt.toString()) * BigInt(30)) / BigInt(100);

      setRewardPreview({
        senderReward: formatUnits(senderRewardEst, 6),
        receiverReward: formatUnits(receiverRewardEst, 6),
        senderShare: '70',
        receiverShare: '30',
      });
    } catch (err) {
      console.error('Failed to preview rewards:', err);
      setRewardPreview(null);
    }
  };

  const transfer = async (to: string, amount: string) => {
    if (!address) throw new Error('Wallet not connected');
    if (!isAddress(to)) throw new Error('Invalid recipient address');

    await writeContractAsync({
      address: config.stablecoin,  // ryUSD or ryIDR
      abi: RyUSDABI,
      functionName: 'transfer',
      args: [to, parseUnits(amount, config.decimals)],
    });
  };

  return {
    balance: balance ? formatUnits(balance as bigint, config.decimals) : '0',
    rewardPreview,
    previewRewards,
    transfer,
    isPending,
    isConfirming,
    isSuccess,
    error,
    refetchBalance,
  };
}
