import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { CONTRACTS, BASE_SEPOLIA_CHAIN_ID } from '@/config/contracts';
import PredictionBoostABI from '@/abis/PredictionBoost.json';
import RyBONDABI from '@/abis/RyBOND.json';
import { parseUnits, formatUnits } from 'viem';
import { useMemo } from 'react';

export interface ActivePrediction {
  targetPrice: string;
  expiry: number;
  stakeAmount: string;
  tier: number;
  isAbove: boolean;
  resolved: boolean;
  won: boolean;
}

export interface UsePredictionBoostReturn {
  currentETHPrice: string;
  activePrediction: ActivePrediction | null;
  userMultiplier: string;
  requiredStake: (tier: 0 | 1 | 2) => string;
  createPrediction: (
    targetPrice: string,
    isAbove: boolean,
    expiryHours: string,
    tier: 0 | 1 | 2
  ) => Promise<void>;
  resolvePrediction: () => Promise<void>;
  resetMultiplier: () => Promise<void>;
  isCreating: boolean;
  isResolving: boolean;
  isResetting: boolean;
  canResolve: boolean;
  ryBondBalance: string;
}

export function usePredictionBoost(): UsePredictionBoostReturn {
  const { address } = useAccount();

  // Get current ETH price from REAL Chainlink
  const { data: currentPriceData } = useReadContract({
    address: CONTRACTS.predictionBoost as `0x${string}`,
    abi: PredictionBoostABI,
    functionName: 'getCurrentPrice',
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  });

  // Get user's active prediction
  const { data: predictionData, refetch: refetchPrediction } = useReadContract({
    address: CONTRACTS.predictionBoost as `0x${string}`,
    abi: PredictionBoostABI,
    functionName: 'userPredictions',
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!address,
    },
  });

  // Get user's current multiplier
  const { data: multiplierData, refetch: refetchMultiplier } = useReadContract({
    address: CONTRACTS.ryBOND as `0x${string}`,
    abi: RyBONDABI,
    functionName: 'flowMultiplier',
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!address,
    },
  });

  // Get ryBOND balance for stake calculation
  const { data: ryBondInfo, refetch: refetchRyBondInfo } = useReadContract({
    address: CONTRACTS.ryBOND as `0x${string}`,
    abi: RyBONDABI,
    functionName: 'userInfo',
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!address,
    },
  });

  const {
    writeContractAsync,
    isPending: isWritePending,
  } = useWriteContract();

  // Parse active prediction
  const activePrediction = useMemo(() => {
    if (!predictionData) return null;

    // Correct order from PredictionBoost.sol struct:
    // uint256 targetPrice, uint256 expiry, uint256 stakeAmount, StakeTier tier, bool isAbove, bool resolved, bool won
    const [targetPrice, expiry, stakeAmount, tier, isAbove, resolved, won] =
      predictionData as [bigint, bigint, bigint, number, boolean, boolean, boolean];

    // If no active prediction (stake is 0 or expiry is 0 = uninitialized)
    if (stakeAmount === BigInt(0) || expiry === BigInt(0)) return null;

    // Additional check: if stake amount is too small (less than 0.000001)
    const stakeFormatted = formatUnits(stakeAmount, 6);
    if (Number(stakeFormatted) < 0.000001) return null;

    return {
      targetPrice: (Number(targetPrice) / 1e8).toFixed(2),
      expiry: Number(expiry),
      stakeAmount: stakeFormatted,
      tier,
      isAbove,
      resolved,
      won,
    };
  }, [predictionData]);

  // Check if prediction can be resolved
  const canResolve = useMemo(() => {
    if (!activePrediction) return false;
    const now = Math.floor(Date.now() / 1000);
    return now > activePrediction.expiry && !activePrediction.resolved;
  }, [activePrediction]);

  // Calculate required stake based on tier
  const calculateRequiredStake = (tier: 0 | 1 | 2): string => {
    if (!ryBondInfo) return '0';

    const [locked] = ryBondInfo as [bigint, bigint, bigint, bigint];
    const percentages = [200, 500, 1000]; // 2%, 5%, 10%
    const required = (locked * BigInt(percentages[tier])) / BigInt(10000);

    return formatUnits(required, 6);
  };

  // Get total ryBOND balance
  const ryBondBalance = useMemo(() => {
    if (!ryBondInfo) return '0';
    const [locked, vested] = ryBondInfo as [bigint, bigint, bigint, bigint];
    return formatUnits(locked + vested, 6);
  }, [ryBondInfo]);

  const createPrediction = async (
    targetPrice: string,
    isAbove: boolean,
    expiryHours: string,
    tier: 0 | 1 | 2
  ) => {
    if (!address) throw new Error('Wallet not connected');

    const expiry = Math.floor(Date.now() / 1000) + Number(expiryHours) * 3600;

    await writeContractAsync({
      address: CONTRACTS.predictionBoost as `0x${string}`,
      abi: PredictionBoostABI,
      functionName: 'predict',
      args: [parseUnits(targetPrice, 8), isAbove, BigInt(expiry), tier],
      chainId: BASE_SEPOLIA_CHAIN_ID,
    });

    // Refetch data after creating prediction
    await Promise.all([
      refetchPrediction(),
      refetchRyBondInfo(),
    ]);
  };

  const resolvePrediction = async () => {
    if (!address) throw new Error('Wallet not connected');

    await writeContractAsync({
      address: CONTRACTS.predictionBoost as `0x${string}`,
      abi: PredictionBoostABI,
      functionName: 'resolve',
      chainId: BASE_SEPOLIA_CHAIN_ID,
    });

    // Refetch all data after resolution
    await Promise.all([
      refetchPrediction(),
      refetchMultiplier(),
      refetchRyBondInfo(),
    ]);
  };

  const resetMultiplier = async () => {
    if (!address) throw new Error('Wallet not connected');

    await writeContractAsync({
      address: CONTRACTS.predictionBoost as `0x${string}`,
      abi: PredictionBoostABI,
      functionName: 'resetMultiplier',
      chainId: BASE_SEPOLIA_CHAIN_ID,
    });

    // Refetch multiplier after reset
    await refetchMultiplier();
  };

  return {
    currentETHPrice: currentPriceData
      ? (Number(currentPriceData) / 1e8).toFixed(2)
      : '0',
    activePrediction,
    userMultiplier: multiplierData
      ? (Number(multiplierData) / 100).toFixed(2)
      : '1.00',
    requiredStake: calculateRequiredStake,
    createPrediction,
    resolvePrediction,
    resetMultiplier,
    isCreating: isWritePending,
    isResolving: isWritePending,
    isResetting: isWritePending,
    canResolve,
    ryBondBalance,
  };
}
