# RYVYN - Stablecoin with Built-in Yield Rewards

A revolutionary stablecoin platform that rewards users on every transfer with real-world asset-backed yields.

## Features

- **Instant Transfer Rewards**: Both sender and recipient earn Stream Bonds on every transaction
- **Real Yield Backing**: Treasury backed by tokenized T-Bills and corporate bonds
- **Tier System**: Level up through Bronze, Silver, Gold, and Platinum tiers for higher multipliers
- **Stream Bonds**: Continuous yield streaming tokens that accumulate real value
- **Transparent Treasury**: Full on-chain visibility of asset allocation and yields

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom animations
- **Language**: TypeScript
- **Icons**: Lucide React

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## UI Components

- **StatCard**: Display key metrics with gradients and trends
- **TransferCard**: Send ryUSD with live reward preview
- **StreamBondsCard**: View and manage your Stream Bonds
- **TreasuryCard**: Real-time treasury allocation and yields
- **TierCard**: Track progress through reward tiers
- **TransactionHistory**: Complete transaction log with rewards

## Design Philosophy

The UI is inspired by Fluidity's clean and modern aesthetic:

- Glass morphism effects
- Gradient accents
- Smooth animations
- Dark theme with pops of color
- Clear data visualization

## Smart Contract Integration

This is a UI-only implementation. To make it functional, integrate with:

- ryUSD smart contract for token transfers
- YieldTreasury contract for treasury data
- StreamBond contract for bond management
- RewardDistributor for calculating rewards

## License

MIT
