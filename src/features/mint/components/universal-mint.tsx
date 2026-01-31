'use client';

import { useState } from 'react';
import { Currency } from '@/types/currency';
import { CURRENCY_CONFIGS } from '@/config/currencies';
import { useUniversalMint } from '../hooks/use-universal-mint';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { formatBalance, formatAmount } from '@/lib/currency';

// Token logos
const TOKEN_LOGOS = {
  USDC: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040',
  IDRX: 'https://app.idrx.co/favicon.svg',
};

export function UniversalMint() {
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [isFlipped, setIsFlipped] = useState(false);

  const config = CURRENCY_CONFIGS[currency];
  const {
    underlyingBalance,
    stablecoinBalance,
    approveAndDeposit,
    withdraw,
    isPending,
    isConfirming,
    currentStep,
    isProcessing,
  } = useUniversalMint(currency);

  const handleDeposit = async () => {
    try {
      await approveAndDeposit(amount);
      toast.success(`${config.symbol} minted successfully!`);
      setAmount('');
    } catch (err: any) {
      console.error('Mint error:', err);

      // Extract meaningful error message
      let errorMessage = 'Transaction failed';

      if (err.message) {
        errorMessage = err.message;
      } else if (err.shortMessage) {
        errorMessage = err.shortMessage;
      } else if (err.reason) {
        errorMessage = err.reason;
      }

      toast.error(errorMessage);
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdraw(amount);
      toast.success(`${config.underlyingSymbol} withdrawn successfully!`);
      setAmount('');
    } catch (err: any) {
      console.error('Withdraw error:', err);

      // Extract meaningful error message
      let errorMessage = 'Transaction failed';

      if (err.message) {
        errorMessage = err.message;
      } else if (err.shortMessage) {
        errorMessage = err.shortMessage;
      } else if (err.reason) {
        errorMessage = err.reason;
      }

      toast.error(errorMessage);
    }
  };

  const setMaxAmount = () => {
    if (mode === 'deposit') {
      setAmount(underlyingBalance);
    } else {
      setAmount(stablecoinBalance);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'deposit' ? 'withdraw' : 'deposit');
    setAmount('');
    setIsFlipped(!isFlipped);
  };

  const isLoading = isPending || isConfirming || isProcessing;
  const hasAmount = amount && Number(amount) > 0;
  const outputAmount = amount || '0.00';

  return (
    <Card className="w-full shadow-xl">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {mode === 'deposit' ? 'Mint' : 'Withdraw'} {config.symbol}
          </h2>

          {/* Currency Selector */}
          <div className="flex gap-2">
            <Badge
              variant={currency === Currency.USD ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCurrency(Currency.USD)}
            >
              USD
            </Badge>
            <Badge
              variant={currency === Currency.IDR ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCurrency(Currency.IDR)}
            >
              IDR
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Input Section - You will pay */}
        <div className="bg-muted/50 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              You will {mode === 'deposit' ? 'pay' : 'withdraw'}
            </span>
            <span className="text-xs text-muted-foreground">
              Balance: {formatBalance(
                mode === 'deposit' ? underlyingBalance : stablecoinBalance,
                currency
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                // Remove commas and only allow numbers and one decimal point
                const rawValue = e.target.value.replace(/,/g, '');
                // Allow empty, numbers, and decimal point
                if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                  setAmount(rawValue);
                }
              }}
              onBlur={(e) => {
                // Format on blur if there's a value
                if (e.target.value && !isNaN(Number(e.target.value))) {
                  setAmount(Number(e.target.value).toString());
                }
              }}
              placeholder="0.00"
              className="text-3xl font-bold bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground/40"
            />

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={setMaxAmount}
                className="h-7 px-2 text-xs font-medium"
              >
                MAX
              </Button>
              <Badge variant="outline" className="flex items-center gap-2 py-1 px-2 shrink-0">
                {mode === 'deposit' ? (
                  <Image
                    src={currency === Currency.USD ? TOKEN_LOGOS.USDC : TOKEN_LOGOS.IDRX}
                    alt={currency === Currency.USD ? 'USDC' : 'IDRX'}
                    width={20}
                    height={20}
                    className="rounded-full shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0">
                    R
                  </div>
                )}
                <span className="font-medium whitespace-nowrap">
                  {mode === 'deposit' ? config.underlyingSymbol : config.symbol}
                </span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMode}
            className={`rounded-full transition-transform duration-300 cursor-pointer ${
              isFlipped ? 'rotate-180' : 'rotate-0'
            }`}
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        {/* Output Section - You will receive */}
        <div className="bg-muted/50 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              You will {mode === 'deposit' ? 'receive' : 'get back'}
            </span>
            <Badge variant="secondary" className="text-xs">
              APY: {config.apy}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-foreground">
              {formatAmount(outputAmount)}
            </div>

            <Badge variant="outline" className="flex items-center gap-2 py-1 px-2 shrink-0">
              {mode === 'withdraw' ? (
                <Image
                  src={currency === Currency.USD ? TOKEN_LOGOS.USDC : TOKEN_LOGOS.IDRX}
                  alt={currency === Currency.USD ? 'USDC' : 'IDRX'}
                  width={20}
                  height={20}
                  className="rounded-full shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0">
                  R
                </div>
              )}
              <span className="font-medium whitespace-nowrap">
                {mode === 'deposit' ? config.symbol : config.underlyingSymbol}
              </span>
            </Badge>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Exchange Rate Info */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>1 {config.underlyingSymbol} = 1 {config.symbol}</span>
          <span>•</span>
          <span>{config.strategyType === 'multi' ? 'Multi-vault' : 'IDRX vault'}</span>
        </div>

        {/* Action Button */}
        <Button
          onClick={mode === 'deposit' ? handleDeposit : handleWithdraw}
          disabled={isLoading || !hasAmount}
          variant='default'
          className="w-full h-14 text-base font-semibold rounded-2xl"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {mode === 'deposit'
                ? (currentStep === 'approving' ? 'Approving...' : 'Minting...')
                : 'Withdrawing...'
              }
            </>
          ) : (
            mode === 'deposit' ? `Mint ${config.symbol}` : `Withdraw ${config.symbol}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
