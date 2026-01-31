# RYVYN Frontend

A Next.js 15 frontend for the Ryvyn Protocol — the stablecoin that pays you to use it.

## Features

- **Dual Stablecoin Support** — Mint ryUSD (from USDC) or ryIDR (from IDRX)
- **Profitable Payments** — Both sender and receiver earn rewards on every transfer
- **Stream Bonds (ryBOND)** — Real-time streaming rewards, claimable anytime
- **Prediction Boost** — Gamified yield with Chainlink oracle integration
- **Treasury Dashboard** — View asset allocation and real-time yields
- **Transaction History** — Complete log of transfers and rewards

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Auth | Privy |
| Web3 | wagmi v2 + viem |
| State | TanStack Query |
| UI Components | Radix UI + shadcn/ui |
| Charts | Recharts |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── mint/               # Mint ryUSD/ryIDR
│   ├── transfer/           # Send payments
│   ├── boost/              # Prediction market boost
│   ├── stream-bonds/       # Claim rewards
│   ├── treasury/           # Treasury dashboard
│   └── transactions/       # Transaction history
├── features/               # Feature modules
│   ├── landing-page/       # Homepage components
│   ├── mint/               # Minting logic & UI
│   ├── transfer/           # Transfer logic & UI
│   ├── gamification/       # Boost/prediction features
│   ├── reward/             # ryBOND claiming
│   └── treasury/           # Treasury components
├── components/             # Shared UI components
├── hooks/                  # Custom React hooks
├── config/                 # Contract addresses & config
├── abis/                   # Smart contract ABIs
└── lib/                    # Utilities
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
pnpm build
pnpm start
```

## Smart Contracts (Base Sepolia)

| Contract | Address |
|----------|---------|
| ryUSD | `0x9e94BC6b8D81e94D5272d8e2F2BcCAC267C50E88` |
| ryIDR | `0x5403ff9c5c173eEe01255Eeb4d0925bD21748311` |
| ryBOND | `0xB367b39466BE0c5a94DbFCa22bF8A8B356A35a93` |
| TreasuryManager | `0xc6841f2d1900d239579B809b1fc8D1b5D0716Eee` |
| YieldManager | `0xEF835c04113FC566028B537B18cA0B1E9d745b80` |
| PredictionBoost | `0xeAd4547a2b3d7c7D999b59e4966B1264c31A5Ea2` |

## Design Philosophy

- Glass morphism effects with dark theme
- Smooth scroll animations (Lenis)
- Real-time data visualization
- Mobile-responsive layout

## License

MIT
