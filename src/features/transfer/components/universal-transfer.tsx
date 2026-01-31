'use client';

import { useState, useEffect } from 'react';
import { Currency } from '@/types/currency';
import { CURRENCY_CONFIGS } from '@/config/currencies';
import { useUniversalTransfer } from '../hooks/use-universal-transfer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { isAddress } from 'viem';

export function UniversalTransfer() {
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const config = CURRENCY_CONFIGS[currency];
  const {
    balance,
    rewardPreview,
    previewRewards,
    transfer,
    isPending,
    isConfirming,
    isSuccess,
    error,
  } = useUniversalTransfer(currency);

  // Preview rewards when amount/recipient changes
  useEffect(() => {
    const timer = setTimeout(() => {
      previewRewards(recipient, amount);
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [recipient, amount]);

  const handleTransfer = async () => {
    try {
      await transfer(recipient, amount);
      toast.success(`${config.symbol} transferred successfully!`);
      setAmount('');
      setRecipient('');
    } catch (err) {
      toast.error(`Transfer failed: ${(err as Error).message}`);
    }
  };

  const setMaxAmount = () => {
    setAmount(balance);
  };

  const isValidAddress = isAddress(recipient);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-6 bg-card rounded-lg border">
      {/* Currency Selector */}
      <div>
        <h3 className="text-sm font-medium mb-2">Select Currency to Transfer</h3>
        <div className="flex gap-2">
          <Button
            variant={currency === Currency.USD ? 'default' : 'outline'}
            onClick={() => setCurrency(Currency.USD)}
            className="flex-1"
          >
            {CURRENCY_CONFIGS[Currency.USD].symbol}
          </Button>
          <Button
            variant={currency === Currency.IDR ? 'default' : 'outline'}
            onClick={() => setCurrency(Currency.IDR)}
            className="flex-1"
          >
            {CURRENCY_CONFIGS[Currency.IDR].symbol}
          </Button>
        </div>
      </div>

      {/* Balance Display */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">Your {config.symbol} Balance</p>
        <p className="text-2xl font-semibold">{Number(balance).toFixed(2)}</p>
      </div>

      {/* Recipient Address */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Recipient Address
        </label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          className="w-full px-4 py-3 rounded-md border bg-background"
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
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount of ${config.symbol} to send`}
            className="w-full px-4 py-3 pr-20 rounded-md border bg-background"
            step="0.01"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {config.symbol}
          </div>
        </div>
      </div>

      {/* Reward Preview */}
      {rewardPreview && isValidAddress && amount && Number(amount) > 0 && (
        <div className="border p-4 rounded-lg bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-lg">🎁</span>
            Transfer Rewards Preview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-md">
              <p className="text-xs text-muted-foreground mb-1">You Receive</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {Number(rewardPreview.senderReward).toFixed(2)} ryBOND
              </p>
              <p className="text-xs text-muted-foreground">
                ({rewardPreview.senderShare}% share)
              </p>
            </div>
            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-md">
              <p className="text-xs text-muted-foreground mb-1">Recipient Receives</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {Number(rewardPreview.receiverReward).toFixed(2)} ryBOND
              </p>
              <p className="text-xs text-muted-foreground">
                ({rewardPreview.receiverShare}% share)
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Note:</strong> Split based on your holding time. Longer hold = higher sender share (up to 90%).
          </p>
        </div>
      )}

      {/* Transfer Button */}
      <Button
        onClick={handleTransfer}
        disabled={isPending || isConfirming || !isValidAddress || !amount || Number(amount) === 0}
        className="w-full"
        size="lg"
      >
        {isPending || isConfirming
          ? 'Transferring...'
          : `Send ${config.symbol}`
        }
      </Button>

      {/* Status Messages */}
      {isSuccess && (
        <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200 rounded-md text-sm">
          Transfer successful! Both you and the recipient earned ryBOND rewards.
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200 rounded-md text-sm">
          Error: {error.message}
        </div>
      )}

      {/* Info Box */}
      <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-md">
        <p><strong>How Transfer Rewards Work:</strong></p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Both sender and receiver earn ryBOND rewards on every transfer</li>
          <li>Default split: 70% sender, 30% receiver</li>
          <li>Longer holding time increases sender share (up to 90%)</li>
          <li>ryBOND vests linearly over 7 days</li>
          <li>Claim ryBOND anytime for {CURRENCY_CONFIGS[Currency.USD].symbol} or {CURRENCY_CONFIGS[Currency.IDR].symbol}</li>
        </ul>
      </div>
    </div>
  );
}
