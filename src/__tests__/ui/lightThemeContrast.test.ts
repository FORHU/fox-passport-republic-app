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
      .filter((file) => /#02040a/i.test(readFileSync(file, "utf8")))
      .map((file) => relative(SRC, file));
    expect(offenders).toEqual([]);
  });

  it("gives Stripe light colours in light mode", () => {
    expect(stripeAppearanceColors("light").colorBackground).toBe("#ffffff");
    expect(stripeAppearanceColors("dark").colorBackground).toBe("#02040a");
  });

  it("mixes ink into role colours only through the theme variable", () => {
    expect(roleTextColor("#34d399")).toBe(
      "color-mix(in srgb, #34d399, #0e1018 var(--hue-ink-mix, 0%))",
    );
  });
});
