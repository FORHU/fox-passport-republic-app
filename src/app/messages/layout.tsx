import { requireAuth } from "@/shared/lib/server/auth";

// Signed-in only — your conversations mean nothing anonymously. The page had
// no guard at all, so signed-out visitors got an empty inbox.
export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <>{children}</>;
}
