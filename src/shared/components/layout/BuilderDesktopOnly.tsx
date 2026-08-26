"use client";

import Link from "next/link";

/**
 * Below `md` (768px) the event and venue builders are unusable: both are driven
 * by HTML5 drag-and-drop (`draggable` / `onDragStart` / `onDrop`), which does
 * not fire on touch devices. See `docs/responsive-plan.md` section 4.
 *
 * This overlay covers the builder shell so users hit an explanation instead of a
 * dead page.
 *
 * The condition is `md:pointer-fine:hidden` - it hides only when the viewport is
 * wide AND the pointer is a mouse. Guarding on width alone (`md:hidden`) was
 * wrong: a tablet at 1024px clears `md` but is still touch, so it would have
 * been handed the same dead builder. Drag-and-drop fails on the input axis, not
 * the width axis (see docs/responsive-plan.md section 5.1).
 *
 * Deliberately CSS-only rather than `useIsMobile` so it renders correctly on the
 * server and never flashes the broken builder during hydration. Written so that
 * the overlay is shown by default and only hidden by a more specific condition -
 * an ordering surprise leaves users with the explanation, not a dead page.
 *
 * Remove this once the builders accept pointer/touch input (plan section 4,
 * Option A).
 */
export function BuilderDesktopOnly({
  backHref = "/creator-dashboard",
}: {
  backHref?: string;
}) {
  return (
    <div
      role="alertdialog"
      aria-labelledby="builder-desktop-only-title"
      className="md:pointer-fine:hidden absolute inset-0 z-100 flex flex-col items-center justify-center gap-5 bg-[#02040a] px-6 text-center"
    >
      <span
        aria-hidden="true"
        className="material-symbols-outlined text-[44px] text-accent"
      >
        desktop_windows
      </span>

      <h1
        id="builder-desktop-only-title"
        className="font-display text-2xl font-black text-white"
      >
        Open this on a larger screen
      </h1>

      <p className="max-w-sm text-sm leading-relaxed text-white/60">
        The builder uses drag-and-drop to assemble your package, which needs a
        mouse. Switch to a tablet in landscape, a laptop or a desktop to keep
        going — anything 768px and wider.
      </p>

      <Link
        href={backHref}
        className="mt-1 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-white/90"
      >
        Back to dashboard
      </Link>
    </div>
  );
}

export default BuilderDesktopOnly;
