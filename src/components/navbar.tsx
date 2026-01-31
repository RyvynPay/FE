'use client';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { WalletConnect } from '@/components/wallet-connect';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { label: 'Mint', href: '/mint' },
  { label: 'Transfer', href: '/transfer' },
  { label: 'Reward', href: '/stream-bonds' },
  { label: 'Boost', href: '/boost' },
  { label: 'Treasury', href: '/treasury' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show on scroll up or at the top, hide on scroll down
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isHome = pathname === '/';

  return (
    <div
      className={cn(
        'pointer-events-none fixed top-0 left-0 z-50 w-full transition-transform duration-300',
        isVisible ? 'translate-y-0' : '-translate-y-full'
      )}
    >
      <div className="p-3 md:px-9 md:py-6">
        <nav
          className={cn(
            'pointer-events-auto relative flex flex-col items-center justify-between rounded-2xl px-4 py-3 shadow-lg transition-colors duration-300 md:flex-row md:rounded-4xl md:px-6 md:py-4 md:pl-8',
            isHome
              ? 'bg-background text-secondary'
              : 'bg-secondary text-background'
          )}
        >
          <div className="flex w-full items-center justify-between md:w-auto">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="leading-none font-black tracking-tighter uppercase"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
              >
                RYVYN
              </Link>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="flex items-center gap-2 md:hidden">
              <WalletConnect />
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2">
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className={cn(
                    'w-[300px] sm:w-[400px]',
                    isHome
                      ? 'bg-background text-secondary'
                      : 'bg-secondary text-background border-primary/20'
                  )}
                >
                  <nav className="mt-8 flex flex-col gap-4">
                    {NAV_LINKS.map(link => (
                      <SheetClose key={link.href} asChild>
                        <Link
                          href={link.href}
                          className="text-lg font-medium transition-colors hover:opacity-70"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden items-center gap-9 md:flex">
            {NAV_LINKS.map(link => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium transition-colors"
                  style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.6rem)' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-pill"
                      className="bg-secondary-foreground/10 absolute inset-0 rounded-md"
                      transition={{ type: 'spring', duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Actions (Desktop) */}
          <div className="hidden items-center space-x-2 md:flex">
            <WalletConnect />
          </div>
        </nav>
      </div>
    </div>
  );
}
