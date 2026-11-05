import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/shared/lib/server/auth";
import { hasPermission } from "@/shared/lib/permissions";
import {
  DEFAULT_ADMIN_SECTION,
  getAdminSection,
} from "@/features/admin/sections";

/**
 * `/admin/<section>` — one URL per console section. The console is rendered by
 * `(console)/layout.tsx`; this page only guards the URL: unknown sections are a
 * 404, the dashboard's canonical URL is `/admin`, and a section the viewer may
 * not open sends them back to the dashboard (the API refuses its data anyway).
 * The admin check is repeated here because Next renders a layout and its page
 * in parallel, so a page should not lean on its layout's.
 */
export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: id } = await params;
  const section = getAdminSection(id);

  if (!section) notFound();
  if (section.id === DEFAULT_ADMIN_SECTION) redirect("/admin");

  const user = await requireAdmin();
  if (!hasPermission(user, section.permission)) redirect("/admin");
  return null;
}
