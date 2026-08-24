import { redirect } from "next/navigation";
import { getServerApi } from "./data";

export async function getUser() {
  try {
    const api = await getServerApi();
    const { data } = await api.get("/profile");
    return data?.data || data || null;
  } catch {
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
}

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
  // `SystemRole` is only `user | admin` — there is no `super_admin` tier.
  if (user?.systemRole !== "admin") {
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
  const hostRoleTypes = ['eventFoxer', 'venueFoxer', 'gearFoxer', 'serviceFoxer'];

  const hasAccess =
    user?.systemRole === "admin" ||
    roleType.some((r) => hostRoleTypes.includes(r));

  if (!hasAccess) {
    redirect("/");
  }
  return user;
}
