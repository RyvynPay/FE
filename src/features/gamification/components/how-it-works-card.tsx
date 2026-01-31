'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, TrendingUp, XCircle, Zap } from 'lucide-react';

export default function HowItWorksCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How It Works</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="text-muted-foreground">
            Uses REAL Chainlink ETH/USD price feed on Base Sepolia
          </span>
        </p>
        <p className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="text-muted-foreground">
            Stake ryBOND to predict if ETH will be above/below target price
          </span>
        </p>
        <p className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="text-muted-foreground">
            If correct: Speed up vesting (1.1x - 1.5x based on tier)
          </span>
        </p>
        <p className="flex items-start gap-2">
          <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="text-muted-foreground">
            If wrong: Slow down vesting (0.9x) + lose staked ryBOND
          </span>
        </p>
        <p className="flex items-start gap-2">
          <TrendingUp className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="text-muted-foreground">
            Lost stakes: 50% yield pool, 30% treasury, 20% burned
          </span>
        </p>
        <p className="flex items-start gap-2">
          <Zap className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="text-muted-foreground">
            Works with BOTH ryUSD and ryIDR rewards
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
