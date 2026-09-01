import { cache } from "react";
import { redirect } from "next/navigation";
import { getServerApi } from "./data";
import { hasPermission, canAccessAdmin } from "@/shared/lib/permissions";

// Memoised per render pass. requireAuth/requireHost are called by a page and
// then again inside the data helpers it calls, so the profile lookup - a
// network round trip plus a cookie-parsing fallback - would otherwise run
// several times to answer the same question. `cache` collapses that to one
// resolution per request without changing any call site.
export const getUser = cache(async () => {
  try {
    const api = await getServerApi();
    const { data } = await api.get("/profile");
    return data?.data || data || null;
  } catch (error) {
    // A 401 is the server's authoritative answer: this session is over. Falling
    // back to the `fox_user` cookie here is what let a dead session sail through
    // requireAuth/requireAdmin - the guard saw a stale admin profile, passed,
    // and then every data fetch on the page 401'd. The cookie is display data
    // that outlives the token; it is not proof of anything.
    const status = (error as { status?: number })?.status;
    if (status === 401 || status === 403) return null;

    // Any other failure (the API is down, DNS, a timeout) is "cannot tell", not
    // "not logged in". Fall back so a backend blip does not sign everyone out.
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const userStr = cookieStore.get("fox_user")?.value;
      if (userStr) return JSON.parse(decodeURIComponent(userStr));
    } catch {
      return null;
    }
    return null;
  }
});

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect("/");
  }
  return user;
}

export async function checkRole(_userId: string, role: string) {
  const user = await getUser();
  return user?.systemRole === role;
}

export async function requireAdmin() {
  const user = await requireAuth();
  // Capability, not role: admin_secretary reaches the console; what they may
  // do inside it is enforced per route by the API.
  if (!canAccessAdmin(user)) {
    redirect("/");
  }
  return user;
}

/**
 * Gates the supply-side dashboard. Access comes from holding any RoleType;
 * admins are let through too.
 *
 * The old `host`/`mayor`/`foxer` values checked here were RoleType names from
 * before the Foxer rename, compared against `systemRole`, which can only ever
 * be `user` or `admin` — so that branch never matched anything.
 */
export async function requireHost() {
  const user = await requireAuth();
  const roleType: string[] = user?.roleType ?? [];
  const hostRoleTypes = [
    "eventFoxer",
    "venueFoxer",
    "gearFoxer",
    "serviceFoxer",
  ];

  // Host areas are an admin override over someone else's data, which the
  // secretary deliberately does not have.
  const hasAccess =
    hasPermission(user, "bookings:read:all") ||
    roleType.some((r) => hostRoleTypes.includes(r));

  if (!hasAccess) {
    redirect("/");
  }
  return user;
}
