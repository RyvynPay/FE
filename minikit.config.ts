const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

export const minikitConfig = {
  accountAssociation: {
    header:
      'eyJmaWQiOjIwNTczNTQsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhBZDA3MTY2MTA1MjFlNzBGRkRiZGQ5OUY3MDQyNDViNzA0ZDhCOTExIn0',
    payload: 'eyJkb21haW4iOiJyeXZ5bi1wYXkudmVyY2VsLmFwcCJ9',
    signature:
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEGTskhuJTVq2GYOcTJCS5OG4cALitJanpYn9B_ZI0WqEDv6zTw68kXaQFs05DOp16F-gh-j9HJCljBxpUw_qXL3HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  miniapp: {
    version: '1',
    name: 'Ryvyn Pay',
    subtitle: 'Earn on Every Transfer',
    description:
      'Continuous streaming yields on USDC & IDRX without locking funds. Claim anytime or accelerate rewards via gamified predictions',
    screenshotUrls: [
      `${ROOT_URL}/pages/transfer.png`,
      `${ROOT_URL}/pages/reward.png`,
      `${ROOT_URL}/pages/gamification.png`,
    ],
    iconUrl: `${ROOT_URL}/logo-1024.png`,
    splashImageUrl: `${ROOT_URL}/pages/homepage.png`,
    splashBackgroundColor: '#000000',
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: 'finance',
    tags: ['stablecoin', 'gamified', 'rewards', 'yield'],
    heroImageUrl: `${ROOT_URL}/pages/homepage.png`,
    tagline: 'Earn on Every Transfer',
    ogTitle: 'Ryvyn Pay',
    ogDescription:
      'Liquid streaming yield. No locks. Boost via gamified predictions.',
    ogImageUrl: `${ROOT_URL}/pages/homepage.png`,
  },
} as const;
