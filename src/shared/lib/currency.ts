/**
 * Central seam for currency/locale formatting. The backend doesn't yet carry
 * a currency on every money-bearing row (e.g. `Payout` has none), so this
 * falls back to `DEFAULT_CURRENCY` — but callers should pass a real currency
 * code through as soon as one is available on the data, rather than a new
 * hardcoded literal. Locale is intentionally the browser's own (`undefined`),
 * not a hardcoded `"en-PH"` — FoxPassport is not PH-only.
 *
 * For a display currency the *viewer* chose (rather than the currency an
 * amount is actually denominated in), see `useCurrency()` in
 * `shared/providers/CurrencyProvider` — it converts through live FX rates
 * before calling `formatCurrency` here. This function alone never converts.
 */
export const DEFAULT_CURRENCY = "PHP";

export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Converts `amount` (denominated in `from`) into `to` using `rates`, a map of currency->value-per-1-`base` where `base === from` or `rates` already covers both. */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number> | undefined,
  ratesBase: string,
): number {
  if (from === to) return amount;
  if (!rates) return amount;

  // rates are per-1-unit-of-ratesBase. Convert `amount` (in `from`) to
  // ratesBase first, then to `to`.
  const fromRate = from === ratesBase ? 1 : rates[from];
  const toRate = to === ratesBase ? 1 : rates[to];
  if (!fromRate || !toRate) return amount;

  const amountInBase = amount / fromRate;
  return amountInBase * toRate;
}
