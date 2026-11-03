import { FOXER_ROLES } from "@/shared/constants/roles";
import { Users, Building2, Coins } from "lucide-react";
import type { User } from "@/shared/auth/types";
import { canAccessCreatorDashboard } from "@/shared/lib/dashboard-path";

export interface RoleDef {
  key: string;
  label: string;
  href: string;
  applyHref: string;
  description: string;
  icon: React.ElementType;
  emoji: string;
  /** Whether this user can open the dashboard — the same rule as the page's
   * own guard, so the menu never offers a dashboard that bounces. */
  canOpen: (user: User) => boolean;
  /** Overrides `label` when the viewer holds exactly one of `roleTypes`
   * (excluding "organizer", which rides along on this dashboard without
   * making it "theirs") — so a venueFoxer with no other Foxer role sees
   * "Venue Foxer Console" instead of the generic umbrella name. */
  labelFor?: (roleTypes: string[]) => string;
  descriptionFor?: (roleTypes: string[]) => string;
}

// The Citizen Dashboard and Republic Foxer Hub used to be listed here too;
// they are Passport and Republic in the top bar now (APP_NAV), so the menu
// keeps the default Foxers page plus the role dashboards.
export const ROLE_DEFS: RoleDef[] = [
  {
    key: "foxers",
    label: "Foxers",
    href: "/search",
    applyHref: "",
    description: "Find Foxers, venues & packages",
    icon: Users,
    emoji: "🦊",
    canOpen: () => true,
  },
  {
    key: "host",
    label: "Creator Dashboard",
    href: "/creator-dashboard",
    applyHref: "/creator-dashboard/apply",
    description: "Manage your venues & events",
    icon: Building2,
    emoji: "🏠",
    // Foxers, organizers (their Appointments are run from here) and investors
    // (partnerships and payouts) — whoever `requireHost` lets in.
    canOpen: canAccessCreatorDashboard,
    // One entry for one dashboard, named for whoever holds it. A venueFoxer
    // with no other Foxer role gets "their" name — see singleFoxerRoleLabel
    // below; there used to be a separate "Venue Foxer Console" entry, a second
    // door to one room. Investors had their own "Investor Dashboard" entry to
    // this same page, so a Foxer who also invests saw two.
    labelFor: (roleTypes) =>
      singleFoxerRoleLabel(roleTypes) === "venueFoxer"
        ? "Venue Foxer Console"
        : isInvestorOnly(roleTypes)
          ? "Investor Dashboard"
          : "Creator Dashboard",
    descriptionFor: (roleTypes) =>
      singleFoxerRoleLabel(roleTypes) === "venueFoxer"
        ? "Venue listing & space manager"
        : isInvestorOnly(roleTypes)
          ? "Partnerships, investments & payouts"
          : "Manage your venues & events",
  },
  {
    key: "investor",
    label: "Partner Foxer Hub",
    href: "/republic/investments",
    // Was "/foxer/create-investment" — that's the wizard an *approved*
    // investor uses to register a stream, not the application. There was no
    // application form at all, so a locked citizen hit that wizard and got
    // blocked with no way forward.
    applyHref: "/foxer/apply-investor",
    description: "Equipment depots, capital map & inventory",
    icon: Coins,
    emoji: "💎",
    canOpen: (user) => (user.roleType ?? []).includes("investor"),
  },
];

/** An investor with no Foxer or organizer role: the dashboard is theirs as
 * an investor. */
function isInvestorOnly(roleTypes: string[]): boolean {
  return (
    roleTypes.includes("investor") &&
    !roleTypes.includes("organizer") &&
    !FOXER_ROLES.some((r) => roleTypes.includes(r))
  );
}

/** The one FOXER_ROLES entry the viewer holds, or null if they hold none or
 * more than one. `organizer` doesn't count — it never makes this dashboard
 * "theirs" the way a supply-side role does. */
function singleFoxerRoleLabel(roleTypes: string[]): string | null {
  const held = FOXER_ROLES.filter((r) => roleTypes.includes(r));
  return held.length === 1 ? held[0] : null;
}
