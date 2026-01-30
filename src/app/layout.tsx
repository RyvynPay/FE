import Lenis from '@/components/lenis';
import Navbar from '@/components/navbar';
import { Toaster } from '@/components/ui/sonner';
import { PrivyProvider } from '@/providers/PrivyProvider';
import type { Metadata } from 'next';
import { Figtree, Outfit } from 'next/font/google';
import './globals.css';

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
