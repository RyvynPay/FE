'use client';

import { PageContainer } from '@/components/page-container';
import PixelBlast from '@/components/PixelBlast';
import { fadeInItem, staggerContainer } from '@/lib/animations';
import { motion } from 'motion/react';
import PredictionBoost from './prediction-boost';

export default function BoostPage() {
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
        className="relative z-10 py-8 px-5 lg:px-0"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <motion.div variants={fadeInItem} className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-muted-foreground">
            Prediction Boost
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
            Predict ETH price movements to boost your ryBOND vesting speed.
            Higher risk, higher rewards!
          </p>
        </motion.div>

        <motion.div variants={fadeInItem}>
          <PredictionBoost />
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
