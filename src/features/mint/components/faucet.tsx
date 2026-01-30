'use client';

import { Button } from '@/components/ui/button';
import { BASE_SEPOLIA_CHAIN_ID } from '@/config/contracts';
import { useMockUSDC } from '@/hooks/useMockUSDC';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

export function Faucet() {
  const [amount, setAmount] = useState('10000');
  const { chain } = useAccount();
  const { balance, claimFaucet, isMintingPublic, isSuccess, isError } =
    useMockUSDC();

  const isWrongNetwork = chain && chain.id !== BASE_SEPOLIA_CHAIN_ID;

  useEffect(() => {
    if (isSuccess) {
      toast.success('Mint successful! 10.000 mUSDC received.');
    }
    if (isError) {
      toast.error('You have already claimed tokens from this faucet.');
    }
  }, [isSuccess, isError]);

  return (
    <div className="mt-4">
      <Button
        onClick={async () => {
          try {
            await claimFaucet(amount);
            toast.info('Transaction submitted...');
          } catch (error: any) {
            console.error('Faucet error:', error);
            const errorMessage = error?.message?.toLowerCase() || '';

            if (
              errorMessage.includes('already claimed') ||
              errorMessage.includes('denied')
            ) {
              if (errorMessage.includes('user rejected')) {
                toast.error('Transaction rejected by user');
                return;
              }
              toast.error('You have already claimed tokens from this faucet.');
            } else {
              toast.error(
                'Failed to claim. You may have already claimed or network is busy.'
              );
            }
          }
        }}
        disabled={isMintingPublic || isWrongNetwork}
        className="w-full"
        variant="outline"
      >
        {isMintingPublic && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isMintingPublic ? 'Claiming...' : 'Click here to mint 10.000 mUSDC'}
      </Button>

      {isWrongNetwork && (
        <div className="flex items-center gap-2 rounded bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>Wrong network! Please switch to BASE.</span>
        </div>
      )}

      {isWrongNetwork && (
        <div className="flex items-center gap-2 rounded bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>Wrong network! Please switch to BASE.</span>
        </div>
      )}
    </div>
  );
}
