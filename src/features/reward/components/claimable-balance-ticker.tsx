import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

interface ClaimableBalanceTickerProps {
  balance: number;
  earningsRateApy?: number;
  flowRatePerSecond?: number;
  isLoading?: boolean;
}

export default function ClaimableBalanceTicker({
  balance,
  earningsRateApy,
  flowRatePerSecond,
  isLoading,
}: ClaimableBalanceTickerProps) {
  if (isLoading) {
    return <Skeleton className="h-16 w-64" />;
  }

  // Format with 8 decimals for better visibility of small amounts
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  }).format(balance);

  // Format per-second rate with 10 decimals for precision
  const formattedPerSecond = flowRatePerSecond
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 10,
        maximumFractionDigits: 10,
      }).format(flowRatePerSecond)
    : '$0.0000000000';

  return (
    <div className="space-y-4">
      <div className="my-3">
        <h3 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
          Pending Yield
        </h3>
        <div className="text-5xl font-extrabold tracking-tight tabular-nums sm:text-6xl md:text-7xl">
          {formattedBalance}
        </div>
      </div>

      <div className="flex items-center gap-3 font-medium text-green-600 dark:text-green-400">
        <TrendingUp className="h-5 w-5 animate-pulse" />
        <div className="flex items-baseline gap-2">
          <span className="text-sm md:text-lg">{formattedPerSecond}</span>
          <span className="text-muted-foreground text-sm font-normal">
            / sec
          </span>
        </div>
      </div>

      {earningsRateApy && earningsRateApy > 0 ? (
        <p className="text-muted-foreground text-xs">
          Streaming at {earningsRateApy.toFixed(2)}% APY
        </p>
      ) : null}
    </div>
  );
}
