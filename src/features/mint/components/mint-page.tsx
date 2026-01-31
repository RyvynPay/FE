'use client';

import PixelBlast from '@/components/PixelBlast';
import { PageContainer } from '@/components/page-container';
import { fadeInItem, staggerContainer } from '@/lib/animations';
import { motion } from 'motion/react';
import { UniversalMint } from './universal-mint';

export default function MintPage() {
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
        className="relative z-10 grid min-h-[calc(100vh-200px)] grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-12"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {/* Left Column */}
        <motion.div
          className="flex flex-col justify-center px-5 md:px-0 md:py-8"
          variants={fadeInItem}
        >
          {/* Bottom: Copywriting */}
          <div className="mt-5 lg:mt-0">
            <h2 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Mint Yield-Bearing <br className="hidden md:block" />
              <span className="text-muted-foreground">Stablecoins.</span>
            </h2>
            <p className="text-muted-foreground mt-6 text-lg font-medium md:text-xl">
              Mint ryUSD or ryIDR instantly and start earning sustainable,
              treasury-backed yield. Choose USD or IDR exposure.
            </p>
          </div>
        </motion.div>

        {/* Right Column: Mint Card */}
        <motion.div
          className="flex items-center justify-center lg:justify-end"
          variants={fadeInItem}
        >
          <div className="w-full max-w-md">
            <UniversalMint />
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
