'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BASE_SEPOLIA_CHAIN_ID } from '@/config/contracts';
import { useMockUSDC } from '@/hooks/useMockUSDC';
import { useMockIDRX } from '@/hooks/useMockIDRX';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

type FaucetCurrency = 'USDC' | 'IDRX';

const FAUCET_AMOUNTS = {
  USDC: '1000',
  IDRX: '100000',
};

export function Faucet() {
  const [currency, setCurrency] = useState<FaucetCurrency>('USDC');
  const amount = FAUCET_AMOUNTS[currency];
  const { chain } = useAccount();

  // USDC hook
  const {
    claimFaucet: claimUSDC,
    isMintingPublic: isMintingUSDC,
    isSuccess: isSuccessUSDC,
    isError: isErrorUSDC,
  } = useMockUSDC();

  // IDRX hook
  const {
    claimFaucet: claimIDRX,
    isMintingPublic: isMintingIDRX,
    isSuccess: isSuccessIDRX,
    isError: isErrorIDRX,
  } = useMockIDRX();

  const isWrongNetwork = chain && chain.id !== BASE_SEPOLIA_CHAIN_ID;
  const isMinting = currency === 'USDC' ? isMintingUSDC : isMintingIDRX;
  const isSuccess = currency === 'USDC' ? isSuccessUSDC : isSuccessIDRX;
  const isError = currency === 'USDC' ? isErrorUSDC : isErrorIDRX;

  useEffect(() => {
    if (isSuccess) {
      const formattedAmount = Number(amount).toLocaleString();
      toast.success(`Mint successful! ${formattedAmount} m${currency} received.`);
    }
    if (isError) {
      toast.error('You have already claimed tokens from this faucet.');
    }
  }, [isSuccess, isError, currency, amount]);

  const handleClaim = async () => {
    try {
      if (currency === 'USDC') {
        await claimUSDC(amount);
      } else {
        await claimIDRX(amount);
      }
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
  };

  return (
    <div className="w-full bg-card rounded-3xl p-6 border border-border shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-lg">Testnet Faucet</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Get free test tokens
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          Base Sepolia
        </Badge>
      </div>

      {/* Currency Selector */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-xl mb-4">
        <button
          onClick={() => setCurrency('USDC')}
          className={`
            flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all
            ${currency === 'USDC'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          mUSDC
        </button>
        <button
          onClick={() => setCurrency('IDRX')}
          className={`
            flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all
            ${currency === 'IDRX'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          mIDRX
        </button>
      </div>

      {/* Claim Button */}
      <Button
        onClick={handleClaim}
        disabled={isMinting || isWrongNetwork}
        className="w-full h-12 rounded-2xl font-semibold"
        size="lg"
      >
        {isMinting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Claiming...
          </>
        ) : (
          `Mint ${Number(amount).toLocaleString()} m${currency}`
        )}
      </Button>

      {/* Wrong Network Warning */}
      {isWrongNetwork && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive mt-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Wrong network! Switch to Base Sepolia.</span>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-muted-foreground text-center mt-3">
        Each wallet can claim once • Testnet only
      </p>
    </div>
  );
}
