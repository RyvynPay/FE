import YieldManagerABI from '@/abis/YieldManager.json';
import { BASE_SEPOLIA_CHAIN_ID, CONTRACTS } from '@/config/contracts';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import { useReadContract } from 'wagmi';

export interface YieldManagerStats {
  unallocatedPool: number; // Total yield yang belum dialokasikan (in USD)
  totalDeposited: number; // Total yield yang pernah di-deposit
  totalAllocated: number; // Total yield yang sudah dialokasikan
  movingAverageVolume: number; // 7-day moving average transfer volume
  dynamicRewardRate: number; // Reward rate dalam percentage (0-100%)
  targetUtilization: number; // Target utilization percentage (default 80%)
  currentDayVolume: number; // Volume transfer hari ini
  snapshotCount: number; // Jumlah daily snapshots yang tersimpan
}

export function useYieldManagerData() {
  // Get pool stats (all-in-one call)
  const {
    data: poolStats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
    error: statsError,
  } = useReadContract({
    address: CONTRACTS.yieldManager as `0x${string}`,
    abi: YieldManagerABI,
    functionName: 'getPoolStats',
    chainId: BASE_SEPOLIA_CHAIN_ID,
  });

  // Get target utilization
  const { data: targetUtilization, isLoading: isLoadingUtilization } =
    useReadContract({
      address: CONTRACTS.yieldManager as `0x${string}`,
      abi: YieldManagerABI,
      functionName: 'targetUtilization',
      chainId: BASE_SEPOLIA_CHAIN_ID,
    });

  // Get current day volume
  const { data: currentDayVolume, isLoading: isLoadingVolume } =
    useReadContract({
      address: CONTRACTS.yieldManager as `0x${string}`,
      abi: YieldManagerABI,
      functionName: 'currentDayVolume',
      chainId: BASE_SEPOLIA_CHAIN_ID,
    });

  // Get snapshot count
  const { data: snapshotCount, isLoading: isLoadingSnapshots } =
    useReadContract({
      address: CONTRACTS.yieldManager as `0x${string}`,
      abi: YieldManagerABI,
      functionName: 'getSnapshotsCount',
      chainId: BASE_SEPOLIA_CHAIN_ID,
    });

  // Parse pool stats - memoize to prevent infinite loops
  const stats: YieldManagerStats | null = useMemo(() => {
    if (!poolStats) return null;

    return {
      // poolStats returns: [unallocatedPool, totalDeposited, totalAllocated, movingAverage, rewardRate]
      unallocatedPool: Number(formatUnits((poolStats as any)[0] as bigint, 6)),
      totalDeposited: Number(formatUnits((poolStats as any)[1] as bigint, 6)),
      totalAllocated: Number(formatUnits((poolStats as any)[2] as bigint, 6)),
      movingAverageVolume: Number(
        formatUnits((poolStats as any)[3] as bigint, 6)
      ),
      dynamicRewardRate: Number((poolStats as any)[4] as bigint) / 100, // Convert basis points to percentage
      targetUtilization: targetUtilization
        ? Number(targetUtilization as bigint) / 100
        : 80,
      currentDayVolume: currentDayVolume
        ? Number(formatUnits(currentDayVolume as bigint, 6))
        : 0,
      snapshotCount: snapshotCount ? Number(snapshotCount as bigint) : 0,
    };
  }, [poolStats, targetUtilization, currentDayVolume, snapshotCount]);

  return {
    stats,
    isLoading:
      isLoadingStats ||
      isLoadingUtilization ||
      isLoadingVolume ||
      isLoadingSnapshots,
    error: statsError,
    refetch: refetchStats,
  };
}
