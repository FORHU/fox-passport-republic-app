import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  stripeAppearanceColors,
  stripeElementsAppearance,
} from "@/shared/lib/theme";
import { roleTextColor } from "@/shared/constants/roles";
import {
  CATEGORY_BADGE_TINT,
  CATEGORY_COLORS,
  categoryBadgeStyle,
  getCategoryColor,
} from "@/shared/components/ui/VenuesMap";

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

/** sRGB mix of two #rrggbb colours, `weight` (0–1) of `a`. */
function mixHex(a: string, b: string, weight: number) {
  const channel = (hex: string, i: number) => parseInt(hex.slice(i, i + 2), 16);
  return (
    "#" +
    [1, 3, 5]
      .map((i) =>
        Math.round(channel(a, i) * weight + channel(b, i) * (1 - weight))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

/**
 * Listing cards (app#376): venue-type badges were pale hue on a pale tint of
 * itself (~1.3:1 on white), and each listing page painted its own faint
 * surface. Badges now mix ink in through --category-ink-mix and listing cards
 * share the --color-listing tokens.
 */
describe("listing card contrast", () => {
  const css = readFileSync(join(SRC, "app", "globals.css"), "utf8");
  const lightInkMix = Number(
    /\.light\s*\{[^}]*--category-ink-mix:\s*(\d+)%/.exec(css)?.[1],
  );
  const darkListing = /:root\s*\{[^}]*--listing:\s*(#[0-9a-fA-F]{6})/.exec(
    css,
  )?.[1];

  it("defines the badge ink mix and listing surface for both themes", () => {
    expect(lightInkMix).toBeGreaterThan(0);
    expect(css).toMatch(/:root\s*\{[^}]*--category-ink-mix:\s*0%/);
    expect(darkListing).toBeDefined();
  });

  it.each(Object.entries(CATEGORY_COLORS))(
    "keeps the %s badge at WCAG AA in light and dark",
    (_, color) => {
      const tint = CATEGORY_BADGE_TINT / 100;
      const lightInk = mixHex(color, "#15171C", 1 - lightInkMix / 100);
      const lightTint = mixHex(color, "#ffffff", tint);
      expect(contrastRatio(lightInk, lightTint)).toBeGreaterThanOrEqual(4.5);
      const darkTint = mixHex(color, darkListing!, tint);
      expect(contrastRatio(color, darkTint)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("builds badge text from the theme variable, not a literal per theme", () => {
    const style = categoryBadgeStyle("indoor");
    expect(style.color).toBe(
      "color-mix(in srgb, #C4E85A, #15171C var(--category-ink-mix, 0%))",
    );
    expect(categoryBadgeStyle("unknown").color).toContain(
      getCategoryColor("unknown"),
    );
  });

  it("paints listing cards with the shared listing tokens", () => {
    const files = [
      "features/venue/components/VenuesMapPageClient.tsx",
      "features/landing/journey/PackageResults.tsx",
      "app/wishlists/WishlistsClient.tsx",
      "features/search/components/ProviderList.tsx",
      "features/search/components/EventFoxersSection.tsx",
    ];
    for (const file of files) {
      const source = readFileSync(join(SRC, file), "utf8");
      expect(source, file).toContain("bg-listing");
      expect(source, file).toContain("border-listing-edge");
      expect(source, file).not.toMatch(/bg-white\/3\b/);
    }
  });
});
