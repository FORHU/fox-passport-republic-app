/**
 * Joins place names ("Baguio", "Benguet", "Philippines") with commas, leaving
 * out empties and any part the text already says — so a location that already
 * ends in the country doesn't get it a second time ("Baguio, Philippines,
 * Philippines").
 */
export function joinPlace(
  ...parts: Array<string | null | undefined>
): string {
  const out: string[] = [];
  for (const raw of parts) {
    const part = raw?.trim();
    if (!part) continue;
    const seen = out.some((p) => p.toLowerCase().includes(part.toLowerCase()));
    if (!seen) out.push(part);
  }
  return out.join(", ");
}
