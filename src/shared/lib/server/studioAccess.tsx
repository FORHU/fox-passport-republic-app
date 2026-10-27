import { requireAuth } from "./auth";
import { hasAnyPermission, type Permission } from "@/shared/lib/permissions";
import { StudioAccessDenied } from "@/shared/components/auth/StudioAccessDenied";

/**
 * Each Studio, the permission that opens it (the same ones its dashboard list
 * page requires) and where to apply for the role.
 */
export const STUDIOS = {
  event: {
    studio: "Event Studio",
    role: "Event Foxer",
    applyHref: "/creator-dashboard/apply",
    permissions: ["template:manage"],
  },
  venue: {
    studio: "Venue Studio",
    role: "Venue Foxer",
    applyHref: "/venue-foxer/apply",
    permissions: ["venue:manage"],
  },
  gear: {
    studio: "Gear Studio",
    role: "Gear Foxer",
    applyHref: "/foxer/apply?type=asset",
    permissions: ["asset:manage"],
  },
  service: {
    studio: "Service Studio",
    role: "Talent or Performer Foxer",
    applyHref: "/foxer/apply?type=service",
    permissions: ["service:manage", "performer:manage"],
  },
} as const satisfies Record<
  string,
  {
    studio: string;
    role: string;
    applyHref: string;
    permissions: readonly Permission[];
  }
>;

export type Studio = keyof typeof STUDIOS;

/**
 * The access-denied page for someone signed in without this Studio's role, or
 * null when they may open it. Signed-out visitors are redirected home by
 * `requireAuth`, as before.
 *
 * The Studios sit under layouts that only require a session, because the
 * role applications (`/foxer/apply`, `/venue-foxer/apply`) live beside them.
 * UI only — the API refuses every save regardless.
 */
export async function studioAccessDenied(studio: Studio) {
  const user = await requireAuth();
  const { permissions, ...copy } = STUDIOS[studio];
  return hasAnyPermission(user, permissions) ? null : (
    <StudioAccessDenied {...copy} />
  );
}
