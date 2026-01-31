'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { TransactionFilters, TransactionType } from '../types';

interface TransactionFiltersProps {
  onFiltersChange: (filters: TransactionFilters) => void;
}

const TRANSACTION_TYPES: { value: TransactionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'mint', label: 'Mint' },
  { value: 'withdraw', label: 'Withdraw' },
  { value: 'claim', label: 'Claim' },
  { value: 'transfer_sent', label: 'Sent' },
  { value: 'transfer_received', label: 'Received' },
];

const CURRENCIES: { value: 'all' | 'USD' | 'IDR'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'USD', label: 'ryUSD' },
  { value: 'IDR', label: 'ryIDR' },
];

export default function TransactionFiltersComponent({
  onFiltersChange,
}: TransactionFiltersProps) {
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>(
    'all'
  );
  const [selectedCurrency, setSelectedCurrency] = useState<'all' | 'USD' | 'IDR'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleTypeChange = (type: TransactionType | 'all') => {
    setSelectedType(type);
    onFiltersChange({
      type,
      currency: selectedCurrency,
      search: searchQuery,
    });
  };

  const handleCurrencyChange = (currency: 'all' | 'USD' | 'IDR') => {
    setSelectedCurrency(currency);
    onFiltersChange({
      type: selectedType,
      currency,
      search: searchQuery,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFiltersChange({
      type: selectedType,
      currency: selectedCurrency,
      search: value,
    });
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div className="relative max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by transaction hash..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Currency Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Currency:</span>
            <div className="flex gap-2">
              {CURRENCIES.map(curr => (
                <Button
                  key={curr.value}
                  variant={selectedCurrency === curr.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCurrencyChange(curr.value)}
                >
                  {curr.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-2">
            <Filter className="text-muted-foreground h-4 w-4" />
            <div className="flex flex-wrap gap-2">
              {TRANSACTION_TYPES.map(type => (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeChange(type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
