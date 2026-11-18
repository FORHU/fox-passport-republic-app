const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Short count for tight UI: 999 → "999", 1234 → "1.2k", 1500000 → "1.5m". */
export function formatCount(n: number): string {
  return compact.format(n).toLowerCase();
}
