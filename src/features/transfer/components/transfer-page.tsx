'use client';

import PixelBlast from '@/components/PixelBlast';
import { PageContainer } from '@/components/page-container';
import { UniversalTransfer } from '@/features/transfer/components/universal-transfer';
import { fadeInItem, staggerContainer } from '@/lib/animations';
import { motion } from 'motion/react';

export default function TransferPage() {
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
        className="relative z-10 grid min-h-[calc(100vh-200px)] grid-cols-1 lg:gap-12 gap-7 lg:grid-cols-2"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {/* Left Column */}
        <motion.div
          className="flex flex-col lg:justify-center md:py-8 md:px-0 px-5"
          variants={fadeInItem}
        >
          {/* Bottom: Copywriting */}
          <div className="mt-5 lg:mt-0">
            <h2 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              TRANSFER AND EARN <br className="hidden md:block" />
              <span className="text-muted-foreground">ryBOND.</span>
            </h2>
            <p className="text-muted-foreground mt-6 text-lg font-medium md:text-xl">
              Transfer ryUSD or ryIDR instantly to anyone and earn Stream Bonds rewards
              on every transaction.
            </p>
          </div>
        </motion.div>

        {/* Right Column: Transfer Card */}
        <motion.div
          className="flex items-center justify-center lg:justify-end"
          variants={fadeInItem}
        >
          <div className="w-full max-w-md">
            <UniversalTransfer />
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
