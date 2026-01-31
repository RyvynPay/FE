'use client';

import { Label } from '@/components/ui/label';

const TIER_CONFIG = [
  {
    name: 'LOW',
    stake: '2%',
    winMult: '1.1x',
    loseMult: '0.9x',
  },
  {
    name: 'MEDIUM',
    stake: '5%',
    winMult: '1.25x',
    loseMult: '0.9x',
  },
  {
    name: 'HIGH',
    stake: '10%',
    winMult: '1.5x',
    loseMult: '0.9x',
  },
] as const;

interface TierSelectorProps {
  selectedTier: 0 | 1 | 2;
  onSelectTier: (tier: 0 | 1 | 2) => void;
}

export default function TierSelector({ selectedTier, onSelectTier }: TierSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Risk Tier</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TIER_CONFIG.map((t, i) => (
          <button
            key={i}
            onClick={() => onSelectTier(i as 0 | 1 | 2)}
            className={`rounded-lg border-2 p-4 transition-all ${
              selectedTier === i
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <p className="font-bold text-lg">{t.name}</p>
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-muted-foreground">Stake: {t.stake}</p>
              <p className="text-foreground">Win: {t.winMult}</p>
              <p className="text-muted-foreground">Lose: {t.loseMult}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
