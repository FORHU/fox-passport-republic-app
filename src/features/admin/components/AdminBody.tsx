"use client";

import { ReactNode } from "react";
import { useAdminSection } from "@/features/admin/hooks/useAdminSection";

/**
 * Decides which admin body a phone sees.
 *
 * The page used to render `MobileAdminView` below `lg` and put the entire real
 * dashboard behind `hidden lg:flex`, so a phone could reach nothing but the
 * overview — the sidebar's own nav links had no content to show.
 *
 * Now the mobile overview is only the *dashboard* section. Pick anything else from
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
  const showOverview = useAdminSection() === "dashboard";

  return (
    <>
      {/* `flex-1`: this sits in the console's flex row, and without it the
          overview shrank to its content's width, leaving a narrow column
          beside empty space on tablets. `min-w-0` lets wide tables scroll
          inside themselves instead of widening the page. */}
      {showOverview && (
        <div className="lg:hidden flex-1 min-w-0">{overview}</div>
      )}
      <div
        className={
          showOverview ? "hidden lg:flex flex-1 min-w-0" : "flex flex-1 min-w-0"
        }
      >
        {content}
      </div>
    </>
  );
}

export default AdminBody;
