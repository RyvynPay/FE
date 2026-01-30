import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, Droplets } from 'lucide-react';
import { LiquidityState } from '../hooks/use-treasury-data';
import { cn } from '@/lib/utils';

interface LiquidityMonitorProps {
  liquidity: LiquidityState;
}

export default function LiquidityMonitor({ liquidity }: LiquidityMonitorProps) {
  const { hotWallet, lendingStrategy, totalTvl } = liquidity;

  // Calculate percentages
  const hotWalletPercent = (hotWallet.value / totalTvl) * 100;
  const lendingPercent = (lendingStrategy.value / totalTvl) * 100;

  // Status Logic
  const isWarning = hotWallet.status !== 'healthy';
  const statusColor = isWarning ? 'text-amber-500' : 'text-green-500';
  const StatusIcon = isWarning ? AlertTriangle : CheckCircle2;

  // Custom Progress Color
  const progressColorClass = isWarning ? 'bg-amber-500' : 'bg-green-500';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Droplets className="h-5 w-5 text-blue-500" />
          Liquidity Monitor
        </CardTitle>
        <StatusIcon className={cn('h-5 w-5', statusColor)} />
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Hot Wallet */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Hot Wallet (Tangki Kecil)</span>
            <span className="text-muted-foreground">
              ${hotWallet.value.toLocaleString()}
            </span>
          </div>
          {/* We need to override the inner indicator color of Progress. 
              Since Shadcn Progress uses a div with bg-primary, we can't easily override it via props without creating a custom component 
              or using the [&>div]: syntax if we know the structure.
              Shadcn structure: Root -> Indicator.
           */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
             <div 
                className={cn("h-full w-full flex-1 transition-all", progressColorClass)} 
                style={{ transform: `translateX(-${100 - (hotWalletPercent || 0)}%)` }}
             />
          </div>
          <p className="text-xs text-muted-foreground">
            Target: &gt;5% (Current: {hotWalletPercent.toFixed(1)}%)
          </p>
        </div>

        {/* Lending Strategy */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Lending Strategy (Tangki Besar)</span>
            <span className="text-muted-foreground">
              ${lendingStrategy.value.toLocaleString()}
            </span>
          </div>
           <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
             <div 
                className="bg-primary h-full w-full flex-1 transition-all" 
                style={{ transform: `translateX(-${100 - (lendingPercent || 0)}%)` }}
             />
          </div>
          <p className="text-xs text-muted-foreground">
            Deployed to {lendingStrategy.protocol}
          </p>
        </div>

        {/* Redemption Status */}
        <div className={cn("rounded-lg border p-3 text-sm", isWarning ? "bg-amber-500/10 border-amber-500/20" : "bg-green-500/10 border-green-500/20")}>
            <p className="font-semibold mb-1">Redemption Status</p>
            <p className="text-muted-foreground">
                {isWarning 
                    ? "High demand. Rebalancing triggered." 
                    : "Instant redemptions available."}
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
