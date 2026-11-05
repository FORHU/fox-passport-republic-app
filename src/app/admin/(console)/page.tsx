import { requireAdmin } from "@/shared/lib/server/auth";

/**
 * `/admin` — the dashboard section. The console itself is rendered by
 * `(console)/layout.tsx`; the guard is repeated here because Next renders a
 * layout and its page in parallel, so a page should not lean on its layout's.
 */
export default async function AdminDashboardPage() {
  await requireAdmin();
  return null;
}
