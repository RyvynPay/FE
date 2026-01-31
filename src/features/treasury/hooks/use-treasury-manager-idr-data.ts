import TreasuryManagerIDRABI from '@/abis/TreasuryManagerIDR.json';
import { BASE_SEPOLIA_CHAIN_ID, CONTRACTS } from '@/config/contracts';
import { useMemo } from 'react';
import { useReadContract } from 'wagmi';

export type TreasuryManagerIDRInfo = {
  totalDeposited: number;
  totalAllocated: number;
  hotWalletBalance: number;
};

export function useTreasuryManagerIDRData() {
  const contractConfig = {
    address: CONTRACTS.treasuryManagerIDR as `0x${string}`,
    abi: TreasuryManagerIDRABI,
    chainId: BASE_SEPOLIA_CHAIN_ID,
  } as const;

  const { data: allocationInfo, isLoading: isLoadingInfo } = useReadContract({
    ...contractConfig,
    functionName: 'getAllocationInfo',
    query: {
      refetchInterval: 5000,
    },
  });

  const { data: idrxVaultAddress, isLoading: isLoadingVault } = useReadContract(
    {
      ...contractConfig,
      functionName: 'idrxVault',
    }
  );

  const info = useMemo(() => {
    const infoData = allocationInfo as [bigint, bigint, bigint] | undefined;
    return infoData
      ? {
          totalDeposited: Number(infoData[0]) / 1_000_000,
          totalAllocated: Number(infoData[1]) / 1_000_000,
          hotWalletBalance: Number(infoData[2]) / 1_000_000,
        }
      : undefined;
  }, [allocationInfo]);

  const vaultAddress = useMemo(() => {
    return idrxVaultAddress ? (idrxVaultAddress as string) : undefined;
  }, [idrxVaultAddress]);

  return {
    info,
    vaultAddress,
    isLoading: isLoadingInfo || isLoadingVault,
  };
}
