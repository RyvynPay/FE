import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getTransactionColor,
  getTransactionIcon,
  getTransactionLabel,
} from '../constants/transaction-styles';

import { formatDistanceToNow } from 'date-fns';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Transaction } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
}

const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-7 w-7 p-0"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
};

export default function TransactionTable({
  transactions,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg">No transactions found</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Your transaction history will appear here
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Transaction Hash</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map(tx => (
          <TableRow key={tx.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                {getTransactionIcon(tx.type)}
                <Badge
                  variant="outline"
                  className={getTransactionColor(tx.type)}
                >
                  {getTransactionLabel(tx.type)}
                </Badge>
              </div>
            </TableCell>
            <TableCell className="font-mono font-medium">
              <div className="flex items-center gap-1">
                <span className="w-4 text-right">
                  {tx.type === 'transfer_sent' || tx.type === 'withdraw'
                    ? '-'
                    : '+'}
                </span>
                <span className="tabular-nums">
                  {tx.amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-muted-foreground">ryUSD</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(tx.timestamp * 1000), {
                addSuffix: true,
              })}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {tx.to && tx.type === 'transfer_sent' && (
                <span className="text-muted-foreground">
                  To: {shortenAddress(tx.to)}
                </span>
              )}
              {tx.from && tx.type === 'transfer_received' && (
                <span className="text-muted-foreground">
                  From: {shortenAddress(tx.from)}
                </span>
              )}
              {(tx.type === 'mint' ||
                tx.type === 'withdraw' ||
                tx.type === 'claim') && (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">
                  {shortenAddress(tx.txHash)}
                </span>
                <CopyButton text={tx.txHash} />
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={tx.status === 'success' ? 'default' : 'secondary'}
                className={
                  tx.status === 'success'
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : ''
                }
              >
                {tx.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
