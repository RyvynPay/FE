'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMockUSDC } from '@/hooks/useMockUSDC';
import { useRyUSD } from '@/hooks/useRyUSD';
import { usePrivy } from '@privy-io/react-auth';
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import { ModeToggle } from './node-toggle';
import { TokenInput } from './token-input';
import { BASE_SEPOLIA_CHAIN_ID } from '@/config/contracts';

export default function MintRyUSD() {
  const { authenticated } = usePrivy();
  const { chain } = useAccount();
  const [amount, setAmount] = useState('');
  const [isMintMode, setIsMintMode] = useState(true);

  const {
    ryUSDBalance,
    allowance,
    withdrawRyUSD,
    approveUSDC,
    mintRyUSD,
  } = useRyUSD();

  const { balance: usdcBalance } = useMockUSDC();

  const isWrongNetwork = chain && chain.id !== BASE_SEPOLIA_CHAIN_ID;
  const needsApproval =
    allowance && amount ? parseUnits(amount, 6) > (allowance as bigint) : true;

  const formattedUSDCBalance = usdcBalance
    ? formatUnits(usdcBalance as bigint, 6)
    : '0.00';

  const formattedRyUSDBalance = ryUSDBalance
    ? formatUnits(ryUSDBalance as bigint, 6)
    : '0.00';

  const publicClient = usePublicClient();

  const [processingStatus, setProcessingStatus] = useState<
    'idle' | 'approving' | 'minting' | 'withdrawing'
  >('idle');

  const handleTransaction = async () => {
    if (!authenticated) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (isWrongNetwork) {
      toast.error('Please switch to BASE');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      if (isMintMode) {
        if (needsApproval) {
          setProcessingStatus('approving');
          toast.info('Approving USDC...');
          const txHash = await approveUSDC(amount);

          if (txHash && publicClient) {
            toast.info('Waiting for approval confirmation...');
            await publicClient.waitForTransactionReceipt({ hash: txHash });
            toast.success('USDC Approved! Proceeding to mint...');
          } else {
            return;
          }
        }

        setProcessingStatus('minting');
        toast.info('Minting ryUSD...');
        const mintHash = await mintRyUSD(amount);

        if (mintHash && publicClient) {
          toast.info('Waiting for confirmation...');
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: mintHash,
          });

          if (receipt.status === 'success') {
            toast.success('Mint successful! ryUSD received.');
          } else {
            toast.error('Mint transaction failed on-chain.');
          }
        }
      } else {
        setProcessingStatus('withdrawing');
        toast.info('Withdrawing USDC...');
        const withdrawHash = await withdrawRyUSD(amount);

        if (withdrawHash && publicClient) {
          toast.info('Waiting for confirmation...');
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: withdrawHash,
          });

          if (receipt.status === 'success') {
            toast.success('Withdraw successful! USDC received.');
          } else {
            toast.error('Withdraw transaction failed on-chain.');
          }
        }
      }
    } catch (error: any) {
      console.error('Transaction failed:', error);
      if (error.message?.toLowerCase()?.includes('user rejected')) {
        toast.error('Transaction rejected by user');
      } else {
        toast.error('Transaction failed. Please try again.');
      }
    } finally {
      setProcessingStatus('idle');
    }
  };

  const handleMaxClick = () => {
    const maxAmount = isMintMode
      ? usdcBalance
        ? formatUnits(usdcBalance as bigint, 6)
        : '0'
      : ryUSDBalance
        ? formatUnits(ryUSDBalance as bigint, 6)
        : '0';
    setAmount(maxAmount);
  };

  const getButtonText = () => {
    if (!authenticated) return 'Connect Wallet';
    if (isMintMode) {
      return 'Mint ryUSD';
    }
    return 'Withdraw to USDC';
  };

  const isLoading = processingStatus !== 'idle';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div>
          <CardTitle className="text-2xl font-bold">
            {isMintMode ? 'Mint ryUSD' : 'Withdraw USDC'}
          </CardTitle>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Info className="h-3 w-3" />
          <span>1:1 Exchange Rate</span>
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <TokenInput
            label="You will pay"
            value={amount}
            balance={isMintMode ? formattedUSDCBalance : formattedRyUSDBalance}
            tokenSymbol={isMintMode ? 'USDC' : 'ryUSD'}
            onChange={setAmount}
            onMaxClick={handleMaxClick}
            disabled={!authenticated}
          />

          <ModeToggle onToggle={() => setIsMintMode(!isMintMode)} />

          <TokenInput
            label="You will receive"
            value={amount || '0.00'}
            tokenSymbol={isMintMode ? 'ryUSD' : 'USDC'}
            readOnly
            disabled={!authenticated}
          />
        </div>

        <Button
          onClick={handleTransaction}
          disabled={
            !authenticated ||
            isLoading ||
            isWrongNetwork ||
            !amount ||
            parseFloat(amount) <= 0
          }
          className="mt-6 h-14 w-full rounded-xl text-lg font-medium shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {processingStatus === 'approving'
                ? 'Approving...'
                : processingStatus === 'minting'
                  ? 'Minting...'
                  : 'Withdrawing...'}
            </>
          ) : (
            getButtonText()
          )}
        </Button>

        {isWrongNetwork && (
          <div className="mt-4 flex items-center gap-2 rounded bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>Wrong network! Please switch to BASE.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
