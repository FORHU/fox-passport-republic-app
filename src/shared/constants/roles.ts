/**
 * The two role vocabularies, and the difference between them.
 *
 * `SystemRole` is the administrative axis: exactly one per user, and what the
 * admin console is gated on. `RoleType` is the supply side: a user may hold
 * several, and it is how someone becomes able to list a venue or build an event.
 *
 * Names only, for the same reason as `permissions.ts` — what either role *may
 * do* is the API's grant table, and this app is told the resulting permissions
 * rather than working them out. Nothing here should ever grow a
 * role-to-permission map.
 */

export const SYSTEM_ROLES = ["user", "admin_secretary", "admin"] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const ROLE_TYPES = [
  "venueFoxer",
  "eventFoxer",
  "gearFoxer",
  "serviceFoxer",
  "investor",
] as const;
export type RoleType = (typeof ROLE_TYPES)[number];

/**
 * The four supply-side roles — everything except `investor`, which applies and
 * is approved but has nothing to manage.
 *
 * This list was written out by hand in five components, once as `VENUE_ROLES`,
 * once as `FOXER_ROLES`, and once inline. Five copies of one fact is five
 * chances for the day a sixth role appears.
 */
export const FOXER_ROLES: readonly RoleType[] = [
  "venueFoxer",
  "eventFoxer",
  "gearFoxer",
  "serviceFoxer",
];

/**
 * True when this one role is a supply-side role.
 *
 * Takes a plain `string` because role names arrive from API payloads and
 * cookies, where they are untyped. Callers filtering such a list would
 * otherwise have to cast at every site.
 */
export function isFoxerRole(role: string): boolean {
  return (FOXER_ROLES as readonly string[]).includes(role);
}

/** True when the user holds any supply-side role. */
export function isFoxer(
  roleType: readonly string[] | null | undefined,
): boolean {
  return (roleType ?? []).some(isFoxerRole);
}
