"use client";

import { ReactNode } from "react";
import { useUIStore } from "@/shared/store/useUIStore";

/**
 * Decides which admin body a phone sees.
 *
 * The page used to render `MobileAdminView` below `lg` and put the entire real
 * dashboard behind `hidden lg:flex`, so a phone could reach nothing but the
 * overview — the sidebar's own nav links had no content to show.
 *
 * Now the mobile overview is only the *dashboard* tab. Pick anything else from
 * the drawer and the real `AdminContent` renders, which already handles narrow
 * widths (its tables scroll inside themselves).
 *
 * Both halves are rendered by the same parent, so `AdminContent` still mounts
 * exactly once — it is the visibility that changes, not the tree.
 */
export function AdminBody({
  overview,
  content,
}: {
  overview: ReactNode;
  content: ReactNode;
}) {
  const activeAdminTab = useUIStore((s) => s.activeAdminTab);
  const showOverview = activeAdminTab === "dashboard";

  return (
    <>
      {showOverview && <div className="lg:hidden">{overview}</div>}
      <div className={showOverview ? "hidden lg:flex flex-1" : "flex flex-1"}>
        {content}
      </div>
    </>
  );
}

export default AdminBody;
