import RyBONDabi from '@/abis/RyBOND.json';
import RyUSDabi from '@/abis/RyUSD.json';
import { BASE_SEPOLIA_CHAIN_ID, CONTRACTS } from '@/config/contracts';
import { useEffect, useMemo, useState } from 'react';
import { formatUnits } from 'viem';
import { useAccount, usePublicClient, useReadContract } from 'wagmi';
import { Transaction, TransactionFilters } from '../types';

export function useTransactionHistory(filters?: TransactionFilters) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [transferEvents, setTransferEvents] = useState<any[]>([]);
  const [claimEvents, setClaimEvents] = useState<any[]>([]);
  const [depositEvents, setDepositEvents] = useState<any[]>([]);
  const [withdrawalEvents, setWithdrawalEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Fetch mint history from RyUSD contract
  const {
    data: mintHistory,
    isLoading: isLoadingMints,
    refetch: refetchMints,
  } = useReadContract({
    address: CONTRACTS.ryUSD as `0x${string}`,
    abi: RyUSDabi,
    functionName: 'getUserMintHistory',
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!address,
    },
  });

  // Fetch Transfer events from blockchain with batching
  useEffect(() => {
    const fetchTransferEvents = async () => {
      if (!address || !publicClient) return;

      setIsLoadingEvents(true);
      try {
        // Get current block number
        const currentBlock = await publicClient.getBlockNumber();
        const BLOCK_RANGE = 9000; // Safe limit below 10k
        const TOTAL_BLOCKS = 50000; // Fetch last 50k blocks in chunks
        const fromBlock = currentBlock - BigInt(TOTAL_BLOCKS);

        // Helper function to fetch events in chunks with timestamps
        const fetchInChunks = async (
          eventName: string,
          args: any,
          contractAddress: `0x${string}`,
          abi: any
        ) => {
          const allEvents = [];
          let currentFrom = fromBlock;

          while (currentFrom < currentBlock) {
            const currentTo =
              currentFrom + BigInt(BLOCK_RANGE) > currentBlock
                ? currentBlock
                : currentFrom + BigInt(BLOCK_RANGE);

            try {
              const events = await publicClient.getContractEvents({
                address: contractAddress,
                abi,
                eventName,
                args,
                fromBlock: currentFrom,
                toBlock: currentTo,
              });

              // Fetch timestamps for all events in this chunk
              const eventsWithTimestamps = await Promise.all(
                events.map(async event => {
                  try {
                    const block = await publicClient.getBlock({
                      blockNumber: event.blockNumber,
                    });
                    return {
                      ...event,
                      blockTimestamp: Number(block.timestamp),
                    };
                  } catch (err) {
                    console.error('Error fetching block timestamp:', err);
                    return { ...event, blockTimestamp: Date.now() / 1000 };
                  }
                })
              );

              allEvents.push(...eventsWithTimestamps);
            } catch (err) {
              console.error(
                `Error fetching ${eventName} events from block ${currentFrom} to ${currentTo}:`,
                err
              );
            }

            currentFrom = currentTo + BigInt(1);
          }

          return allEvents;
        };

        // Fetch all events in parallel with chunking
        const [sentEvents, receivedEvents, claims, deposits, withdrawals] =
          await Promise.all([
            fetchInChunks(
              'Transfer',
              { from: address },
              CONTRACTS.ryUSD as `0x${string}`,
              RyUSDabi
            ),
            fetchInChunks(
              'Transfer',
              { to: address },
              CONTRACTS.ryUSD as `0x${string}`,
              RyUSDabi
            ),
            fetchInChunks(
              'RyBONDClaimed',
              { user: address },
              CONTRACTS.ryBOND as `0x${string}`,
              RyBONDabi
            ),
            fetchInChunks(
              'Deposit',
              { user: address },
              CONTRACTS.ryUSD as `0x${string}`,
              RyUSDabi
            ),
            fetchInChunks(
              'Withdrawal',
              { user: address },
              CONTRACTS.ryUSD as `0x${string}`,
              RyUSDabi
            ),
          ]);

        setTransferEvents([...sentEvents, ...receivedEvents]);
        setClaimEvents(claims);
        setDepositEvents(deposits);
        setWithdrawalEvents(withdrawals);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchTransferEvents();
  }, [address, publicClient]);

  // Parse and combine all transactions
  const transactions: Transaction[] = useMemo(() => {
    if (!address) return [];

    const allTransactions: Transaction[] = [];

    // Create deposit event lookup map by mintIndex AND blockNumber as fallback
    const depositMapByIndex = new Map();
    const depositMapByBlock = new Map();
    depositEvents.forEach((event: any) => {
      const mintIndex = Number(event.args?.mintIndex);
      const blockNumber = Number(event.blockNumber);
      depositMapByIndex.set(mintIndex, event);
      depositMapByBlock.set(blockNumber, event);
    });

    // Parse mint history with actual transaction hashes from Deposit events
    if (mintHistory && Array.isArray(mintHistory)) {
      const mintTxs = mintHistory.map((record: any, index: number) => {
        // Try to find deposit event by mintIndex first, then by blockNumber as fallback
        let depositEvent = depositMapByIndex.get(index);
        if (!depositEvent) {
          depositEvent = depositMapByBlock.get(Number(record.blockNumber));
        }

        return {
          id: `mint-${index}`,
          type: 'mint' as const,
          amount: Number(formatUnits(record.amount, 6)),
          timestamp: Number(record.timestamp),
          blockNumber: Number(record.blockNumber),
          txHash:
            depositEvent?.transactionHash ||
            `0x${record.blockNumber.toString(16).padStart(64, '0')}`,
          status: 'success' as const,
        };
      });
      allTransactions.push(...mintTxs);
    }

    // Parse transfer events
    if (transferEvents && Array.isArray(transferEvents)) {
      const transferTxs = transferEvents
        .filter(event => {
          // Filter out mint/burn transactions (from/to zero address)
          const from = event.args?.from as string;
          const to = event.args?.to as string;
          const zeroAddress = '0x0000000000000000000000000000000000000000';
          return from !== zeroAddress && to !== zeroAddress;
        })
        .map((event: any, index: number) => {
          const from = event.args?.from as string;
          const to = event.args?.to as string;
          const isSent = from.toLowerCase() === address.toLowerCase();
          const txType: 'transfer_sent' | 'transfer_received' = isSent
            ? 'transfer_sent'
            : 'transfer_received';

          return {
            id: `transfer-${event.transactionHash}-${index}`,
            type: txType,
            amount: Number(
              formatUnits((event.args?.value as bigint) || BigInt(0), 6)
            ),
            timestamp: event.blockTimestamp || Date.now() / 1000,
            blockNumber: Number(event.blockNumber),
            txHash: event.transactionHash as string,
            from: isSent ? undefined : from,
            to: isSent ? to : undefined,
            status: 'success' as const,
          };
        });
      allTransactions.push(...transferTxs);
    }

    // Parse claim events
    if (claimEvents && Array.isArray(claimEvents)) {
      const claimTxs = claimEvents.map((event: any, index: number) => ({
        id: `claim-${event.transactionHash}-${index}`,
        type: 'claim' as const,
        amount: Number(
          formatUnits((event.args?.amount as bigint) || BigInt(0), 6)
        ),
        timestamp:
          event.blockTimestamp ||
          Number((event.args?.timestamp as bigint) || Date.now() / 1000),
        blockNumber: Number(event.blockNumber),
        txHash: event.transactionHash as string,
        status: 'success' as const,
      }));
      allTransactions.push(...claimTxs);
    }

    // Parse withdrawal events
    if (withdrawalEvents && Array.isArray(withdrawalEvents)) {
      const withdrawalTxs = withdrawalEvents.map(
        (event: any, index: number) => ({
          id: `withdraw-${event.transactionHash}-${index}`,
          type: 'withdraw' as const,
          amount: Number(
            formatUnits((event.args?.amount as bigint) || BigInt(0), 6)
          ),
          timestamp: event.blockTimestamp || Date.now() / 1000,
          blockNumber: Number(event.blockNumber),
          txHash: event.transactionHash as string,
          status: 'success' as const,
        })
      );
      allTransactions.push(...withdrawalTxs);
    }

    // Sort by timestamp descending (newest first)
    allTransactions.sort((a, b) => b.timestamp - a.timestamp);

    // Apply filters
    let filtered = allTransactions;

    if (filters?.type && filters.type !== 'all') {
      filtered = filtered.filter(tx => tx.type === filters.type);
    }

    if (filters?.dateFrom) {
      filtered = filtered.filter(tx => tx.timestamp >= filters.dateFrom!);
    }

    if (filters?.dateTo) {
      filtered = filtered.filter(tx => tx.timestamp <= filters.dateTo!);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        tx =>
          tx.txHash.toLowerCase().includes(searchLower) ||
          tx.type.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [
    mintHistory,
    transferEvents,
    claimEvents,
    depositEvents,
    withdrawalEvents,
    address,
    filters,
  ]);

  const refetch = async () => {
    refetchMints();
    // Manually trigger re-fetch of events
    if (!address || !publicClient) return;

    setIsLoadingEvents(true);
    try {
      const currentBlock = await publicClient.getBlockNumber();
      const BLOCK_RANGE = 9000;
      const TOTAL_BLOCKS = 50000;
      const fromBlock = currentBlock - BigInt(TOTAL_BLOCKS);

      const fetchInChunks = async (
        eventName: string,
        args: any,
        contractAddress: `0x${string}`,
        abi: any
      ) => {
        const allEvents = [];
        let currentFrom = fromBlock;

        while (currentFrom < currentBlock) {
          const currentTo =
            currentFrom + BigInt(BLOCK_RANGE) > currentBlock
              ? currentBlock
              : currentFrom + BigInt(BLOCK_RANGE);

          try {
            const events = await publicClient.getContractEvents({
              address: contractAddress,
              abi,
              eventName,
              args,
              fromBlock: currentFrom,
              toBlock: currentTo,
            });

            const eventsWithTimestamps = await Promise.all(
              events.map(async event => {
                try {
                  const block = await publicClient.getBlock({
                    blockNumber: event.blockNumber,
                  });
                  return { ...event, blockTimestamp: Number(block.timestamp) };
                } catch (err) {
                  return { ...event, blockTimestamp: Date.now() / 1000 };
                }
              })
            );

            allEvents.push(...eventsWithTimestamps);
          } catch (err) {
            console.error(`Error fetching ${eventName}:`, err);
          }

          currentFrom = currentTo + BigInt(1);
        }

        return allEvents;
      };

      const [sentEvents, receivedEvents, claims, deposits, withdrawals] =
        await Promise.all([
          fetchInChunks(
            'Transfer',
            { from: address },
            CONTRACTS.ryUSD as `0x${string}`,
            RyUSDabi
          ),
          fetchInChunks(
            'Transfer',
            { to: address },
            CONTRACTS.ryUSD as `0x${string}`,
            RyUSDabi
          ),
          fetchInChunks(
            'RyBONDClaimed',
            { user: address },
            CONTRACTS.ryBOND as `0x${string}`,
            RyBONDabi
          ),
          fetchInChunks(
            'Deposit',
            { user: address },
            CONTRACTS.ryUSD as `0x${string}`,
            RyUSDabi
          ),
          fetchInChunks(
            'Withdrawal',
            { user: address },
            CONTRACTS.ryUSD as `0x${string}`,
            RyUSDabi
          ),
        ]);

      setTransferEvents([...sentEvents, ...receivedEvents]);
      setClaimEvents(claims);
      setDepositEvents(deposits);
      setWithdrawalEvents(withdrawals);
    } catch (error) {
      console.error('Error refetching events:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  return {
    transactions,
    isLoading: isLoadingMints || isLoadingEvents,
    refetch,
  };
}
