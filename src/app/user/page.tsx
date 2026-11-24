import { redirect } from "next/navigation";
import { requireAuth } from "@/shared/lib/server/auth";

export const dynamic = "force-dynamic";

/**
 * The Citizen Dashboard is gone: /user is your own public passport, the same
 * place the Passport tab opens. Kept as a redirect so the links and fallbacks
 * that still point here (back links, getDashboardPath) keep working.
 */
export default async function UserIndex() {
  const user = await requireAuth();
  redirect(`/user/${encodeURIComponent(user.id)}`);
}
