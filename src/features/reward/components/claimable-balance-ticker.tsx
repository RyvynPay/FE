import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight } from 'lucide-react';

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

  // Format with high precision (6 decimals)
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  }).format(balance);

  const dailyEarnings = flowRatePerSecond ? flowRatePerSecond * 86400 : 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
          Pending Yield
        </h3>
        <div className="text-5xl font-extrabold tracking-tight tabular-nums sm:text-6xl md:text-7xl">
          {formattedBalance}
        </div>
      </div>

      <div className="flex items-center gap-2 font-medium text-green-600 dark:text-green-400">
        <ArrowUpRight className="h-5 w-5" />
        {earningsRateApy && earningsRateApy > 0 ? (
          <span>{earningsRateApy.toFixed(2)}% APY</span>
        ) : null}
        <span className="text-muted-foreground font-normal">
          (≈${dailyEarnings.toFixed(2)} / day)
        </span>
      </div>
    </div>
  );
}
