'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface GettingStartedCardProps {
  ryBondBalance: string;
}

export default function GettingStartedCard({ ryBondBalance }: GettingStartedCardProps) {
  const hasNoBalance = Number(ryBondBalance) === 0;

  if (!hasNoBalance) return null;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Getting Started
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          You need ryBOND to create predictions. Here's how to get started:
        </p>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </div>
            <div>
              <p className="font-semibold">Deposit & Mint</p>
              <p className="text-muted-foreground">
                Go to <Link href="/mint" className="text-primary hover:underline">Mint page</Link> and deposit USDC or IDRX to get ryUSD or ryIDR
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </div>
            <div>
              <p className="font-semibold">Transfer to Earn ryBOND</p>
              <p className="text-muted-foreground">
                Go to <Link href="/transfer" className="text-primary hover:underline">Transfer page</Link> and send some ryUSD/ryIDR to earn ryBOND rewards
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              3
            </div>
            <div>
              <p className="font-semibold">Wait for Vesting</p>
              <p className="text-muted-foreground">
                ryBOND vests over 7 days. Check <Link href="/stream-bonds" className="text-primary hover:underline">Reward page</Link> to see your balance
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              4
            </div>
            <div>
              <p className="font-semibold">Create Prediction</p>
              <p className="text-muted-foreground">
                Come back here to stake ryBOND and boost your vesting speed!
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-3 text-sm border border-border">
          <p className="font-semibold mb-1">Quick Tip</p>
          <p className="text-muted-foreground">
            The more ryBOND you have, the more you can stake. Higher stake tiers give bigger multipliers!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
