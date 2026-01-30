'use client';

import LightRays from '@/components/LightRays';
import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { useRef } from 'react';

export default function CallToAction() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Background Color Animation
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.3],
    ['oklch(0.14 0.00 286)', 'oklch(33.86% 0.064 169.36)']
  );

  return (
    <motion.section
      ref={containerRef}
      style={{ backgroundColor }}
      className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 text-center"
    >
      {/* LightRays Background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-full">
          <LightRays
            raysOrigin="top-center"
            raysColor="#f1f0e4"
            raysSpeed={1}
            lightSpread={1}
            rayLength={2}
            pulsating={false}
            fadeDistance={1}
            saturation={1}
            followMouse
            mouseInfluence={0.1}
            noiseAmount={0}
            distortion={0}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-20 select-none">
        <div className="absolute size-[400px] rounded-full border border-white/40" />
        <div className="absolute size-[600px] rounded-full border border-white/40" />
        <div className="absolute size-[800px] rounded-full border border-white/40" />
        <div className="absolute size-[1000px] rounded-full border border-white/40" />
        <div className="absolute size-[1200px] rounded-full border border-white/30" />
        <div className="absolute size-[1400px] rounded-full border border-white/30" />
        <div className="absolute size-[1600px] rounded-full border border-white/20" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, margin: '-300px' }}
        className="flex flex-col items-center"
      >
        <span className="mb-6 font-mono text-sm font-medium text-zinc-400 uppercase">
          Ready to Grow?
        </span>

        <h2 className="font-outfit text-background mb-12 text-6xl leading-[0.9] font-black tracking-tight uppercase md:text-8xl">
          Let Us Handle The
          <br />
          Hard Part
        </h2>

        <Link
          href="/mint"
          className="group bg-background relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-4 text-lg font-bold text-black transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <span className="relative z-10">Start Minting RyUSD</span>
        </Link>
      </motion.div>
    </motion.section>
  );
}
