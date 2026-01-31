'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CheckCircle2,
  Clock,
  Loader2,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { ActivePrediction } from '../hooks/use-prediction-boost';

const TIER_CONFIG = [
  { name: 'LOW', stake: '2%' },
  { name: 'MEDIUM', stake: '5%' },
  { name: 'HIGH', stake: '10%' },
] as const;

// Format timestamp to UTC+7 (Jakarta time)
function formatToJakartaTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);

  // Convert to Jakarta time (UTC+7)
  const jakartaTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  // Format: "31 Jan 2026, 14:30 WIB"
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  const formatted = jakartaTime.toLocaleString('en-GB', options);
  return `${formatted} WIB`;
}

interface ActivePredictionCardProps {
  activePrediction: ActivePrediction;
  canResolve: boolean;
  isResolving: boolean;
  onResolve: () => void;
  currentETHPrice: string;
}

export default function ActivePredictionCard({
  activePrediction,
  canResolve,
  isResolving,
  onResolve,
  currentETHPrice,
}: ActivePredictionCardProps) {
  const tierInfo = TIER_CONFIG[activePrediction.tier] || TIER_CONFIG[0];

  // For resolved predictions, use the won field from the contract
  // For active predictions, calculate current position based on price
  const currentPrice = Number(currentETHPrice);
  const targetPrice = Number(activePrediction.targetPrice);
  const isWinning = activePrediction.resolved
    ? activePrediction.won
    : activePrediction.isAbove
      ? currentPrice > targetPrice
      : currentPrice < targetPrice;

  // Calculate multiplier changes based on tier
  const getMultiplierChange = (tier: number, won: boolean) => {
    if (won) {
      // Win multipliers: LOW 1.1x, MEDIUM 1.25x, HIGH 1.5x
      const winMults = [110, 125, 150];
      return {
        from: 100,
        to: winMults[tier],
        display: `1.0x → ${(winMults[tier] / 100).toFixed(2)}x`,
      };
    } else {
      // Lose multiplier: 0.9x for all tiers
      return { from: 100, to: 90, display: '1.0x → 0.9x' };
    }
  };

  return (
    <Card
      className={
        canResolve
          ? 'border-primary'
          : activePrediction.resolved
            ? isWinning
              ? 'border-primary'
              : 'border-destructive'
            : ''
      }
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {activePrediction.resolved
              ? isWinning
                ? 'Prediction Won!'
                : 'Prediction Lost'
              : 'Active Prediction'}
          </CardTitle>
          <Badge
            variant={
              canResolve
                ? 'default'
                : activePrediction.resolved
                  ? isWinning
                    ? 'default'
                    : 'destructive'
                  : 'secondary'
            }
          >
            {canResolve
              ? 'Ready to Resolve'
              : activePrediction.resolved
                ? isWinning
                  ? 'Won'
                  : 'Lost'
                : 'Active'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Final Outcome (for resolved predictions) */}
        {activePrediction.resolved && (
          <div
            className={`rounded-lg border p-4 ${
              isWinning
                ? 'bg-primary/10 border-primary'
                : 'bg-destructive/10 border-destructive'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isWinning ? (
                    <CheckCircle2 className="text-primary h-6 w-6" />
                  ) : (
                    <XCircle className="text-destructive h-6 w-6" />
                  )}
                  <div>
                    <p className="text-lg font-bold">
                      {isWinning
                        ? 'Prediction Correct!'
                        : 'Prediction Incorrect'}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      ETH{' '}
                      {activePrediction.isAbove ? 'went above' : 'went below'} $
                      {targetPrice}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">
                    Final ETH Price
                  </p>
                  <p className="text-2xl font-bold">
                    ${currentPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-2">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Vesting Multiplier
                  </p>
                  <p className="font-bold">
                    {
                      getMultiplierChange(activePrediction.tier, isWinning)
                        .display
                    }
                  </p>
                </div>
                {!isWinning && (
                  <div className="text-right">
                    <p className="text-muted-foreground text-sm">Stake Lost</p>
                    <p className="text-destructive font-bold">
                      {Number(activePrediction.stakeAmount).toFixed(6)} ryBOND
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Current Position (for active predictions) */}
        {!activePrediction.resolved && (
          <div
            className={`rounded-lg border p-4 ${
              isWinning
                ? 'bg-primary/10 border-primary'
                : 'bg-muted border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isWinning ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <span className="font-semibold">
                  Current Position: {isWinning ? 'Winning' : 'Losing'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm">
                  Current ETH Price
                </p>
                <p className="text-lg font-bold">${currentPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">
              Prediction
            </p>
            <div className="flex items-center gap-2">
              {activePrediction.isAbove ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              <p className="text-lg font-bold">
                ETH {activePrediction.isAbove ? 'ABOVE' : 'BELOW'} $
                {activePrediction.targetPrice}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">Staked</p>
            <p className="text-lg font-bold">
              {Number(activePrediction.stakeAmount).toFixed(6)} ryBOND
            </p>
            <p className="text-muted-foreground text-xs">
              Tier: {tierInfo.name} ({tierInfo.stake})
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">Expires</p>
            <p className="flex items-center gap-2 text-lg font-bold">
              <Clock className="h-4 w-4" />
              {formatToJakartaTime(Number(activePrediction.expiry))}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">Status</p>
            <p className="text-lg font-bold">
              {activePrediction.resolved ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Resolved
                </span>
              ) : canResolve ? (
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Ready
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Waiting
                </span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
      {canResolve && !activePrediction.resolved && (
        <CardFooter className="flex-col gap-3">
          <div className="w-full rounded-lg bg-primary/10 border border-primary p-3 text-sm">
            <p className="font-semibold">⏰ Time to resolve!</p>
            <p className="text-muted-foreground text-xs mt-1">
              Click below to finalize the prediction. Your multiplier will {isWinning ? 'boost' : 'reduce'} after resolving.
            </p>
          </div>
          <Button className="w-full" onClick={onResolve} disabled={isResolving}>
            {isResolving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Resolve Prediction
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
