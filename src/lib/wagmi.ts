import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

// RYVYN Protocol is deployed on Base Sepolia for the Base Indonesia Hackathon
export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
});
