import { requireAdmin, requirePermission } from "@/shared/lib/server/auth";
import AdminRefundsClient from "./_components/AdminRefundsClient";

export const dynamic = "force-dynamic";

export default async function AdminRefundsPage() {
  await requireAdmin();
  // Every refund route the page calls needs refunds:manage; without it (the
  // admin secretary) the page was only 403s. Back to the console instead.
  await requirePermission("refunds:manage", "/admin");
  return <AdminRefundsClient />;
}
