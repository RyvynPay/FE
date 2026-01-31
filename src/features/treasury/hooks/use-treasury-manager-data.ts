import TreasuryManagerABI from '@/abis/TreasuryManager.json';
import { BASE_SEPOLIA_CHAIN_ID, CONTRACTS } from '@/config/contracts';
import { useMemo } from 'react';
import { useReadContract } from 'wagmi';

export type TreasuryManagerInfo = {
  totalDeposited: number;
  totalAllocated: number;
  hotWalletBalance: number;
};

export type TreasuryManagerStrategies = {
  usdy: string;
  ousg: string;
  lending: string;
  reserve: string;
};

export function useTreasuryManagerData() {
  const contractConfig = {
    address: CONTRACTS.treasuryManager as `0x${string}`,
    abi: TreasuryManagerABI,
    chainId: BASE_SEPOLIA_CHAIN_ID,
  } as const;

  const { data: allocationInfo, isLoading: isLoadingInfo } = useReadContract({
    ...contractConfig,
    functionName: 'getAllocationInfo',
    query: {
      refetchInterval: 5000,
    },
  });

  const { data: strategies, isLoading: isLoadingStrategies } = useReadContract({
    ...contractConfig,
    functionName: 'getStrategies',
  });

  // Parse allocation info
  // Returns (totalDeposited, totalAllocated, hotWallet)
  const info = useMemo(() => {
    const infoData = allocationInfo as [bigint, bigint, bigint] | undefined;
    return infoData
      ? {
          totalDeposited: Number(infoData[0]) / 1_000_000, // USDC 6 decimals
          totalAllocated: Number(infoData[1]) / 1_000_000,
          hotWalletBalance: Number(infoData[2]) / 1_000_000,
        }
      : undefined;
  }, [allocationInfo]);

  const strategyAddrs = useMemo(() => {
    const strategiesData = strategies as
      | [string, string, string, string]
      | undefined;
    return strategiesData
      ? {
          usdy: strategiesData[0],
          ousg: strategiesData[1],
          lending: strategiesData[2],
          reserve: strategiesData[3],
        }
      : undefined;
  }, [strategies]);

  return {
    info,
    strategies: strategyAddrs,
    isLoading: isLoadingInfo || isLoadingStrategies,
  };
}
