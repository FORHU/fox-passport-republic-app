import { requireAuth } from "@/shared/lib/server/auth";

/**
 * Signed-in only: a person's bookings, the item and venue checkout steps,
 * and their confirmation screens.
 *
 * `proxy.ts` only checks that a session cookie is *present* - it verifies
 * nothing, by design, so this app need not hold the API's signing key. The real
 * check is here: `requireAuth` resolves the session against a live `/profile`
 * call and redirects when there is nothing behind the cookie.
 *
 * A layout rather than a page, so the whole tree is covered by one guard
 * instead of by each page remembering. `getUser` is memoised per render pass,
 * so this adds no round trip to a page that already calls it.
 */
export default async function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <>{children}</>;
}
