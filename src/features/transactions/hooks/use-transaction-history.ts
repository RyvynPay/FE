import RyBONDabi from '@/abis/RyBOND.json';
import RyIDRabi from '@/abis/RyIDR.json';
import RyUSDabi from '@/abis/RyUSD.json';
import { BASE_SEPOLIA_CHAIN_ID, CONTRACTS } from '@/config/contracts';
import { useEffect, useMemo, useState } from 'react';
import { useAccount, usePublicClient, useReadContract } from 'wagmi';
import { Transaction, TransactionFilters } from '../types';
import { EventWithTimestamp, fetchEventsInChunks } from '../utils/fetch-events';
import {
  parseClaimEvents,
  parseMintHistory,
  parseTransferEvents,
  parseWithdrawalEvents,
} from '../utils/parse-transactions';

export function useTransactionHistory(filters?: TransactionFilters) {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [usdEvents, setUsdEvents] = useState<{
    transfers: EventWithTimestamp[];
    deposits: EventWithTimestamp[];
    withdrawals: EventWithTimestamp[];
  }>({ transfers: [], deposits: [], withdrawals: [] });

  const [idrEvents, setIdrEvents] = useState<{
    transfers: EventWithTimestamp[];
    deposits: EventWithTimestamp[];
    withdrawals: EventWithTimestamp[];
  }>({ transfers: [], deposits: [], withdrawals: [] });

  const [claimEvents, setClaimEvents] = useState<EventWithTimestamp[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Fetch ryUSD mint history
  const {
    data: usdMintHistory,
    refetch: refetchUsdMints,
    isLoading: isLoadingUsdMints,
  } = useReadContract({
    address: CONTRACTS.ryUSD as `0x${string}`,
    abi: RyUSDabi,
    functionName: 'getUserMintHistory',
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: { enabled: !!address },
  });

  // Fetch ryIDR mint history
  const {
    data: idrMintHistory,
    refetch: refetchIdrMints,
    isLoading: isLoadingIdrMints,
  } = useReadContract({
    address: CONTRACTS.ryIDR as `0x${string}`,
    abi: RyIDRabi,
    functionName: 'getUserMintHistory',
    args: address ? [address] : undefined,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    query: { enabled: !!address },
  });

  // Fetch all blockchain events
  useEffect(() => {
    const fetchAllEvents = async () => {
      if (!address || !publicClient) {
        return;
      }

      setIsLoadingEvents(true);
      try {
        // Fetch ryUSD events
        const [usdSent, usdReceived, usdDeposits, usdWithdrawals] =
          await Promise.all([
            fetchEventsInChunks(
              publicClient,
              'Transfer',
              { from: address },
              CONTRACTS.ryUSD as `0x${string}`,
              RyUSDabi
            ),
            fetchEventsInChunks(
              publicClient,
              'Transfer',
              { to: address },
              CONTRACTS.ryUSD as `0x${string}`,
              RyUSDabi
            ),
            fetchEventsInChunks(
              publicClient,
              'Deposit',
              { user: address },
              CONTRACTS.ryUSD as `0x${string}`,
              RyUSDabi
            ),
            fetchEventsInChunks(
              publicClient,
              'Withdrawal',
              { user: address },
              CONTRACTS.ryUSD as `0x${string}`,
              RyUSDabi
            ),
          ]);

        // Fetch ryIDR events
        const [idrSent, idrReceived, idrDeposits, idrWithdrawals] =
          await Promise.all([
            fetchEventsInChunks(
              publicClient,
              'Transfer',
              { from: address },
              CONTRACTS.ryIDR as `0x${string}`,
              RyIDRabi
            ),
            fetchEventsInChunks(
              publicClient,
              'Transfer',
              { to: address },
              CONTRACTS.ryIDR as `0x${string}`,
              RyIDRabi
            ),
            fetchEventsInChunks(
              publicClient,
              'Deposit',
              { user: address },
              CONTRACTS.ryIDR as `0x${string}`,
              RyIDRabi
            ),
            fetchEventsInChunks(
              publicClient,
              'Withdrawal',
              { user: address },
              CONTRACTS.ryIDR as `0x${string}`,
              RyIDRabi
            ),
          ]);

        // Fetch claim events (shared ryBOND)
        const claims = await fetchEventsInChunks(
          publicClient,
          'RyBONDClaimed',
          { user: address },
          CONTRACTS.ryBOND as `0x${string}`,
          RyBONDabi
        );

        setUsdEvents({
          transfers: [...usdSent, ...usdReceived],
          deposits: usdDeposits,
          withdrawals: usdWithdrawals,
        });

        setIdrEvents({
          transfers: [...idrSent, ...idrReceived],
          deposits: idrDeposits,
          withdrawals: idrWithdrawals,
        });

        setClaimEvents(claims);
      } catch (error) {
        console.error('❌ Error fetching events:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchAllEvents();
  }, [address, publicClient]);

  // Parse and combine all transactions
  const transactions: Transaction[] = useMemo(() => {
    if (!address) {
      return [];
    }

    const allTransactions: Transaction[] = [];

    // Parse ryUSD transactions
    const usdMints = parseMintHistory(
      usdMintHistory as any[],
      usdEvents.deposits,
      'USD'
    );
    const usdTransfers = parseTransferEvents(
      usdEvents.transfers,
      address,
      'USD'
    );
    const usdWithdrawals = parseWithdrawalEvents(usdEvents.withdrawals, 'USD');

    allTransactions.push(...usdMints, ...usdTransfers, ...usdWithdrawals);

    // Parse ryIDR transactions
    const idrMints = parseMintHistory(
      idrMintHistory as any[],
      idrEvents.deposits,
      'IDR'
    );
    const idrTransfers = parseTransferEvents(
      idrEvents.transfers,
      address,
      'IDR'
    );
    const idrWithdrawals = parseWithdrawalEvents(idrEvents.withdrawals, 'IDR');

    allTransactions.push(...idrMints, ...idrTransfers, ...idrWithdrawals);

    // Parse claim events (knows currency from event args)
    const claims = parseClaimEvents(claimEvents);
    allTransactions.push(...claims);

    // Sort by timestamp descending
    allTransactions.sort((a, b) => b.timestamp - a.timestamp);

    // Apply filters
    let filtered = allTransactions;

    if (filters?.type && filters.type !== 'all') {
      filtered = filtered.filter(tx => tx.type === filters.type);
    }

    if (filters?.currency && filters.currency !== 'all') {
      filtered = filtered.filter(tx => tx.currency === filters.currency);
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
    usdMintHistory,
    idrMintHistory,
    usdEvents,
    idrEvents,
    claimEvents,
    address,
    filters,
  ]);

  const refetch = () => {
    refetchUsdMints();
    refetchIdrMints();
    window.location.reload(); // Simple refetch for now
  };

  return {
    transactions,
    isLoading: isLoadingEvents,
    refetch,
  };
}
