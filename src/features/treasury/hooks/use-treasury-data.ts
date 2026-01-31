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
  unallocatedPool: 0,
  currentApy: 0,
  yieldPerSecond: 0,
  sevenDayVolume: 0,
  utilizationRate: 0,
  lastUpdated: Date.now(),
};

export function useTreasuryData(): UseTreasuryDataReturn {
  const { stats: yieldManagerStats, isLoading: isLoadingYieldManager } =
    useYieldManagerData();

  console.log('aaa', yieldManagerStats);
  const { info: treasuryInfo, isLoading: isLoadingTreasury } =
    useTreasuryManagerData();

  const [assets, setAssets] = useState<TreasuryAsset[]>([]);
  const [yieldMetrics, setYieldMetrics] = useState<YieldMetrics>(
    INITIAL_YIELD_METRICS
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (yieldManagerStats && treasuryInfo) {
      const totalAllocated = treasuryInfo.totalAllocated;
      const totalFunds = treasuryInfo.totalDeposited || 1;

      // Base chain allocation (40/30/15/10/5)
      const usycValue = totalAllocated * 0.4;
      const aaveValue = totalAllocated * 0.3;
      const aerodromeValue = totalAllocated * 0.15;
      const thetanutsValue = totalAllocated * 0.1;

      const usycPct = (usycValue / totalFunds) * 100;
      const aavePct = (aaveValue / totalFunds) * 100;
      const aerodromePct = (aerodromeValue / totalFunds) * 100;
      const thetanutsPct = (thetanutsValue / totalFunds) * 100;
      const hotWalletPct = (treasuryInfo.hotWalletBalance / totalFunds) * 100;

      const newAssets: TreasuryAsset[] = [
        {
          id: 'usyc',
          name: 'USYC Vault',
          description: 'US Treasury Bills',
          allocation: Number(usycPct.toFixed(2)),
          value: usycValue,
          apy: 5.0,
          verificationLink: 'https://ondo.finance',
          colorVar: 'var(--chart-1)',
        },
        {
          id: 'aave',
          name: 'Aave Lending',
          description: 'DeFi Lending Protocol',
          allocation: Number(aavePct.toFixed(2)),
          value: aaveValue,
          apy: 4.5,
          verificationLink: 'https://aave.com',
          colorVar: 'var(--chart-2)',
        },
        {
          id: 'aerodrome',
          name: 'Aerodrome LP',
          description: 'Liquidity Pool Strategy',
          allocation: Number(aerodromePct.toFixed(2)),
          value: aerodromeValue,
          apy: 8.0,
          verificationLink: 'https://aerodrome.finance',
          colorVar: 'var(--chart-4)',
        },
        {
          id: 'thetanuts',
          name: 'Thetanuts Options',
          description: 'Options Vault Strategy',
          allocation: Number(thetanutsPct.toFixed(2)),
          value: thetanutsValue,
          apy: 10.0,
          verificationLink: 'https://thetanuts.finance',
          colorVar: 'var(--chart-5)',
        },
        {
          id: 'buffer',
          name: 'Hot Wallet',
          description: 'Instant withdrawal liquidity',
          allocation: Number(hotWalletPct.toFixed(2)),
          value: treasuryInfo.hotWalletBalance,
          apy: 0,
          colorVar: 'var(--chart-3)',
        },
      ];

      setAssets(newAssets);

      setYieldMetrics({
        unallocatedPool: yieldManagerStats.unallocatedPool,
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
  const allLendingValue =
    (assets.find(a => a.id === 'aave')?.value || 0) +
    (assets.find(a => a.id === 'aerodrome')?.value || 0) +
    (assets.find(a => a.id === 'thetanuts')?.value || 0);

  const hotWalletValue = bufferAsset ? bufferAsset.value : 0;

  const totalTvl = assets.reduce((sum, a) => sum + a.value, 0);
  const hotWalletRatio = totalTvl > 0 ? hotWalletValue / totalTvl : 0;

  const liquidity: LiquidityState = {
    hotWallet: {
      value: hotWalletValue,
      threshold: 0.05,
      status: hotWalletRatio < 0.05 ? 'warning' : 'healthy',
    },
    lendingStrategy: {
      value: allLendingValue,
      protocol: 'Multi-Strategy',
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
