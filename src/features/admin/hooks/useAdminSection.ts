"use client";

import { useParams } from "next/navigation";
import {
  DEFAULT_ADMIN_SECTION,
  isAdminSection,
  type AdminSectionId,
} from "@/features/admin/sections";

/**
 * The admin section being viewed, read from the URL (`/admin/[section]`).
 * `/admin` itself is the dashboard. The route rejects unknown ids, so the
 * fallback only covers the dashboard and the moment before params resolve.
 */
export function useAdminSection(): AdminSectionId {
  const params = useParams<{ section?: string }>();
  const section = params?.section;
  return isAdminSection(section) ? section : DEFAULT_ADMIN_SECTION;
}
