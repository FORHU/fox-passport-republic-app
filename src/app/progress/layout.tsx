import { requireAuth } from "@/shared/lib/server/auth";

// Signed-in only, checked on the server as well as by the page's RequireAuth.
export default async function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <>{children}</>;
}
