import Lenis from '@/components/lenis';
import Navbar from '@/components/navbar';
import { Toaster } from '@/components/ui/sonner';
import { PrivyProvider } from '@/providers/PrivyProvider';
import type { Metadata, Viewport } from 'next';
import { Figtree, Outfit } from 'next/font/google';
import { minikitConfig } from '../../minikit.config';
import './globals.css';

const { miniapp } = minikitConfig;

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'RYVYN | Stablecoin with Built-in Yield Rewards',
  description:
    'Earn rewards on every transfer. The stablecoin that pays you to use it.',
  icons: {
    icon: '/logo.png',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: miniapp.ogTitle,
    description: miniapp.ogDescription,
    openGraph: {
      title: miniapp.ogTitle,
      description: miniapp.ogDescription,
      url: miniapp.homeUrl,
      siteName: miniapp.name,
      images: [
        {
          url: miniapp.ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${miniapp.name} Banner`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    other: {
      'base:app_id': '697df513c6a03f3fe39cb5ba',
      'fc:miniapp': JSON.stringify({
        version: 'next',
        imageUrl: miniapp.heroImageUrl,
        button: {
          title: `Launch ${miniapp.name}`,
          action: {
            type: 'launch_miniapp',
            name: miniapp.name,
            url: miniapp.homeUrl,
            splashImageUrl: miniapp.splashImageUrl,
            splashBackgroundColor: miniapp.splashBackgroundColor,
          },
        },
      }),
      'fc:frame': JSON.stringify({
        version: miniapp.version,
        imageUrl: miniapp.heroImageUrl,
        button: {
          title: `Launch ${miniapp.name}`,
          action: {
            name: `Launch ${miniapp.name}`,
            type: 'launch_frame',
          },
        },
      }),
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 0.5,
  maximumScale: 3,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${figtree.className} ${outfit.variable}`}>
        <Lenis />
        <PrivyProvider>
          <Navbar />
          {children}
        </PrivyProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
