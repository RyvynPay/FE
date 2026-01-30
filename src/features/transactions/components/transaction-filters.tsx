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

export default function TransactionFiltersComponent({
  onFiltersChange,
}: TransactionFiltersProps) {
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const handleTypeChange = (type: TransactionType | 'all') => {
    setSelectedType(type);
    onFiltersChange({
      type,
      search: searchQuery,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFiltersChange({
      type: selectedType,
      search: value,
    });
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by transaction hash..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-10"
          />
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
    </Card>
  );
}
