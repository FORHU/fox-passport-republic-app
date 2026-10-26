import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { stripeAppearanceColors } from "@/shared/lib/theme";
import { roleTextColor } from "@/shared/constants/roles";

const SRC = join(__dirname, "..", "..");

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return tsxFiles(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

/**
 * Light mode works by swapping theme variables, so a page that paints the
 * dark canvas as a literal stays near-black in light mode under ink text
 * (the creator dashboard did, on eleven screens).
 */
describe("light theme contrast", () => {
  it("paints page backgrounds with var(--canvas), not the dark literal", () => {
    const offenders = tsxFiles(SRC)
      .filter((file) => /#0B0C0F/i.test(readFileSync(file, "utf8")))
      .map((file) => relative(SRC, file));
    expect(offenders).toEqual([]);
  });

  it("gives Stripe light colours in light mode", () => {
    expect(stripeAppearanceColors("light").colorBackground).toBe("#ffffff");
    expect(stripeAppearanceColors("dark").colorBackground).toBe("#0B0C0F");
  });

  it("mixes ink into role colours only through the theme variable", () => {
    expect(roleTextColor("#C4E85A")).toBe(
      "color-mix(in srgb, #C4E85A, #15171C var(--hue-ink-mix, 0%))",
    );
  });
});
