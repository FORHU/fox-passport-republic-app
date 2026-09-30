import { FOXER_ROLES } from "@/shared/constants/roles";
import { LayoutDashboard, Building2, Coins, Compass } from "lucide-react";

export interface RoleDef {
  key: string;
  label: string;
  href: string;
  applyHref: string;
  description: string;
  icon: React.ElementType;
  emoji: string;
  roleTypes: string[];
  systemRoles?: string[];
  /** Overrides `label` when the viewer holds exactly one of `roleTypes`
   * (excluding "organizer", which rides along on this dashboard without
   * making it "theirs") — so a venueFoxer with no other Foxer role sees
   * "Venue Foxer Console" instead of the generic umbrella name. */
  labelFor?: (roleTypes: string[]) => string;
  descriptionFor?: (roleTypes: string[]) => string;
}

export const ROLE_DEFS: RoleDef[] = [
  {
    key: "user",
    label: "Citizen Dashboard",
    href: "/user",
    applyHref: "",
    description: "Your personal passport hub",
    icon: LayoutDashboard,
    emoji: "🏙️",
    roleTypes: [],
    systemRoles: ["user", "admin", "admin_secretary"],
  },
  {
    key: "republic",
    label: "Republic Foxer Hub",
    href: "/republic",
    applyHref: "",
    description: "Community feed, marketplace & map",
    icon: Compass,
    emoji: "🌐",
    roleTypes: [],
    systemRoles: ["user", "admin", "admin_secretary"],
  },
  {
    key: "host",
    label: "Creator Dashboard",
    href: "/creator-dashboard",
    applyHref: "/creator-dashboard/apply",
    description: "Manage your venues & events",
    icon: Building2,
    emoji: "🏠",
    // Organizers aren't Foxers, but their Appointments are run from here.
    roleTypes: [...FOXER_ROLES, "organizer"],
    // A venueFoxer with no other Foxer role gets "their" name for this same
    // dashboard instead of the generic umbrella one — see
    // singleFoxerRoleLabel below. There used to be a separate "Venue Foxer
    // Console" menu entry for this; it only ever redirected into this same
    // dashboard's Venues tab, so it was a second door to one room.
    labelFor: (roleTypes) =>
      singleFoxerRoleLabel(roleTypes) === "venueFoxer"
        ? "Venue Foxer Console"
        : "Creator Dashboard",
    descriptionFor: (roleTypes) =>
      singleFoxerRoleLabel(roleTypes) === "venueFoxer"
        ? "Venue listing & space manager"
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
    roleTypes: ["investor"],
  },
];

/** The one FOXER_ROLES entry the viewer holds, or null if they hold none or
 * more than one. `organizer` doesn't count — it never makes this dashboard
 * "theirs" the way a supply-side role does. */
function singleFoxerRoleLabel(roleTypes: string[]): string | null {
  const held = FOXER_ROLES.filter((r) => roleTypes.includes(r));
  return held.length === 1 ? held[0] : null;
}
