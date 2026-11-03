export interface AppNavItem {
  label: string;
  href: string;
  /** Material Symbols name, used by the mobile bottom nav. */
  icon: string;
  /** Hidden from signed-out visitors: these pages need an account. */
  requiresAuth?: boolean;
}

/**
 * The app's main navigation, shared by every desktop header and the mobile
 * bottom nav so they always offer the same places. Each header keeps its own
 * styling; only the links live here.
 *
 * "Passport" is the Citizen Dashboard ("your personal passport hub"); the
 * avatar menu already covers profile and account, so it isn't "Profile".
 */
export const APP_NAV: AppNavItem[] = [
  { label: "Foxers", href: "/search", icon: "group" },
  { label: "Map", href: "/venues/map", icon: "map" },
  { label: "Republic", href: "/republic", icon: "dynamic_feed" },
  {
    label: "Bookings",
    href: "/booking",
    icon: "confirmation_number",
    requiresAuth: true,
  },
  { label: "Passport", href: "/user", icon: "person", requiresAuth: true },
];

/** The tabs a visitor can use: everything when signed in, public ones otherwise. */
export const appNavFor = (isAuthenticated: boolean): AppNavItem[] =>
  isAuthenticated ? APP_NAV : APP_NAV.filter((item) => !item.requiresAuth);

/** Segment-safe, so "/user" lights up on "/user/passport" but not "/users". */
export const isNavActive = (pathname: string | null, href: string): boolean =>
  !!pathname && (pathname === href || pathname.startsWith(`${href}/`));
