'use client';

import { motion, MotionValue, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const FEATURES = [
  {
    id: '01',
    title: 'REAL WORLD ASSETS',
    description:
      "Ryvyn turns 'Idle Money' into 'Working Capital' without speculative risk. Backed by real world assets.",
    color: '#4c1d95', // violet-900
  },
  {
    id: '02',
    title: 'PROFITABLE PAYMENTS',
    description:
      'Every transaction earns a reward, split between sender and receiver.',
    color: '#be185d', // pink-700
  },
  {
    id: '03',
    title: 'STREAM BONDS',
    description:
      'Sustainable yield that streams over time using Stream Bonds (ryBOND). Claim your yield as it drips every second, driving long-term retention and stability.',
    color: '#165a4c', // teal-900
  },
];

export default function Features() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const backgroundColor = useTransform(
    scrollYProgress,
    [0.3, 0.8],
    ['oklch(21% 0.006 285.885)', 'oklch(14% 0.005 285.823)']
  );

  return (
    <motion.section
      id="features"
      ref={containerRef}
      className="relative h-[300vh] bg-zinc-900"
      style={{ backgroundColor }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden p-4">
        {FEATURES.map((feature, index) => {
          // Stagger specific ranges for each card based on index
          // Overlap: Next card starts entering (0.3) as previous starts exiting (0.3)
          // Total range fits 0 - 1.0
          const rangeStart = index === 0 ? 0.1 : index * 0.25 + 0.1;
          const rangeEnd = rangeStart + 0.3;

          return (
            <Card
              key={feature.id}
              feature={feature}
              progress={scrollYProgress}
              range={[rangeStart, rangeEnd]}
              index={index}
              total={FEATURES.length}
            />
          );
        })}
      </div>
    </motion.section>
  );
}

function Card({
  feature,
  progress,
  range,
  index,
  total,
}: {
  feature: (typeof FEATURES)[0];
  progress: MotionValue<number>;
  range: [number, number];
  index: number;
  total: number;
}) {
  const [start, end] = range;
  // Durations
  // Durations
  const enterDuration = 0.07;
  const exitDuration = 0.07;

  // Timestamps
  const enterStart = start;
  const enterEnd = start + enterDuration;
  const exitStart = end - exitDuration;
  const exitEnd = end;

  // Animation values
  // Opacity: Fade in on enter, Fade out on exit
  const opacity = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    [0, 1, 1, 0]
  );

  // Scale: Small -> Normal -> Small
  const scale = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    [0.8, 1, 1, 0.8]
  );

  // Position: Bottom-Right (offset) -> Center -> Top-Left (offset)
  // X: 50% -> 0 -> -50% (Subtle diagonal)
  const x = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    ['60%', '0%', '0%', '-60%']
  );

  // Y: 30vh -> 0 -> -30vh
  const y = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    ['50vh', '0%', '0%', '-50vh']
  );

  return (
    <motion.div
      style={{
        opacity,
        scale,
        x,
        y,
        zIndex: index, // Ensure stacking order
      }}
      className="absolute flex h-[60vh] w-[90vw] max-w-[650px] flex-col justify-between rounded-3xl p-8 text-white shadow-2xl md:h-[70vh] md:w-[500px] lg:w-[35vw]"
    >
      <div
        className="absolute inset-0 rounded-3xl"
        style={{ backgroundColor: feature.color }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <h2 className="font-outfit text-4xl leading-tight font-black tracking-tight uppercase">
            {feature.title}
          </h2>
          <div className="flex size-10 items-center justify-center rounded-full border border-white/30 text-sm font-bold">
            {feature.id}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-lg leading-relaxed text-white/80">
            {feature.description}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8 flex grow items-center justify-center overflow-hidden rounded-2xl bg-black/20">
        <img
          src={`/${feature.title.toLowerCase().replace(/ /g, '-')}.png`}
          alt={feature.title}
          className="h-full w-full object-cover"
        />
      </div>
    </motion.div>
  );
}
