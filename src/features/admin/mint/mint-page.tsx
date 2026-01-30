'use client';

import { useState } from 'react';
import { useMockUSDC } from '@/hooks/useMockUSDC';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MintPage() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const { adminMint, isMintingAdmin } = useMockUSDC();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <div className="border rounded-lg p-6 max-w-md">
        <h2 className="text-2xl font-bold mb-4">Admin Faucet (No Limit)</h2>
        
        <div className="space-y-4">
          <Input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient address"
          />
          
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          
          <Button
            onClick={() => adminMint(recipient, amount)}
            disabled={isMintingAdmin || !recipient || !amount}
          >
            {isMintingAdmin ? 'Minting...' : 'Mint to Address'}
          </Button>
        </div>
      </div>
    </div>
  );
}