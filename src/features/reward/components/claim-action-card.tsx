import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle2, ExternalLink, Loader2, Wallet } from 'lucide-react';
import { ClaimTransaction } from '../hooks/use-reward-data';
import { Currency } from '@/types/currency';

interface ClaimActionCardProps {
  balance: number;
  onClaim: (currency: Currency) => Promise<void>;
  claimTx: ClaimTransaction;
}

export default function ClaimActionCard({
  balance,
  onClaim,
  claimTx,
}: ClaimActionCardProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    Currency.USD
  );

  const isPending = claimTx.status === 'pending';
  const isSuccess = claimTx.status === 'success';
  const isDisabled = balance <= 0 || isPending;

  const formattedBalance = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  }).format(balance);

  if (isSuccess) {
    const blockExplorerUrl = claimTx.txHash
      ? `https://sepolia.basescan.org/tx/${claimTx.txHash}`
      : null;

    const claimedCurrency =
      claimTx.currency === Currency.IDR ? 'ryIDR' : 'ryUSD';

    return (
      <Card className="w-full border-green-500/20 bg-green-500/10">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="mb-4 h-12 w-12 text-green-600" />
          <h3 className="text-xl font-bold text-green-700">
            Claim Successful!
          </h3>
          <p className="text-muted-foreground mt-2">
            {claimedCurrency} has been sent to your wallet.
          </p>
          {blockExplorerUrl && (
            <a
              href={blockExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary mt-4 flex items-center gap-2 text-sm hover:underline"
            >
              View transaction
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </CardContent>
      </Card>
    );
  }

  const currencySymbol = selectedCurrency === Currency.USD ? 'ryUSD' : 'ryIDR';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="text-primary h-5 w-5" />
          Claim Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-muted-foreground text-sm font-medium">
            Available to Claim
          </p>
          <p className="text-3xl font-bold tabular-nums">{formattedBalance}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            ryBOND
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Claim as:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedCurrency(Currency.USD)}
              disabled={isPending}
              className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                selectedCurrency === Currency.USD
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              } ${isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                R
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">ryUSD</p>
                <p className="text-muted-foreground text-xs">US Dollar</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedCurrency(Currency.IDR)}
              disabled={isPending}
              className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                selectedCurrency === Currency.IDR
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              } ${isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                R
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">ryIDR</p>
                <p className="text-muted-foreground text-xs">
                  Indonesian Rupiah
                </p>
              </div>
            </button>
          </div>
        </div>

      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          className="w-full"
          size="lg"
          variant={'secondary'}
          onClick={() => onClaim(selectedCurrency)}
          disabled={isDisabled}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending
            ? 'Processing Transaction...'
            : `Claim as ${currencySymbol}`}
        </Button>
        {isPending && (
          <p className="text-muted-foreground text-center text-xs">
            ⏳ Waiting for blockchain confirmation. This may take 30-60 seconds
            depending on network congestion.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
