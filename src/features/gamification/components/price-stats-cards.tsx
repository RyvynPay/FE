'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface PriceStatsCardsProps {
  currentETHPrice: string;
  userMultiplier: string;
  ryBondBalance: string;
}

export default function PriceStatsCards({
  currentETHPrice,
  userMultiplier,
  ryBondBalance,
}: PriceStatsCardsProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Price Prediction Boost
        </CardTitle>
        <CardDescription>
          Predict ETH price to boost or reduce your ryBOND streaming speed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Current ETH Price */}
          <div className="rounded-lg bg-primary/10 p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Current ETH Price
            </p>
            <p className="text-3xl font-bold">${currentETHPrice}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Live from Chainlink Oracle
            </p>
          </div>

          {/* Current Multiplier */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Vesting Multiplier
            </p>
            <p className="text-3xl font-bold">{userMultiplier}x</p>
            <p className="text-xs text-muted-foreground mt-1">
              {Number(userMultiplier) > 1
                ? 'Boosted vesting speed'
                : Number(userMultiplier) < 1
                  ? 'Reduced vesting speed'
                  : 'Normal vesting speed'}
            </p>
          </div>

          {/* ryBOND Balance */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Your ryBOND
            </p>
            <p className="text-3xl font-bold">{Number(ryBondBalance).toFixed(8)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Available for staking
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
