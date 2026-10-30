import { requireAnyPermission } from "@/shared/lib/server/auth";

/**
 * Partnerships are proposed by investors and received by event and venue
 * owners — the same people the dashboard's Partnerships tab is shown to. The
 * page is a client component, so the guard lives here.
 */
export default async function PartnershipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyPermission([
    "partnership:propose",
    "template:manage",
    "venue:manage",
  ]);
  return children;
}
