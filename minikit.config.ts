const ROOT_URL = process.env.NEXT_PUBLIC_URL
  ? `https://${process.env.NEXT_PUBLIC_URL}`
  : 'http://localhost:3000';

export const minikitConfig = {
  accountAssociation: {
    // this will be added in step 5
    header: '',
    payload: '',
    signature: '',
  },
  miniapp: {
    version: '1',
    name: 'Ryvyn Pay',
    subtitle:
      'Streaming rewards and gamified boosts for fully liquid stablecoins.',
    description:
      'RYVYN is a stablecoin protocol on Base designed for users who need constant liquidity. Unlike traditional staking that locks funds, RYVYN provides continuous streaming yields on idle assets (USDC & IDRX). Users can claim rewards anytime or accelerate them through gamified on-chain predictions.',
    screenshotUrls: [
      `${ROOT_URL}/homepage.png`,
      `${ROOT_URL}/transfer.png`,
      `${ROOT_URL}/reward.png`,
      `${ROOT_URL}/gamification.png`,
    ],
    iconUrl: `${ROOT_URL}/logo.png`,
    splashImageUrl: `${ROOT_URL}/homepage.png`,
    splashBackgroundColor: '#000000',
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: 'finance',
    tags: ['stablecoin', 'gamified defi', 'streaming rewards', 'liquid yield'],
    heroImageUrl: `${ROOT_URL}/homepage.png`,
    tagline:
      'Streaming rewards and gamified boosts for fully liquid stablecoins.',
    ogTitle: 'Ryvyn Pay',
    ogDescription:
      'RYVYN is a stablecoin protocol on Base designed for users who need constant liquidity. Unlike traditional staking that locks funds, RYVYN provides continuous streaming yields on idle assets (USDC & IDRX). Users can claim rewards anytime or accelerate them through gamified on-chain predictions.',
    ogImageUrl: `${ROOT_URL}/homepage.png`,
  },
} as const;
