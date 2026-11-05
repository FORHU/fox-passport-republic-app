"use server";

import { revalidateTag } from "next/cache";
import { getUser } from "@/shared/lib/server/auth";
import { hasPermission } from "@/shared/lib/permissions";

/**
 * Marks the server-cached category list (`tags: ["categories"]`, used by the
 * categories page and the sitemap) stale after an admin edits the catalog, so
 * the change shows without waiting out the 5-minute revalidate. Only someone
 * who may manage categories can trigger it.
 */
export async function revalidateCategories(): Promise<boolean> {
  const user = await getUser();
  if (!hasPermission(user, "categories:manage")) return false;
  revalidateTag("categories", "max");
  return true;
}
