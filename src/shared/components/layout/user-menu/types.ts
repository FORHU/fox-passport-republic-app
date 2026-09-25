import { FOXER_ROLES } from "@/shared/constants/roles";
import {
  LayoutDashboard,
  Building2,
  Coins,
  Compass,
  Landmark,
} from "lucide-react";

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
  },
  {
    key: "investor",
    label: "Partner Foxer Hub",
    href: "/republic/investments",
    applyHref: "/foxer/create-investment",
    description: "Equipment depots, capital map & inventory",
    icon: Coins,
    emoji: "💎",
    roleTypes: ["investor"],
  },
  {
    key: "mayor",
    label: "Venue Foxer Console",
    href: "/mayor",
    applyHref: "/mayor/apply",
    description: "Venue listing & space manager",
    icon: Landmark,
    emoji: "🏛️",
    roleTypes: ["venueFoxer"],
  },
];
