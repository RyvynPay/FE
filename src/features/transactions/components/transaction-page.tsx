'use client';

import { PageContainer } from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fadeInItem, staggerContainer } from '@/lib/animations';
import { RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useTransactionHistory } from '../hooks/use-transaction-history';
import { TransactionFilters } from '../types';
import TransactionFiltersComponent from './transaction-filters';
import TransactionTable from './transaction-table';

export default function TransactionPage() {
  const { address, isConnected } = useAccount();
  const [filters, setFilters] = useState<TransactionFilters>({ type: 'all' });
  const { transactions, isLoading, refetch } = useTransactionHistory(filters);

  const handleRefresh = () => {
    refetch();
  };

  if (!isConnected) {
    return (
      <PageContainer>
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Please connect your wallet to view your transaction history.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6 py-8">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div
        className="space-y-6 py-8"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          variants={fadeInItem}
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Transaction History
            </h1>
            <p className="text-muted-foreground mt-2">
              View all your ryUSD transactions including mints, claims, and
              transfers.
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeInItem}>
          <TransactionFiltersComponent onFiltersChange={setFilters} />
        </motion.div>

        {/* Transaction Table */}
        <motion.div variants={fadeInItem}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={transactions} />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
