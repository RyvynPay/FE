import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Loader2, LogOut, Wallet } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function WalletConnect() {
  const pathname = usePathname();
  const { ready, authenticated, login, logout, linkWallet } = usePrivy();

  const { wallets } = useWallets();

  const connectedWallet = wallets[0];
  const isHome = pathname === '/';

  const handleLogin = async () => {
    if (!ready) return;
    if (authenticated) {
      await linkWallet();
    } else {
      await login();
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!ready) {
    return (
      <Button disabled className="h-12 rounded-full px-6 text-base font-medium">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (authenticated && connectedWallet) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'h-12 rounded-full border px-6 text-base font-medium',
              isHome
                ? 'border-secondary/20 bg-secondary/10 text-secondary hover:bg-secondary/20'
                : 'border-white/10 bg-white/10 text-white hover:bg-white/20'
            )}
          >
            <Wallet className="mr-2 h-4 w-4" />
            <span className="font-mono">
              {formatAddress(connectedWallet.address)}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={handleLogin}
      className={cn(
        'h-12 rounded-2xl px-8 text-base font-semibold transition-all hover:scale-105',
        isHome
          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
          : 'bg-background text-foreground hover:bg-background/90'
      )}
    >
      {authenticated ? 'Link Wallet' : 'Connect Wallet'}
    </Button>
  );
}
