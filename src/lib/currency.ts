import { Currency } from '@/types/currency';

/**
 * Format balance with currency prefix and thousand separators
 * @param balance - The balance as a string or number
 * @param currency - The currency type (USD or IDR)
 * @returns Formatted balance string (e.g., "$1,000.00" or "Rp 100,000.00")
 */
export function formatBalance(balance: string | number, currency: Currency): string {
  const num = Number(balance);
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === Currency.USD ? `$${formatted}` : `Rp ${formatted}`;
}

/**
 * Format amount without currency prefix (just thousand separators)
 * @param amount - The amount as a string or number
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted amount string (e.g., "1,000.00")
 */
export function formatAmount(amount: string | number, decimals: number = 2): string {
  const num = Number(amount);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
