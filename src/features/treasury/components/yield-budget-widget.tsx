import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, TrendingUp } from 'lucide-react';
import { YieldMetrics } from '../hooks/use-treasury-data';

interface YieldBudgetWidgetProps {
  metrics: YieldMetrics;
}

export default function YieldBudgetWidget({ metrics }: YieldBudgetWidgetProps) {
  return (
    <Card className="relative flex h-full flex-col overflow-hidden">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-purple-500/10 blur-2xl" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          Yield Budget
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="text-muted-foreground hover:text-foreground h-5 w-5" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <p className="mb-2 font-semibold">Smoothed Yield Budget</p>
              <p className="text-sm">
                The protocol calculates a smoothed reward rate based on the Hot
                Wallet and moving average transfer volume. This protects against
                dilution and ensures deterministic returns.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-8 pt-6">
        <div className="space-y-4">
          <p className="text-muted-foreground text-lg font-medium">
            Unallocated Yield Pool
          </p>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-3xl font-bold tracking-tighter sm:text-7xl">
              $
              {metrics.unallocatedPool.toLocaleString('en-US', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}
            </span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lg font-medium">Current Reward Rate</span>
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {metrics.currentApy.toFixed(2)}% APY
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Backed by US Treasuries
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
