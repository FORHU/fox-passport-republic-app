export interface AppNavItem {
  label: string;
  href: string;
  /** Material Symbols name, used by the mobile bottom nav. */
  icon: string;
  /** Hidden from signed-out visitors: these pages need an account. */
  requiresAuth?: boolean;
}

/**
 * The app's main navigation. The desktop header and the mobile bottom nav
 * show it through `appNavForUser`, so they always offer the same places. Each
 * header keeps its own styling; only the links live here.
 *
 * "Passport" is the user's own public passport. `/user` (the old Citizen
 * Dashboard) now redirects there; `appNavForUser` links it directly. The
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

/**
 * The app nav for a signed-in user: the Passport tab opens their own public
 * passport (/user/<id>) instead of the dashboard (/user). Left out until the
 * user's id is known, so the link never points at a wrong or empty id.
 */
export const appNavForUser = (userId?: string | null): AppNavItem[] =>
  APP_NAV.flatMap((item) =>
    item.href !== "/user"
      ? [item]
      : userId
        ? [{ ...item, href: `/user/${userId}` }]
        : [],
  );

/** The tabs a visitor can use: everything when signed in, public ones otherwise. */
export const appNavFor = (isAuthenticated: boolean): AppNavItem[] =>
  isAuthenticated ? APP_NAV : APP_NAV.filter((item) => !item.requiresAuth);

/** Segment-safe, so "/user" lights up on "/user/passport" but not "/users". */
export const isNavActive = (pathname: string | null, href: string): boolean =>
  !!pathname && (pathname === href || pathname.startsWith(`${href}/`));
