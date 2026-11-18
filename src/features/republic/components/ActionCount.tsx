import { formatCount } from "@/shared/lib/formatCount";

/** A post action's count beside its icon ("1.2k"). Nothing at 0, so every
 * action in the bar treats zero the same way. */
export function ActionCount({ n }: { n: number }) {
  if (!n || n <= 0) return null;
  return <span className="tabular-nums">{formatCount(n)}</span>;
}
