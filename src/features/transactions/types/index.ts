export type TransactionType = 'mint' | 'withdraw' | 'claim' | 'transfer_sent' | 'transfer_received';

export type TransactionStatus = 'success' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  timestamp: number;
  blockNumber: number;
  txHash: string;
  from?: string;
  to?: string;
  status: TransactionStatus;
  currency: 'USD' | 'IDR';
}

export interface TransactionFilters {
  type?: TransactionType | 'all';
  currency?: 'USD' | 'IDR' | 'all';
  dateFrom?: number;
  dateTo?: number;
  search?: string;
}
