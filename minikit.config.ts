const ROOT_URL = process.env.NEXT_PUBLIC_URL
  ? `https://${process.env.NEXT_PUBLIC_URL}`
  : 'http://localhost:3000';

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
    tags: ['stablecoin', 'gamified', 'rewards', 'yield'],
    heroImageUrl: `${ROOT_URL}/homepage.png`,
    tagline: 'Earn on Every Transfer',
    ogTitle: 'Ryvyn Pay',
    ogDescription:
      'Liquid streaming yield. No locks. Boost via gamified predictions.',
    ogImageUrl: `${ROOT_URL}/homepage.png`,
  },
} as const;
