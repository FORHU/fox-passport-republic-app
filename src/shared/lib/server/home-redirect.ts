import { cookies } from "next/headers";
import { APP_HOME } from "@/shared/lib/dashboard-path";
import { getUser } from "./auth";
import { SESSION_COOKIES } from "@/shared/auth/session-cookies";

// Query params whose handlers live on "/" itself: the venue-search view
// (location, category), SessionExpiredToast opening the login modal (auth),
// and the OAuth error toasts mounted only on that page. With any of these
// present, "/" renders as it always has.
const LANDING_PARAMS = [
  "location",
  "category",
  "auth",
  "googleAuthError",
  "facebookAuthError",
];


/**
 * Where "/" should send this visitor instead of rendering the landing page,
 * or null to render it.
 *
 * Cookie presence is checked first so signed-out visitors cost nothing. A
 * present cookie is then confirmed with a live `getUser()` (/profile), so a
 * stale or revoked cookie renders the landing instead of redirecting. The
 * destination is public, so a wrong answer can never loop back here.
 */
export async function getSignedInRedirect(
  params: Record<string, string | string[] | undefined>,
): Promise<string | null> {
  if (LANDING_PARAMS.some((key) => params[key] !== undefined)) return null;

  const cookieStore = await cookies();
  const hasSession = SESSION_COOKIES.some(
    (name) => cookieStore.get(name)?.value,
  );
  if (!hasSession) return null;

  const user = await getUser();
  return user ? APP_HOME : null;
}
