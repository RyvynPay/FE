import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingDown, TrendingUp } from 'lucide-react';
import { useYieldManagerData } from '../hooks/use-yield-manager-data';

export default function RewardFormulaBreakdown() {
  const { stats, isLoading } = useYieldManagerData();

  if (isLoading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dynamic Reward Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="bg-muted h-4 w-3/4 rounded"></div>
            <div className="bg-muted h-4 w-1/2 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const utilizableYield =
    (stats.unallocatedPool * stats.targetUtilization) / 100;
  const volumeImpact =
    stats.movingAverageVolume > 0
      ? ((stats.unallocatedPool / stats.movingAverageVolume) * 100).toFixed(2)
      : '0.00';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="text-primary h-5 w-5" />
          Dynamic Reward Calculation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formula Display */}
        <div className="bg-muted/50 rounded-lg border p-4">
          <p className="text-muted-foreground mb-2 text-sm font-medium">
            Formula:
          </p>
          <div className="font-mono text-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-primary font-bold">RewardRate</span>
              <span>=</span>
            </div>
            <div className="border-primary/50 ml-4 border-l-2 pl-4">
              <div className="flex flex-col">
                <span className="text-blue-600 dark:text-blue-400">
                  (UnallocatedYieldPool × TargetUtilization)
                </span>
                <span className="text-muted-foreground">÷</span>
                <span className="text-orange-600 dark:text-orange-400">
                  MovingAverageVolume<sub>7day</sub>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Values */}
        <div className="space-y-3">
          <p className="text-sm font-semibold">Current Values:</p>

          {/* Unallocated Pool */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-sm">Unallocated Pool</span>
            </div>
            <span className="font-mono font-semibold">
              $
              {stats.unallocatedPool.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Target Utilization */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <span className="text-sm">Target Utilization</span>
            </div>
            <span className="font-mono font-semibold">
              {stats.targetUtilization}%
            </span>
          </div>

          {/* Utilizable Yield */}
          <div className="flex items-center justify-between rounded-lg border border-green-500/50 bg-green-500/10 p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">Utilizable Yield</span>
            </div>
            <span className="font-mono font-semibold text-green-600 dark:text-green-400">
              $
              {utilizableYield.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Moving Average Volume */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
              <span className="text-sm">7-Day Avg Volume</span>
            </div>
            <span className="font-mono font-semibold">
              $
              {stats.movingAverageVolume.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Daily Snapshots */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-500"></div>
              <span className="text-sm">Daily Snapshots</span>
            </div>
            <span className="font-mono font-semibold">
              {stats.snapshotCount}/7 days
            </span>
          </div>
        </div>

        {/* Result */}
        <div className="border-primary bg-primary/5 rounded-lg border-2 p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Dynamic Reward Rate</span>
            <span className="text-primary text-2xl font-bold">
              {stats.dynamicRewardRate.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-muted/50 space-y-2 rounded-lg p-4">
          <p className="text-sm font-semibold">How it works:</p>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li className="flex items-start gap-2">
              {stats.movingAverageVolume > stats.unallocatedPool ? (
                <TrendingDown className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              ) : (
                <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
              )}
              <span>
                <strong>Volume Impact:</strong> Current pool can support{' '}
                <strong>{volumeImpact}%</strong> of 7-day average volume
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">•</span>
              <span>
                When transfer volume <strong>decreases</strong>, reward rate{' '}
                <strong className="text-green-600">increases</strong> (more
                yield per transaction)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">•</span>
              <span>
                When transfer volume <strong>increases</strong>, reward rate{' '}
                <strong className="text-orange-600">decreases</strong>{' '}
                (distributed across more transactions)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-500">•</span>
              <span>
                Target Utilization ({stats.targetUtilization}%) keeps{' '}
                {100 - stats.targetUtilization}% in reserve for protocol
                stability
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
