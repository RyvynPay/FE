'use client';

import { useState, useEffect } from 'react';
import { Currency } from '@/types/currency';
import { CURRENCY_CONFIGS } from '@/config/currencies';
import { useUniversalTransfer } from '../hooks/use-universal-transfer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { isAddress } from 'viem';
import { Loader2, Info, Send } from 'lucide-react';
import { formatBalance } from '@/lib/currency';

export function UniversalTransfer() {
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isAmountFocused, setIsAmountFocused] = useState(false);

  const config = CURRENCY_CONFIGS[currency];
  const {
    balance,
    rewardPreview,
    previewRewards,
    transfer,
    isLoading,
  } = useUniversalTransfer(currency);

  // Preview rewards when amount/recipient changes
  useEffect(() => {
    const timer = setTimeout(() => {
      previewRewards(recipient, amount);
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [recipient, amount, previewRewards]);

  const handleTransfer = async () => {
    try {
      await transfer(recipient, amount);
      toast.success(`${config.symbol} transferred successfully! earned ryBOND rewards.`);
      setAmount('');
      setRecipient('');
    } catch (err: any) {
      console.error('Transfer error:', err);

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
    setAmount(balance);
  };

  const isValidAddress = isAddress(recipient);

  return (
    <Card className="w-full shadow-xl">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Transfer {config.symbol}
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
        {/* Balance Display */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Your {config.symbol} Balance</span>
          <span className="font-medium">{formatBalance(balance, currency)}</span>
        </div>

      {/* Recipient Address */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Recipient Address
        </label>
        <Input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          className="h-12"
        />
        {recipient && !isValidAddress && (
          <p className="text-xs text-red-500 mt-1">Invalid Ethereum address</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium">
            Amount
          </label>
          <button
            onClick={setMaxAmount}
            className="text-xs text-primary hover:underline"
          >
            MAX
          </button>
        </div>
        <div className="relative">
          <Input
            type="text"
            value={
              isAmountFocused
                ? amount
                : amount
                ? Number(amount).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 6,
                  })
                : ''
            }
            onChange={(e) => {
              // Remove commas and only allow numbers and one decimal point
              const rawValue = e.target.value.replace(/,/g, '');
              // Allow empty, numbers, and decimal point
              if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                setAmount(rawValue);
              }
            }}
            onFocus={() => setIsAmountFocused(true)}
            onBlur={() => {
              setIsAmountFocused(false);
              // Clean up the value
              if (amount && !isNaN(Number(amount))) {
                setAmount(Number(amount).toString());
              }
            }}
            placeholder="0.00"
            className="h-12 pr-20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {config.symbol}
          </div>
        </div>
      </div>

      {/* Reward Preview */}
      <div className="border border-border rounded-lg p-1">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Your Reward (Sender)</span>
          </div>
          <span className="text-sm text-green-600 dark:text-green-400">
            +{rewardPreview ? Number(rewardPreview.senderReward).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} ryBOND
          </span>
        </div>
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Recipient Reward</span>
          </div>
          <span className="text-sm text-primary">
            +{rewardPreview ? Number(rewardPreview.receiverReward).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} ryBOND
          </span>
        </div>
      </div>

      {/* Transfer Button */}
      <Button
        onClick={handleTransfer}
        disabled={isLoading || !isValidAddress || !amount || Number(amount) === 0}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Transferring...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Transfer {config.symbol}
          </>
        )}
      </Button>

      {/* Info Box */}
      <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-md">
        <p className="font-medium text-foreground mb-1.5">Transfer Rewards</p>
        <ul className="space-y-0.5">
          <li>• Both parties earn ryBOND per transfer</li>
          <li>• 70/30 sender-receiver split (default)</li>
          <li>• Hold longerhigher sender share (max 90%)</li>
          <li>• Vests over 7 days - Claimable as {CURRENCY_CONFIGS[Currency.USD].symbol} or {CURRENCY_CONFIGS[Currency.IDR].symbol}</li>
        </ul>
      </div>
      </CardContent>
    </Card>
  );
}
