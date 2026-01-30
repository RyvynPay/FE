import { PageContainer } from '@/components/page-container';

export default function LandingPage() {
  return (
    <PageContainer>
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
          Welcome to RYVYN
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
          The first stablecoin that rewards every transaction with real-world
          asset-backed yields
        </p>
      </div>
    </PageContainer>
  );
}
