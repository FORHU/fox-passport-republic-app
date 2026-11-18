import type { Appearance } from "@stripe/stripe-js";

export type Theme = "dark" | "light";

/** Where the chosen theme is kept — this browser only, like the map theme. */
export const THEME_STORAGE_KEY = "fp-theme";

/** Dark until someone picks Light: the app's look before themes existed. */
export const DEFAULT_THEME: Theme = "dark";

/**
 * Runs in <head> before the first paint (see app/layout.tsx), so a saved
 * Light choice never flashes the dark default first. Mirrors `applyTheme`;
 * kept as a string because it executes before any bundle loads.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"){var e=document.documentElement;e.classList.remove("dark");e.classList.add("light");e.style.colorScheme="light"}}catch(e){}})()`;

/** Puts the theme on <html>, where every token in globals.css keys off it. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = theme;
}

/**
 * Stripe's embedded components take literal colours, not CSS variables, so
 * they get the theme's values from here (globals.css: --canvas/--surface,
 * ink, and the readable dark lime used for accent text on light).
 */
export function stripeAppearanceColors(theme: Theme = currentTheme()) {
  return theme === "light"
    ? {
        colorPrimary: "#4A6B10",
        colorBackground: "#ffffff",
        colorText: "#15171C",
      }
    : {
        colorPrimary: "#C4E85A",
        colorBackground: "#0B0C0F",
        colorText: "#ffffff",
      };
}

/**
 * The Payment Element at checkout sits on a panel (globals.css: --surface),
 * not the page canvas, so its background is the surface colour.
 */
const STRIPE_ELEMENTS_SURFACE: Record<Theme, string> = {
  dark: "#14161B",
  light: "#ffffff",
};

/**
 * Appearance for the checkout Payment Element. Shared by every checkout so
 * they stay alike; pass the store's theme so a switch restyles the form
 * (react-stripe-js forwards a changed appearance to elements.update()).
 * Light sets placeholder and error colours that read at AA on white.
 */
export function stripeElementsAppearance(
  theme: Theme = currentTheme(),
): Appearance {
  const variables = {
    ...stripeAppearanceColors(theme),
    colorBackground: STRIPE_ELEMENTS_SURFACE[theme],
  };
  return theme === "light"
    ? {
        theme: "stripe",
        variables: {
          ...variables,
          colorTextPlaceholder: "#6B6E76",
          colorDanger: "#B42318",
        },
      }
    : { theme: "night", variables };
}

/** The theme the page is showing right now. */
export function currentTheme(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}
