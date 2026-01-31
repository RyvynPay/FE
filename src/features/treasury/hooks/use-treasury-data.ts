import { useEffect, useState } from 'react';
import { useTreasuryManagerData } from './use-treasury-manager-data';
import { useTreasuryManagerIDRData } from './use-treasury-manager-idr-data';
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
  usdAssets: TreasuryAsset[];
  idrAssets: TreasuryAsset[];
  usdLiquidity: LiquidityState;
  idrLiquidity: LiquidityState;
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

  const { info: treasuryInfo, isLoading: isLoadingTreasury } =
    useTreasuryManagerData();
  const { info: treasuryIDRInfo, isLoading: isLoadingTreasuryIDR } =
    useTreasuryManagerIDRData();

  const [usdAssets, setUsdAssets] = useState<TreasuryAsset[]>([]);
  const [idrAssets, setIdrAssets] = useState<TreasuryAsset[]>([]);
  const [yieldMetrics, setYieldMetrics] = useState<YieldMetrics>(
    INITIAL_YIELD_METRICS
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (yieldManagerStats && treasuryInfo) {
      const totalAllocated = treasuryInfo.totalAllocated;
      const totalFunds = treasuryInfo.totalDeposited || 1;

      // USD vaults (40/30/15/10/5)
      const usycValue = totalAllocated * 0.4;
      const aaveValue = totalAllocated * 0.3;
      const aerodromeValue = totalAllocated * 0.15;
      const thetanutsValue = totalAllocated * 0.1;

      const usycPct = (usycValue / totalFunds) * 100;
      const aavePct = (aaveValue / totalFunds) * 100;
      const aerodromePct = (aerodromeValue / totalFunds) * 100;
      const thetanutsPct = (thetanutsValue / totalFunds) * 100;
      const hotWalletPct = (treasuryInfo.hotWalletBalance / totalFunds) * 100;

      const newUsdAssets: TreasuryAsset[] = [
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

      setUsdAssets(newUsdAssets);

      // IDR vault (95/5)
      if (treasuryIDRInfo) {
        const idrTotalFunds = treasuryIDRInfo.totalDeposited || 1;
        const idrxValue = treasuryIDRInfo.totalAllocated * 0.95;
        const idrHotWalletValue = treasuryIDRInfo.hotWalletBalance;

        const idrxPct = (idrxValue / idrTotalFunds) * 100;
        const idrHotWalletPct = (idrHotWalletValue / idrTotalFunds) * 100;

        const newIdrAssets: TreasuryAsset[] = [
          {
            id: 'idrx',
            name: 'IDRX Vault',
            description: 'Indonesian Rupiah Yield',
            allocation: Number(idrxPct.toFixed(2)),
            value: idrxValue,
            apy: 3.5,
            verificationLink: '#',
            colorVar: 'var(--chart-1)',
          },
          {
            id: 'idr-buffer',
            name: 'Hot Wallet',
            description: 'Instant withdrawal liquidity',
            allocation: Number(idrHotWalletPct.toFixed(2)),
            value: idrHotWalletValue,
            apy: 0,
            colorVar: 'var(--chart-3)',
          },
        ];

        setIdrAssets(newIdrAssets);
      }

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
  }, [yieldManagerStats, treasuryInfo, treasuryIDRInfo]);

  // USD Liquidity
  const usdBufferAsset = usdAssets.find(
    (a: TreasuryAsset) => a.id === 'buffer'
  );
  const usdAllLendingValue =
    (usdAssets.find((a: TreasuryAsset) => a.id === 'aave')?.value || 0) +
    (usdAssets.find((a: TreasuryAsset) => a.id === 'aerodrome')?.value || 0) +
    (usdAssets.find((a: TreasuryAsset) => a.id === 'thetanuts')?.value || 0);

  const usdHotWalletValue = usdBufferAsset ? usdBufferAsset.value : 0;
  const usdTotalTvl = usdAssets.reduce(
    (sum: number, a: TreasuryAsset) => sum + a.value,
    0
  );
  const usdHotWalletRatio =
    usdTotalTvl > 0 ? usdHotWalletValue / usdTotalTvl : 0;

  const usdLiquidity: LiquidityState = {
    hotWallet: {
      value: usdHotWalletValue,
      threshold: 0.05,
      status: usdHotWalletRatio < 0.05 ? 'warning' : 'healthy',
    },
    lendingStrategy: {
      value: usdAllLendingValue,
      protocol: 'Multi-Strategy',
    },
    totalTvl: usdTotalTvl,
  };

  // IDR Liquidity
  const idrBufferAsset = idrAssets.find(
    (a: TreasuryAsset) => a.id === 'idr-buffer'
  );
  const idrVaultValue =
    idrAssets.find((a: TreasuryAsset) => a.id === 'idrx')?.value || 0;

  const idrHotWalletValue = idrBufferAsset ? idrBufferAsset.value : 0;
  const idrTotalTvl = idrAssets.reduce(
    (sum: number, a: TreasuryAsset) => sum + a.value,
    0
  );
  const idrHotWalletRatio =
    idrTotalTvl > 0 ? idrHotWalletValue / idrTotalTvl : 0;

  const idrLiquidity: LiquidityState = {
    hotWallet: {
      value: idrHotWalletValue,
      threshold: 0.05,
      status: idrHotWalletRatio < 0.05 ? 'warning' : 'healthy',
    },
    lendingStrategy: {
      value: idrVaultValue,
      protocol: 'IDRX Vault',
    },
    totalTvl: idrTotalTvl,
  };

  useEffect(() => {
    setIsLoading(
      isLoadingYieldManager || isLoadingTreasury || isLoadingTreasuryIDR
    );
  }, [isLoadingYieldManager, isLoadingTreasury, isLoadingTreasuryIDR]);

  return {
    usdAssets,
    idrAssets,
    usdLiquidity,
    idrLiquidity,
    yieldMetrics,
    isLoading,
  };
}
