import { useEffect, useState } from 'react';
import { useTreasuryManagerData } from './use-treasury-manager-data';
import { useYieldManagerData } from './use-yield-manager-data';

export type TreasuryAsset = {
  id: string;
  name: string;
  description: string;
  allocation: number;
  value: number;
  apy: number;
  verificationLink?: string;
  colorVar: string;
};

export type LiquidityState = {
  hotWallet: {
    value: number;
    threshold: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  lendingStrategy: {
    value: number;
    protocol: string;
  };
  totalTvl: number;
};

export type YieldMetrics = {
  unallocatedPool: number;
  currentApy: number;
  yieldPerSecond: number;
  sevenDayVolume: number;
  utilizationRate: number;
  lastUpdated: number;
};

export interface UseTreasuryDataReturn {
  assets: TreasuryAsset[];
  liquidity: LiquidityState;
  yieldMetrics: YieldMetrics;
  isLoading: boolean;
}

const INITIAL_YIELD_METRICS: YieldMetrics = {
  unallocatedPool: 12500.0,
  currentApy: 5.0,
  yieldPerSecond: 0.05,
  sevenDayVolume: 0,
  utilizationRate: 0,
  lastUpdated: Date.now(),
};

export function useTreasuryData(): UseTreasuryDataReturn {
  const { stats: yieldManagerStats, isLoading: isLoadingYieldManager } =
    useYieldManagerData();
  const { info: treasuryInfo, isLoading: isLoadingTreasury } =
    useTreasuryManagerData();

  const [assets, setAssets] = useState<TreasuryAsset[]>([]);
  const [yieldMetrics, setYieldMetrics] = useState<YieldMetrics>(
    INITIAL_YIELD_METRICS
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (yieldManagerStats && treasuryInfo) {
      // breakdown constants from contract
      // ALLOCATION_ONDO = 4000 (40%)
      // ALLOCATION_OUSG = 3500 (35%)
      // ALLOCATION_LENDING = 2000 (20%)

      const totalAllocated = treasuryInfo.totalAllocated;
      const totalFunds = treasuryInfo.totalDeposited || 1; // avoid div by 0

      // Calculate presumed allocations based on contract logic
      const usdyValue = totalAllocated * 0.4;
      const ousgValue = totalAllocated * 0.35;
      const lendingValue = totalAllocated * 0.2;

      const usdyPct = (usdyValue / totalFunds) * 100;
      const ousgPct = (ousgValue / totalFunds) * 100;
      const lendingPct = (lendingValue / totalFunds) * 100;
      const hotWalletPct = (treasuryInfo.hotWalletBalance / totalFunds) * 100;

      const newAssets: TreasuryAsset[] = [
        {
          id: 'usdy',
          name: 'Ondo USDY',
          description: 'US Dollar Yield Token',
          allocation: Number(usdyPct.toFixed(2)),
          value: usdyValue,
          apy: 5.1, // Approximate static APY for display
          verificationLink: 'https://ondo.finance/usdy',
          colorVar: 'var(--chart-1)',
        },
        {
          id: 'ousg',
          name: 'Ondo OUSG',
          description: 'Short-Term US Treasuries',
          allocation: Number(ousgPct.toFixed(2)),
          value: ousgValue,
          apy: 4.9, // Approximate static APY for display
          verificationLink: 'https://ondo.finance/ousg',
          colorVar: 'var(--chart-2)',
        },
        {
          id: 'lending',
          name: 'Lending Strategy',
          description: 'Algorithmic Lending',
          allocation: Number(lendingPct.toFixed(2)),
          value: lendingValue,
          apy: 8.5, // Target strategy APY
          verificationLink: '#',
          colorVar: 'var(--chart-4)',
        },
        {
          id: 'buffer',
          name: 'Hot Wallet',
          description: 'Immediate withdrawal liquidity',
          allocation: Number(hotWalletPct.toFixed(2)),
          value: treasuryInfo.hotWalletBalance,
          apy: 0,
          colorVar: 'var(--chart-3)',
        },
      ];

      setAssets(newAssets);

      // Yield metrics still come from YieldManager for accurate reward tracking
      setYieldMetrics({
        unallocatedPool: yieldManagerStats.unallocatedPool, // Use YieldManager's unallocated yield for budget
        currentApy: yieldManagerStats.dynamicRewardRate,
        yieldPerSecond:
          (yieldManagerStats.totalAllocated *
            (yieldManagerStats.dynamicRewardRate / 100)) /
          31536000,
        sevenDayVolume: yieldManagerStats.movingAverageVolume,
        utilizationRate: Number(
          ((totalAllocated / totalFunds) * 100).toFixed(2)
        ),
        lastUpdated: Date.now(),
      });
    }
  }, [yieldManagerStats, treasuryInfo]);

  const bufferAsset = assets.find(a => a.id === 'buffer');
  const lendingAsset = assets.find(a => a.id === 'lending');

  const hotWalletValue = bufferAsset ? bufferAsset.value : 0;
  const lendingValue = lendingAsset ? lendingAsset.value : 0;

  const totalTvl = assets.reduce((sum, a) => sum + a.value, 0);
  const hotWalletRatio = totalTvl > 0 ? hotWalletValue / totalTvl : 0;

  const liquidity: LiquidityState = {
    hotWallet: {
      value: hotWalletValue,
      threshold: 0.05,
      status: hotWalletRatio < 0.05 ? 'warning' : 'healthy',
    },
    lendingStrategy: {
      value: lendingValue,
      protocol: 'Ondo Finance',
    },
    totalTvl,
  };

  useEffect(() => {
    setIsLoading(isLoadingYieldManager || isLoadingTreasury);
  }, [isLoadingYieldManager, isLoadingTreasury]);

  return {
    assets,
    liquidity,
    yieldMetrics,
    isLoading,
  };
}
