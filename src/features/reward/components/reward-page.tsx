'use client';

import PixelBlast from '@/components/PixelBlast';
import { PageContainer } from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePredictionBoost } from '@/features/gamification/hooks/use-prediction-boost';
import { fadeInItem, staggerContainer } from '@/lib/animations';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRewardData } from '../hooks/use-reward-data';
import ClaimActionCard from './claim-action-card';
import ClaimableBalanceTicker from './claimable-balance-ticker';

export default function RewardDashboard() {
  const { stream, claimTx, claimReward, isLoading } = useRewardData();
  const { userMultiplier } = usePredictionBoost();

  if (isLoading) {
    return (
      <div className="grid min-h-[calc(100vh-200px)] grid-cols-1 gap-5 md:gap-12 lg:grid-cols-2">
        <div className="flex flex-col justify-center space-y-8">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex items-center justify-center">
          <Skeleton className="h-[400px] w-full max-w-md" />
        </div>
      </div>
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
        className="relative z-10 grid min-h-[calc(100vh-200px)] grid-cols-1 gap-5 md:gap-12 lg:grid-cols-2"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {/* Left Column: Hero Text & Ticker */}
        <motion.div
          className="flex flex-col px-5 pt-5 md:py-8 lg:justify-center lg:px-0"
          variants={fadeInItem}
        >
          <div>
            <h1 className="text-muted-foreground text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              My Rewards
            </h1>
            <ClaimableBalanceTicker
              balance={stream.claimableBalance}
              earningsRateApy={stream.earningsRateApy}
              flowRatePerSecond={stream.flowRatePerSecond}
            />
            {stream.maxClaimable > 0 && (
              <div className="mt-2 space-y-2 text-sm font-medium text-neutral-500 lg:mt-4">
                <div>Total Reward: ${stream.maxClaimable.toFixed(6)}</div>
                <div>
                  Flow rate :{' '}
                  <span className="font-bold">{userMultiplier}</span>x
                </div>
                <Button>
                  <Link href={'/boost'}>Boost Flow Rate</Link>
                </Button>
              </div>
            )}
            {/* Description - shown on desktop only */}
            <div className="mt-8 hidden max-w-lg md:block">
              <p className="text-muted-foreground text-base md:text-lg">
                Your assets are generating yield imn real-time. Watch your
                balance grow every second.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Action Card */}
        <motion.div
          className="flex items-center justify-center px-5 lg:px-0"
          variants={fadeInItem}
        >
          <div className="w-full max-w-md">
            <ClaimActionCard
              balance={stream.claimableBalance}
              onClaim={claimReward}
              claimTx={claimTx}
            />
          </div>
        </motion.div>

        {/* Description - shown on mobile only, below the card */}
        <motion.div className="px-5 pb-5 lg:hidden" variants={fadeInItem}>
          <div className="max-w-lg">
            <p className="text-muted-foreground text-lg">
              Your assets are generating yield in real-time. Watch your balance
              grow every second.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
