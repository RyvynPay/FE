import CallToAction from '@/features/landing-page/components/call-to-action';
import Features from '@/features/landing-page/components/features';
import Hero from '@/features/landing-page/components/hero';
import HowItWorks from '@/features/landing-page/components/how-it-works';

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <CallToAction />
    </main>
  );
}
