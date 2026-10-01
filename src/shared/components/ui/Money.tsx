"use client";

import { useOptionalCurrency } from "@/shared/providers/CurrencyProvider";
import { formatCompactCurrency, formatCurrency } from "@/shared/lib/currency";

interface MoneyProps {
  /** The amount, denominated in `from`. */
  amount: number | string | null | undefined;
  /** The currency `amount` is in — the platform currency unless the record
   * says otherwise. */
  from?: string;
  /** "₱1.2M" instead of "₱1,240,500.00", for tight spaces. */
  compact?: boolean;
}

/**
 * A price shown in the viewer's chosen display currency (converted through
 * live FX rates) — the drop-in replacement for a hardcoded
 * `₱{price.toLocaleString()}`, so a currency change reaches every listing,
 * card and total without each component wiring up `useCurrency()` itself.
 *
 * Not for an amount that is actually being charged or paid out: that's
 * processed in its own currency, so show it with `formatCurrency` instead
 * of a converted estimate.
 */
export function Money({ amount, from, compact }: MoneyProps) {
  const currency = useOptionalCurrency();
  const value = Number(amount ?? 0);
  const safe = Number.isFinite(value) ? value : 0;
  // Outside the provider (an isolated render, a test) there's no viewer
  // preference to convert to — show the amount in its own currency.
  if (!currency) {
    return (
      <>
        {compact
          ? formatCompactCurrency(safe, from)
          : formatCurrency(safe, from)}
      </>
    );
  }
  return (
    <>
      {compact
        ? currency.formatCompact(safe, from)
        : currency.format(safe, from)}
    </>
  );
}
