'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePrivy } from '@privy-io/react-auth';
import { Info, Loader2, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, isAddress } from 'viem';
import { BASE_SEPOLIA_CHAIN_ID, CONTRACTS } from '@/config/contracts';
import RyUSDABI from '@/abis/RyUSD.json';
import RyvynHandlerABI from '@/abis/RyvynHandler.json';

export default function TransferRyUSD() {
  const { authenticated } = usePrivy();
  const { address, chain } = useAccount();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  // Read ryUSD balance
  const { data: ryUSDBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.ryUSD as `0x${string}`,
    abi: RyUSDABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
  });

  // Preview transfer rewards from RyvynHandler
  const { data: rewardsPreview } = useReadContract({
    address: CONTRACTS.ryvynHandler as `0x${string}`,
    abi: RyvynHandlerABI,
    functionName: 'previewTransferRewards',
    args: address && amount && parseFloat(amount) > 0
      ? [address, parseUnits(amount, 6)]
      : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!address && !!amount && parseFloat(amount) > 0,
    }
  });

  // Transfer hook
  const {
    writeContract: transfer,
    isPending: isTransferring,
    data: transferTxHash
  } = useWriteContract();

  const { isLoading: isTransferConfirming, isSuccess: isTransferSuccess } = useWaitForTransactionReceipt({
    hash: transferTxHash,
  });

  // Refresh balance after successful transfer
  useEffect(() => {
    if (isTransferSuccess) {
      refetchBalance();
      toast.success('Transfer successful!');
      setRecipient('');
      setAmount('');
    }
  }, [isTransferSuccess, refetchBalance]);

  const formattedBalance = ryUSDBalance
    ? formatUnits(ryUSDBalance as bigint, 6)
    : '0.00';

  const isWrongNetwork = chain && chain.id !== BASE_SEPOLIA_CHAIN_ID;
  const isLoading = isTransferring || isTransferConfirming;

  // Parse rewards from contract (returns: senderReward, receiverReward, senderShare, receiverShare)
  const senderReward = rewardsPreview
    ? formatUnits((rewardsPreview as bigint[])[0], 6)
    : '0.00';
  const receiverReward = rewardsPreview
    ? formatUnits((rewardsPreview as bigint[])[1], 6)
    : '0.00';
  const senderShare = rewardsPreview
    ? Number((rewardsPreview as bigint[])[2])
    : 70;
  const receiverShare = rewardsPreview
    ? Number((rewardsPreview as bigint[])[3])
    : 30;

  const handleTransfer = async () => {
    if (!authenticated) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (isWrongNetwork) {
      toast.error('Please switch to BASE');
      return;
    }

    if (!recipient || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter valid recipient address and amount');
      return;
    }

    // Validate Ethereum address
    if (!isAddress(recipient)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    try {
      toast.info('Transferring ryUSD...');
      transfer({
        address: CONTRACTS.ryUSD as `0x${string}`,
        abi: RyUSDABI,
        functionName: 'transfer',
        args: [recipient as `0x${string}`, parseUnits(amount, 6)],
        chainId: BASE_SEPOLIA_CHAIN_ID,
      });
    } catch (error) {
      console.error('Transfer failed:', error);
      toast.error('Transfer failed. Please try again.');
    }
  };

  const handleMaxClick = () => {
    setAmount(formattedBalance);
  };

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle className="text-2xl font-bold">
              Transfer ryUSD
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Balance Display */}
          <div className="bg-muted/50 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Your ryUSD Balance
              </span>
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
                  R
                </div>
                <span className="text-lg font-bold">{formattedBalance}</span>
              </div>
            </div>
          </div>

          {/* Recipient Address */}
          <div className="rounded-xl border p-4">
            <Label className="text-muted-foreground mb-2 block text-sm">
              Recipient Address
            </Label>
            <Input
              type="text"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              placeholder="0x..."
              className="placeholder:text-muted-foreground h-auto border-none bg-transparent px-0 font-mono shadow-none focus-visible:ring-0"
              disabled={!authenticated}
            />
          </div>

          {/* Amount Input */}
          <div className="rounded-xl border p-4">
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-muted-foreground text-sm">Amount</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                className="text-primary hover:text-primary/80 h-8"
                disabled={!authenticated}
              >
                MAX
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="placeholder:text-muted-foreground h-auto flex-1 [appearance:textfield] border-none bg-transparent px-0 text-3xl shadow-none focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                disabled={!authenticated}
              />
              <div className="bg-muted flex items-center gap-2 rounded-lg px-3 py-2">
                <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                  R
                </div>
                <span className="font-medium">ryUSD</span>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-muted/50 space-y-2 rounded-lg border p-4">
              <div className="flex justify-between text-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="text-muted-foreground flex cursor-pointer items-center gap-1 decoration-dotted underline-offset-2 hover:underline">
                      Your Reward (Sender)
                      <Info className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        You earn {senderShare}% of the Stream Bonds rewards generated by
                        this transfer based on your holding age.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-green-600 dark:text-green-400">
                  +{senderReward} ryBOND
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="text-muted-foreground flex cursor-pointer items-center gap-1 decoration-dotted underline-offset-2 hover:underline">
                      Recipient Reward
                      <Info className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        The recipient earns {receiverShare}% of the Stream Bonds rewards.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-green-600 dark:text-green-400">
                  +{receiverReward} ryBOND
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm">
                <span className="text-muted-foreground font-medium">
                  Recipient Receives
                </span>
                <span className="font-medium">{amount} ryUSD</span>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-muted/50 rounded-lg border p-3">
            <div className="flex gap-2">
              <Info className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-muted-foreground text-sm">
                Both you and the recipient will earn Stream Bonds rewards on
                this transfer!
              </p>
            </div>
          </div>

          {/* Wrong Network Warning */}
          {isWrongNetwork && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                Wrong network! Please switch to BASE.
              </p>
            </div>
          )}

          {/* Transfer Button */}
          <Button
            onClick={handleTransfer}
            disabled={
              !authenticated ||
              isLoading ||
              isWrongNetwork ||
              !recipient ||
              !amount ||
              parseFloat(amount) <= 0
            }
            className="h-14 w-full rounded-xl text-lg font-medium shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Transferring...
              </>
            ) : !authenticated ? (
              'Connect Wallet to Transfer'
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Transfer ryUSD
              </>
            )}
          </Button>

          {transferTxHash && isTransferSuccess && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
              <p className="text-sm text-green-600 dark:text-green-400">
                Transfer successful! Hash:{' '}
                <span className="font-mono">{transferTxHash.slice(0, 10)}...{transferTxHash.slice(-8)}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
