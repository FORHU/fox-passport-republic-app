import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  stripeAppearanceColors,
  stripeElementsAppearance,
} from "@/shared/lib/theme";
import { roleTextColor } from "@/shared/constants/roles";

const SRC = join(__dirname, "..", "..");

/** WCAG 2.x contrast ratio between two #rrggbb colours. */
function contrastRatio(a: string, b: string) {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

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

  it("keeps the dark checkout payment form exactly as it was", () => {
    expect(stripeElementsAppearance("dark")).toEqual({
      theme: "night",
      variables: {
        colorPrimary: "#C4E85A",
        colorBackground: "#14161B",
        colorText: "#ffffff",
      },
    });
  });

  it("gives the checkout payment form Stripe's light theme in light mode", () => {
    const { theme, variables } = stripeElementsAppearance("light");
    expect(theme).toBe("stripe");
    expect(variables).toMatchObject(stripeAppearanceColors("light"));
  });

  it.each(["light", "dark"] as const)(
    "keeps checkout payment colours readable at WCAG AA in %s mode",
    (mode) => {
      const { colorBackground, ...colors } =
        stripeElementsAppearance(mode).variables!;
      for (const [name, color] of Object.entries(colors)) {
        expect(
          contrastRatio(color!, colorBackground!),
          `${name} ${color} on ${colorBackground}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it("builds every checkout's Stripe appearance from the theme", () => {
    const offenders = tsxFiles(join(SRC, "features", "booking"))
      .filter((file) =>
        /theme:\s*["']night["']/.test(readFileSync(file, "utf8")),
      )
      .map((file) => relative(SRC, file));
    expect(offenders).toEqual([]);
  });

  it("mixes ink into role colours only through the theme variable", () => {
    expect(roleTextColor("#C4E85A")).toBe(
      "color-mix(in srgb, #C4E85A, #15171C var(--hue-ink-mix, 0%))",
    );
  });
});
