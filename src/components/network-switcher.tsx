'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { BASE_SEPOLIA_CHAIN_ID } from '@/config/contracts';

export function NetworkSwitcher() {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = chain && chain.id !== BASE_SEPOLIA_CHAIN_ID;

  return (
    <Button
      variant={isWrongNetwork ? 'destructive' : 'default'}
      size="sm"
      onClick={() => switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID })}
      className="gap-2"
    >
      <div className="h-2 w-2 rounded-full bg-current" />
      {isWrongNetwork ? 'Wrong Network' : chain?.name || 'Not Connected'}
      <ChevronDown className="h-4 w-4" />
    </Button>
  );
}