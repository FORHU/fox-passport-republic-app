import type { Permission } from "@/shared/lib/permissions";

/**
 * Every admin console section, in sidebar order: the single source for the
 * sidebar, the header title, and the `/admin/[section]` route's validation.
 *
 * Each item names the capability it needs. `admin_secretary` holds only the
 * queue permissions, so Citizens, Bookings, Categories, Disputes, Policies and
 * Settings simply do not render for them — and the API refuses those routes
 * anyway, so hiding them is courtesy rather than the control. The route
 * redirects a section the viewer may not open back to the dashboard.
 */
export const ADMIN_SECTIONS = [
  {
    label: "Dashboard",
    title: "Dashboard Overview",
    icon: "dashboard",
    id: "dashboard",
    permission: "admin:access",
  },
  {
    label: "Bookings",
    title: "All Bookings",
    icon: "confirmation_number",
    id: "bookings",
    permission: "bookings:read:all",
  },
  {
    label: "Citizens",
    title: "Citizen Management",
    icon: "group",
    id: "citizens",
    permission: "users:read",
  },
  {
    label: "Events",
    title: "Event Templates",
    icon: "event",
    id: "events",
    group: "Manage",
    permission: "queue:read",
  },
  {
    // Ended with nobody checked in; an admin settles each booking.
    label: "Needs review",
    title: "Needs Review",
    icon: "fact_check",
    id: "needs-review",
    permission: "queue:read",
  },
  {
    label: "Categories",
    title: "Categories",
    icon: "category",
    id: "categories",
    permission: "categories:manage",
  },
  {
    label: "Venues",
    title: "Venues",
    icon: "storefront",
    id: "venues",
    permission: "queue:read",
  },
  {
    label: "Map",
    title: "Map",
    icon: "map",
    id: "map",
    permission: "queue:read",
  },
  {
    label: "Assets",
    title: "Assets & Gear",
    icon: "inventory_2",
    id: "assets",
    group: "Listings",
    permission: "queue:read",
  },
  {
    label: "Services",
    title: "Services",
    icon: "build",
    id: "services",
    permission: "queue:read",
  },
  {
    label: "Disputes",
    title: "Disputes",
    icon: "gavel",
    id: "disputes",
    group: "System",
    // What the API's dispute routes check.
    permission: "disputes:resolve",
  },
  {
    label: "Reports",
    title: "Reports",
    icon: "flag",
    id: "reports",
    permission: "queue:read",
  },
  {
    label: "Identity",
    title: "Identity Checks",
    icon: "verified_user",
    id: "identity",
    permission: "users:manage",
  },
  {
    label: "Policies",
    title: "Policies",
    icon: "policy",
    id: "policies",
    permission: "policies:manage",
  },
  {
    label: "Platform Fees",
    title: "Platform Fees",
    icon: "payments",
    id: "platform-fees",
    permission: "fees:manage",
  },
  {
    label: "Promotions",
    title: "Promotions",
    icon: "sell",
    id: "promotions",
    permission: "promotions:manage",
  },
  {
    label: "Settings",
    title: "Settings",
    icon: "settings",
    id: "settings",
    permission: "categories:manage",
  },
] as const satisfies readonly {
  label: string;
  title: string;
  icon: string;
  id: string;
  group?: string;
  permission: Permission;
}[];

export type AdminSection = (typeof ADMIN_SECTIONS)[number];
export type AdminSectionId = AdminSection["id"];

export const DEFAULT_ADMIN_SECTION: AdminSectionId = "dashboard";

export function isAdminSection(id: unknown): id is AdminSectionId {
  return ADMIN_SECTIONS.some((s) => s.id === id);
}

export function getAdminSection(id: string): AdminSection | undefined {
  return ADMIN_SECTIONS.find((s) => s.id === id);
}

/** The dashboard lives at `/admin`; every other section at `/admin/<id>`. */
export function adminSectionHref(id: AdminSectionId): string {
  return id === DEFAULT_ADMIN_SECTION ? "/admin" : `/admin/${id}`;
}
