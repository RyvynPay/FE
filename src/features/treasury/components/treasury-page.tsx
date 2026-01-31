'use client';

import PixelBlast from '@/components/PixelBlast';
import { PageContainer } from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fadeInItem, staggerContainer } from '@/lib/animations';
import { Currency } from '@/types/currency';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useTreasuryData } from '../hooks/use-treasury-data';
import AssetAllocationChart from './asset-allocation-chart';
import TreasuryStatsCard from './treasury-stats-card';

export default function TreasuryPage() {
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const {
    usdAssets,
    idrAssets,
    usdLiquidity,
    idrLiquidity,
    yieldMetrics,
    isLoading,
  } = useTreasuryData();

  const currentAssets = currency === Currency.USD ? usdAssets : idrAssets;
  const currentLiquidity =
    currency === Currency.USD ? usdLiquidity : idrLiquidity;

  if (isLoading) {
    return (
      <PageContainer>
        {/* Top Section Skeleton */}
        <div className="grid min-h-[calc(100vh-200px)] grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="flex flex-col py-8">
            <div className="space-y-4">
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-16 w-1/2" />
              <Skeleton className="mt-6 h-8 w-2/3" />
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <div className="flex items-center justify-center px-4 lg:justify-end lg:p-6">
              <Skeleton className="h-[500px] w-[500px] rounded-full" />
            </div>
          </div>
        </div>

        {/* Second Section Skeleton */}
        <div className="py-5">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* PixelBlast Background */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden">
        <div className="relative h-full w-full">
          <PixelBlast
            variant="circle"
            pixelSize={3}
            color="#064232"
            patternScale={1.5}
            patternDensity={1}
            enableRipples={false}
            rippleSpeed={0.3}
            rippleThickness={0.1}
            rippleIntensityScale={1}
            speed={0.5}
            transparent
            edgeFade={0.5}
          />
        </div>
      </div>

      <motion.div
        className="relative z-10"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {/* Top Section: Big Text & Chart */}
        <motion.div variants={fadeInItem}>
          <div className="flex flex-col px-4 lg:px-0 lg:py-8">
            <div className="mt-12 lg:mt-0">
              <h2 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                TRANSPARENCY <br className="hidden md:block" />
                <span className="text-muted-foreground">BUILDS TRUST.</span>
              </h2>
              <p className="text-muted-foreground text-lg font-medium md:text-xl lg:mt-6">
                Verifiable on-chain assets backing every{' '}
                {currency === Currency.USD ? 'ryUSD' : 'ryIDR'} in circulation.
              </p>
            </div>
          </div>
          {/* Currency Toggle */}
          <div className="mt-4 mb-6 flex justify-center gap-2">
            <Button
              onClick={() => setCurrency(Currency.USD)}
              variant={currency === Currency.USD ? 'default' : 'outline'}
            >
              USD Vaults
            </Button>
            <Button
              onClick={() => setCurrency(Currency.IDR)}
              variant={currency === Currency.IDR ? 'default' : 'outline'}
            >
              IDR Vaults
            </Button>
          </div>
        </motion.div>

        <motion.div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-12">
            {/* Left: Chart */}
            <div className="flex flex-col justify-end">
              <div className="flex items-center justify-center px-4 lg:justify-end lg:p-6">
                <div className="w-full max-w-xl">
                  <AssetAllocationChart assets={currentAssets} />
                </div>
              </div>
            </div>

            {/* Right: Stats Card */}
            <div className="lg:h-full">
              <TreasuryStatsCard
                liquidity={currentLiquidity}
                yieldMetrics={yieldMetrics}
                assets={currentAssets}
                currency={currency}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
