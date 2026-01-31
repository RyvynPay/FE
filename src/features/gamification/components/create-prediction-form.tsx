'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import TierSelector from './tier-selector';

interface CreatePredictionFormProps {
  requiredStake: (tier: 0 | 1 | 2) => string;
  ryBondBalance: string;
  userMultiplier: string;
  isCreating: boolean;
  isResetting: boolean;
  onCreate: (targetPrice: string, isAbove: boolean, expiryHours: string, tier: 0 | 1 | 2) => void;
  onReset: () => void;
}

export default function CreatePredictionForm({
  requiredStake,
  ryBondBalance,
  userMultiplier,
  isCreating,
  isResetting,
  onCreate,
  onReset,
}: CreatePredictionFormProps) {
  const [targetPrice, setTargetPrice] = useState('');
  const [isAbove, setIsAbove] = useState(true);
  const [tier, setTier] = useState<0 | 1 | 2>(0);
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('0');

  const handleSubmit = () => {
    const totalHours = Number(hours) + Number(minutes) / 60;
    onCreate(targetPrice, isAbove, totalHours.toString(), tier);
    setTargetPrice('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Prediction</CardTitle>
        <CardDescription>
          Stake ryBOND to predict ETH price movement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Price */}
        <div className="space-y-2">
          <Label htmlFor="targetPrice">Target ETH Price ($)</Label>
          <Input
            id="targetPrice"
            type="number"
            placeholder="e.g., 3000"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
          />
        </div>

        {/* Direction */}
        <div className="space-y-2">
          <Label>Prediction Direction</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsAbove(true)}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                isAbove
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <div>
                <p className="font-semibold">ABOVE</p>
                <p className="text-xs text-muted-foreground">
                  Price will go up
                </p>
              </div>
            </button>
            <button
              onClick={() => setIsAbove(false)}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                !isAbove
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <TrendingDown className="h-5 w-5" />
              <div>
                <p className="font-semibold">BELOW</p>
                <p className="text-xs text-muted-foreground">
                  Price will go down
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Expiry */}
        <div className="space-y-2">
          <Label>Expires in</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Input
                type="number"
                placeholder="Hours"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Hours</p>
            </div>
            <div className="space-y-1">
              <Input
                type="number"
                placeholder="Minutes"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum: 30 minutes
          </p>
        </div>

        {/* Tier Selection */}
        <TierSelector selectedTier={tier} onSelectTier={setTier} />

        {/* Required Stake Display */}
        <div className="rounded-lg bg-muted p-4 border border-border">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Required Stake
          </p>
          <p className="text-2xl font-bold">
            {Number(requiredStake(tier)).toFixed(6)} ryBOND
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {tier === 0 ? '2%' : tier === 1 ? '5%' : '10%'} of your total ryBOND balance
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={isCreating || Number(ryBondBalance) === 0}
        >
          {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Prediction
        </Button>
        {Number(userMultiplier) !== 1 && (
          <Button
            className="w-full"
            variant="outline"
            onClick={onReset}
            disabled={isResetting}
          >
            {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Multiplier to 1.0x
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
