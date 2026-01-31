import { CONTRACTS } from './contracts';
import { Currency, CurrencyConfig } from '@/types/currency';

export const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  [Currency.USD]: {
    type: Currency.USD,
    underlyingToken: CONTRACTS.mockUSDC,
    stablecoin: CONTRACTS.ryUSD,
    treasuryManager: CONTRACTS.treasuryManager,
    symbol: 'ryUSD',
    underlyingSymbol: 'USDC',
    decimals: 6,
    apy: '5.8%',
    strategyType: 'multi',
    color: '#3b82f6', // blue
    gradientFrom: '#3b82f6',
    gradientTo: '#1d4ed8',
  },
  [Currency.IDR]: {
    type: Currency.IDR,
    underlyingToken: CONTRACTS.mockIDRX,
    stablecoin: CONTRACTS.ryIDR,
    treasuryManager: CONTRACTS.treasuryManagerIDR,
    vault: CONTRACTS.vaultIDRX,
    symbol: 'ryIDR',
    underlyingSymbol: 'IDRX',
    decimals: 6,
    apy: '3.5%',
    strategyType: 'single',
    color: '#10b981', // green
    gradientFrom: '#10b981',
    gradientTo: '#059669',
  },
};

// Helper function to get config by currency
export function getCurrencyConfig(currency: Currency): CurrencyConfig {
  return CURRENCY_CONFIGS[currency];
}

// Get all available currencies
export function getAvailableCurrencies(): Currency[] {
  return Object.values(Currency);
}
