import { requireAuth } from "@/shared/lib/server/auth";

// Signed-in only — a calendar of your own bookings means nothing anonymously.
export default async function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <>{children}</>;
}
