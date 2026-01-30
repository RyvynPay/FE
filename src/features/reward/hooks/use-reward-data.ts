import RyBONDABI from '@/abis/RyBOND.json';
import { BASE_SEPOLIA_CHAIN_ID, CONTRACTS } from '@/config/contracts';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { formatUnits } from 'viem';
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';

// --- Types ---

export type RewardStream = {
  claimableBalance: number; // Current available USD value
  earningsRateApy: number; // Static APY
  flowRatePerSecond: number; // USD earning per second
  maxClaimable: number; // Max possible reward (vested + locked)
  lastUpdated: number; // Timestamp
  isStreaming: boolean; // Active state
};

export type ClaimTransaction = {
  status: 'idle' | 'pending' | 'success' | 'error';
  txHash?: string;
  amountClaimed?: number;
  timestamp?: number;
};

export interface UseRewardDataReturn {
  stream: RewardStream;
  claimTx: ClaimTransaction;
  claimReward: () => Promise<void>;
  isLoading: boolean;
}

// --- Hook ---

export function useRewardData(): UseRewardDataReturn {
  const { address, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [stream, setStream] = useState<RewardStream>({
    claimableBalance: 0,
    earningsRateApy: 0,
    flowRatePerSecond: 0,
    maxClaimable: 0,
    lastUpdated: Date.now(),
    isStreaming: true,
  });
  const [claimTx, setClaimTx] = useState<ClaimTransaction>({ status: 'idle' });
  const hasShownSuccessToast = useRef(false);

  const {
    data: pendingBalance,
    refetch: refetchPending,
    isLoading: isLoadingBalance,
  } = useReadContract({
    address: CONTRACTS.ryBOND as `0x${string}`,
    abi: RyBONDABI,
    functionName: 'pendingRyBond',
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!address,
    },
  });

  // Read user-specific flow rate for vesting (per second)
  const { data: flowRateData } = useReadContract({
    address: CONTRACTS.ryBOND as `0x${string}`,
    abi: RyBONDABI,
    functionName: 'getFlowRate',
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!address,
    },
  });

  // Read userInfo to get total max cap (vested + locked)
  const { data: userInfoData, refetch: refetchUserInfo } = useReadContract({
    address: CONTRACTS.ryBOND as `0x${string}`,
    abi: RyBONDABI,
    functionName: 'userInfo',
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!address,
    },
  });

  // Claim function
  const {
    writeContract: claim,
    isPending: isClaiming,
    data: claimTxHash,
    error: claimError,
  } = useWriteContract();

  const {
    isLoading: isClaimConfirming,
    isSuccess: isClaimSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  // Update stream state when balance changes from contract
  useEffect(() => {
    if (pendingBalance !== undefined) {
      const balanceVal = Number(formatUnits(pendingBalance as bigint, 6));

      let flowRateVal = 0;
      if (flowRateData) {
        flowRateVal = Number(formatUnits(flowRateData as bigint, 24));
      }

      setStream(prev => ({
        ...prev,
        claimableBalance: balanceVal,
        earningsRateApy: 0,
        flowRatePerSecond: flowRateVal,
        lastUpdated: Date.now(),
        isStreaming: flowRateVal > 0,
      }));
    }
  }, [pendingBalance, flowRateData, address]);

  // Update max claimable from userInfo
  useEffect(() => {
    if (userInfoData) {
      const info = userInfoData as any;
      const locked = info.lockedBalance || info[0];
      const vested = info.vestedBalance || info[1];

      if (locked !== undefined && vested !== undefined) {
        const totalMax = Number(formatUnits(locked + vested, 6)); // Using 6 decimals as established
        setStream(prev => ({
          ...prev,
          maxClaimable: totalMax,
        }));
      }
    }
  }, [userInfoData]);

  // Client-side streaming: update balance every second based on flow rate
  useEffect(() => {
    if (!stream.isStreaming || stream.flowRatePerSecond <= 0) return;

    const interval = setInterval(() => {
      setStream(prev => {
        const nextBalance = prev.claimableBalance + prev.flowRatePerSecond;
        const cappedBalance =
          prev.maxClaimable > 0 && nextBalance > prev.maxClaimable
            ? prev.maxClaimable
            : nextBalance;

        return {
          ...prev,
          claimableBalance: cappedBalance,
          lastUpdated: Date.now(),
          // Stop streaming if we hit the cap
          isStreaming:
            prev.maxClaimable > 0
              ? cappedBalance < prev.maxClaimable
              : prev.isStreaming,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stream.isStreaming, stream.flowRatePerSecond]);

  // Handle claim success
  useEffect(() => {
    if (isClaimSuccess && claimTxHash && !hasShownSuccessToast.current) {
      hasShownSuccessToast.current = true;

      const claimedAmount = stream.claimableBalance;

      setClaimTx({
        status: 'success',
        txHash: claimTxHash,
        amountClaimed: claimedAmount,
        timestamp: Date.now(),
      });

      // Immediately reset balance to 0 after claim
      setStream(prev => ({
        ...prev,
        claimableBalance: 0,
        isStreaming: false, // Stop streaming temporarily
        lastUpdated: Date.now(),
      }));

      toast.success('ryUSD claimed successfully! Check your wallet.');

      // Refetch to get accurate balance from blockchain
      refetchPending();
      refetchUserInfo();

      // Reset to idle after 5 seconds and resume streaming
      setTimeout(() => {
        setClaimTx({ status: 'idle' });
        // hasShownSuccessToast.current = false; // MOVED to claimReward to prevent loop

        // Resume streaming if there's any new balance
        setStream(prev => ({
          ...prev,
          isStreaming: prev.claimableBalance > 0,
        }));
      }, 5000);
    }
  }, [
    isClaimSuccess,
    claimTxHash,
    stream.claimableBalance,
    refetchPending,
    refetchUserInfo,
  ]);

  // Handle claim pending
  useEffect(() => {
    if (isClaiming || isClaimConfirming) {
      setClaimTx({ status: 'pending' });
    }
  }, [isClaiming, isClaimConfirming]);

  // Handle claim errors
  useEffect(() => {
    if (claimError || receiptError) {
      const error = claimError || receiptError;
      const errorMessage = error?.message || 'Claim failed';

      console.error('Claim error:', error);
      // Detailed logging for debugging
      if (error && 'cause' in error)
        console.error('Error cause:', (error as any).cause);
      if (error && 'details' in error)
        console.error('Error details:', (error as any).details);
      if (error && 'shortMessage' in error)
        console.error('Short message:', (error as any).shortMessage);

      // Check for specific error types
      if (errorMessage.includes('out of gas')) {
        toast.error(
          'Claim failed: Vault may not have sufficient ryUSD. Please contact admin.'
        );
      } else if (errorMessage.includes('nothing to claim')) {
        toast.error('No rewards available to claim');
      } else if (errorMessage.includes('insufficient balance')) {
        toast.error('Vault has insufficient balance. Please try again later.');
      } else {
        toast.error('Claim failed. Please try again or contact support.');
      }

      setClaimTx({ status: 'error' });

      setTimeout(() => {
        setClaimTx({ status: 'idle' });
      }, 3000);
    }
  }, [claimError, receiptError]);

  const claimReward = async () => {
    // Reset intent for new claim to allow success logic to trigger again
    hasShownSuccessToast.current = false;

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (claimTx.status === 'pending') {
      toast.info('Transaction already in progress. Please wait...');
      return;
    }

    if (stream.claimableBalance <= 0) {
      toast.error('No rewards to claim');
      return;
    }

    if (chain?.id !== 5003) {
      try {
        await switchChainAsync({ chainId: BASE_SEPOLIA_CHAIN_ID });
      } catch (error) {
        console.error('Failed to switch network:', error);
        toast.error('Failed to switch network. Please switch manually.');
        return;
      }
    }

    try {
      toast.info('Initiating claim transaction...');
      claim({
        address: CONTRACTS.ryBOND as `0x${string}`,
        abi: RyBONDABI,
        functionName: 'claim',
        chainId: BASE_SEPOLIA_CHAIN_ID,
        // Let wagmi estimate gas automatically instead of manually setting it
      });
    } catch (error) {
      console.error('Claim failed:', error);
      toast.error('Claim failed. Please try again.');
      setClaimTx({ status: 'error' });
      setTimeout(() => {
        setClaimTx({ status: 'idle' });
      }, 3000);
    }
  };

  return {
    stream,
    claimTx,
    claimReward,
    isLoading: isLoadingBalance,
  };
}
