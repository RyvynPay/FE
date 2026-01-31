// Currency type system for dual-currency support (ryUSD and ryIDR)

export enum Currency {
  USD = 'USD',
  IDR = 'IDR',
}

export interface CurrencyConfig {
  type: Currency;

  // Token contracts
  underlyingToken: `0x${string}`;  // USDC or IDRX
  stablecoin: `0x${string}`;        // ryUSD or ryIDR
  treasuryManager: `0x${string}`;   // TreasuryManagerBase or TreasuryManagerIDR
  vault?: `0x${string}`;            // Primary vault (optional, used for IDR)

  // Display
  symbol: string;              // 'ryUSD' or 'ryIDR'
  underlyingSymbol: string;    // 'USDC' or 'IDRX'
  decimals: number;            // 6 for both

  // APY info
  apy: string;
  strategyType: 'multi' | 'single';

  // UI colors (optional)
  color: string;
  gradientFrom: string;
  gradientTo: string;
}
