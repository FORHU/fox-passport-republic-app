import { requireAuth } from "@/shared/lib/server/auth";

/**
 * Signed-in only.
 *
 * `middleware.ts` only checks that a session cookie is *present* - it verifies
 * nothing, by design, so this app need not hold the API's signing key. The real
 * check is here: `requireAuth` resolves the session against a live `/profile`
 * call and redirects when there is nothing behind the cookie.
 *
 * A layout rather than a page, so the whole tree is covered by one guard
 * instead of by each page remembering.
 */
export default async function MatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <>{children}</>;
}
