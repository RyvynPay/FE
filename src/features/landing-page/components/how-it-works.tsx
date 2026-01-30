'use client';

import { motion, MotionValue, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const steps = [
  {
    id: '01',
    title: 'Deposit & Mint',
    description:
      'Deposit your idle USDC or USDT into the Ryvyn Protocol. We instantly mint ryUSD at a 1:1 ratio, giving you a liquid, yield-bearing token.',
  },
  {
    id: '02',
    title: 'RWA Deployment',
    description:
      'Your assets are automatically allocated into a diversified portfolio of Real World Assets, primarily ultra-safe US Treasury Bills and corporate bonds.',
  },
  {
    id: '03',
    title: 'Make Transactions',
    description:
      'Every transaction earns a reward, split between sender and receiver.',
  },
  {
    id: '04',
    title: 'Yield Generation',
    description:
      'The underlying assets generate consistent, risk-free interest. Unlike speculative tokens, this yield comes from established financial markets.',
  },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Title Color Animation
  // Start: zinc-300 (#d4d4d8)
  // Middle: zinc-700 (#3f3f46) when steps are visible
  // End: zinc-300 (#d4d4d8)
  const titleColor = useTransform(
    scrollYProgress,
    [0, 0.1, 0.9, 1],
    ['#d4d4d8', '#3f3f46', '#3f3f46', '#d4d4d8']
  );

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-zinc-950">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        {/* Central Title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <motion.h2
            className="font-outfit text-6xl font-black tracking-tighter uppercase md:text-8xl"
            style={{ color: titleColor }}
          >
            How Does
            <br />
            It Work?
          </motion.h2>
        </div>

        {/* Steps Container */}
        <div className="relative z-10 flex h-full w-full max-w-7xl flex-col justify-center px-6">
          {steps.map((step, index) => {
            // Divide scroll range into 4 parts
            const start = index * 0.25;
            const end = start + 0.25;

            return (
              <StepCard
                key={step.id}
                step={step}
                index={index}
                progress={scrollYProgress}
                range={[start, end]}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
  progress,
  range,
}: {
  step: (typeof steps)[0];
  index: number;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const isLeft = index % 2 === 0;
  const [start, end] = range;

  // Animation: Fade In -> Move Up slightly -> Fade Out
  // Enter: start to start + 0.1
  // Stay: start + 0.1 to end - 0.1
  // Exit: end - 0.1 to end

  const opacity = useTransform(
    progress,
    [start, start + 0.1, end - 0.1, end],
    [0, 1, 1, 0]
  );

  const y = useTransform(
    progress,
    [start, start + 0.1, end - 0.1, end],
    [50, 0, 0, -50]
  );

  return (
    <motion.div
      style={{ opacity, y }}
      className={`absolute top-1/2 w-full -translate-y-1/2 md:w-[40%] ${isLeft ? 'left-0 text-left' : 'right-0 text-right'} `}
    >
      <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
        <span
          className="stroke-text text-8xl font-black text-transparent opacity-20"
          style={{ WebkitTextStroke: '2px white' }}
        >
          {step.id}
        </span>
        <h3 className="mt-[-20px] mb-4 inline-block rounded-lg bg-zinc-900/50 px-4 py-2 text-4xl font-bold text-white backdrop-blur-sm">
          {step.title}
        </h3>
        <p className="max-w-md rounded-xl bg-black/30 p-4 text-lg font-medium text-zinc-400 backdrop-blur-sm md:text-xl">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}
