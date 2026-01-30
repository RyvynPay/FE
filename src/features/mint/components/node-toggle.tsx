'use client';

import { ArrowDownUp } from 'lucide-react';

interface ModeToggleProps {
  onToggle: () => void;
}

export function ModeToggle({ onToggle }: ModeToggleProps) {
  return (
    <div className="relative z-10 flex justify-center">
      <button
        onClick={onToggle}
        className="bg-background hover:bg-secondary cursor-pointer rounded-full border p-2 shadow-sm transition-colors"
        aria-label="Toggle between mint and withdraw"
      >
        <ArrowDownUp className="text-muted-foreground h-5 w-5" />
      </button>
    </div>
  );
}
