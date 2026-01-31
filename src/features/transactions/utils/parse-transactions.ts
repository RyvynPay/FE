import { formatUnits } from 'viem';
import { Transaction } from '../types';
import { EventWithTimestamp } from './fetch-events';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function parseMintHistory(
  mintHistory: any[] | undefined,
  depositEvents: EventWithTimestamp[],
  currency: 'USD' | 'IDR'
): Transaction[] {
  if (!mintHistory || !Array.isArray(mintHistory)) return [];

  const depositMapByIndex = new Map();
  const depositMapByBlock = new Map();

  depositEvents.forEach(event => {
    const mintIndex = Number(event.args?.mintIndex);
    const blockNumber = Number(event.blockNumber);
    depositMapByIndex.set(mintIndex, event);
    depositMapByBlock.set(blockNumber, event);
  });

  return mintHistory.map((record: any, index: number) => {
    let depositEvent = depositMapByIndex.get(index);
    if (!depositEvent) {
      depositEvent = depositMapByBlock.get(Number(record.blockNumber));
    }

    return {
      id: `mint-${currency}-${index}`,
      type: 'mint' as const,
      amount: Number(formatUnits(record.amount, 6)),
      timestamp: Number(record.timestamp),
      blockNumber: Number(record.blockNumber),
      txHash:
        depositEvent?.transactionHash ||
        `0x${record.blockNumber.toString(16).padStart(64, '0')}`,
      status: 'success' as const,
      currency,
    };
  });
}

export function parseTransferEvents(
  transferEvents: EventWithTimestamp[],
  userAddress: string,
  currency: 'USD' | 'IDR'
): Transaction[] {
  if (!transferEvents || !Array.isArray(transferEvents)) return [];

  return transferEvents
    .filter(event => {
      const from = event.args?.from as string;
      const to = event.args?.to as string;
      return from !== ZERO_ADDRESS && to !== ZERO_ADDRESS;
    })
    .map((event, index) => {
      const from = event.args?.from as string;
      const to = event.args?.to as string;
      const isSent = from.toLowerCase() === userAddress.toLowerCase();
      const txType: 'transfer_sent' | 'transfer_received' = isSent
        ? 'transfer_sent'
        : 'transfer_received';

      return {
        id: `transfer-${currency}-${event.transactionHash}-${index}`,
        type: txType,
        amount: Number(
          formatUnits((event.args?.value as bigint) || BigInt(0), 6)
        ),
        timestamp: event.blockTimestamp || Date.now() / 1000,
        blockNumber: Number(event.blockNumber),
        txHash: event.transactionHash,
        from: isSent ? undefined : from,
        to: isSent ? to : undefined,
        status: 'success' as const,
        currency,
      };
    });
}

export function parseClaimEvents(
  claimEvents: EventWithTimestamp[]
): Transaction[] {
  if (!claimEvents || !Array.isArray(claimEvents)) return [];

  return claimEvents.map((event, index) => {
    const stablecoin = event.args?.stablecoin as string;
    const currency = stablecoin?.toLowerCase().includes('idr') ? 'IDR' : 'USD';

    return {
      id: `claim-${event.transactionHash}-${index}`,
      type: 'claim' as const,
      amount: Number(
        formatUnits((event.args?.amount as bigint) || BigInt(0), 6)
      ),
      timestamp:
        event.blockTimestamp ||
        Number((event.args?.timestamp as bigint) || Date.now() / 1000),
      blockNumber: Number(event.blockNumber),
      txHash: event.transactionHash,
      status: 'success' as const,
      currency,
    };
  });
}

export function parseWithdrawalEvents(
  withdrawalEvents: EventWithTimestamp[],
  currency: 'USD' | 'IDR'
): Transaction[] {
  if (!withdrawalEvents || !Array.isArray(withdrawalEvents)) return [];

  return withdrawalEvents.map((event, index) => ({
    id: `withdraw-${currency}-${event.transactionHash}-${index}`,
    type: 'withdraw' as const,
    amount: Number(formatUnits((event.args?.amount as bigint) || BigInt(0), 6)),
    timestamp: event.blockTimestamp || Date.now() / 1000,
    blockNumber: Number(event.blockNumber),
    txHash: event.transactionHash,
    status: 'success' as const,
    currency,
  }));
}
