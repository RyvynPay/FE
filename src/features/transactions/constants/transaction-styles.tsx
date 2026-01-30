import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Coins,
  Gift,
} from 'lucide-react';
import { TransactionType } from '../types';

export const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case 'mint':
      return <Coins className="h-4 w-4 text-green-500" />;
    case 'withdraw':
      return <ArrowLeftRight className="h-4 w-4 text-orange-500" />;
    case 'claim':
      return <Gift className="h-4 w-4 text-purple-500" />;
    case 'transfer_sent':
      return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    case 'transfer_received':
      return <ArrowDownLeft className="h-4 w-4 text-blue-500" />;
  }
};

export const getTransactionLabel = (type: TransactionType) => {
  switch (type) {
    case 'mint':
      return 'Mint';
    case 'withdraw':
      return 'Withdraw';
    case 'claim':
      return 'Claim';
    case 'transfer_sent':
      return 'Sent';
    case 'transfer_received':
      return 'Received';
  }
};

export const getTransactionColor = (type: TransactionType) => {
  switch (type) {
    case 'mint':
      return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'withdraw':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
    case 'claim':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    case 'transfer_sent':
      return 'bg-red-500/10 text-red-600 dark:text-red-400';
    case 'transfer_received':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
  }
};
