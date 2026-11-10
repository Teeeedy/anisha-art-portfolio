/**
 * The single place prices are formatted. Prices are stored as integers in the
 * smallest currency unit (cents) — never floats.
 */
export function formatPrice(
  amountInCents: number,
  currency: string = 'AUD',
  locale: string = 'en-AU',
): string {
  const amount = amountInCents / 100;
  const wholeDollars = Number.isInteger(amount);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: wholeDollars ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Unknown currency code — fall back to something readable rather than throwing at build time.
    return `${currency} ${amount.toFixed(wholeDollars ? 0 : 2)}`;
  }
}
