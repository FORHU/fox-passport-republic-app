import { requireAdmin } from "@/shared/lib/server/auth";
import AdminRefundsClient from "./_components/AdminRefundsClient";

export const dynamic = "force-dynamic";

export default async function AdminRefundsPage() {
  await requireAdmin();
  return <AdminRefundsClient />;
}
