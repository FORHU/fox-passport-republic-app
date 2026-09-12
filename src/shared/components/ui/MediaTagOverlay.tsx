"use client";

import Link from "next/link";
import { useState } from "react";
import { Users } from "lucide-react";
import type { MediaTag } from "@/shared/types/feed";

interface MediaTagOverlayProps {
  tags: MediaTag[];
  /** Pins start visible instead of hidden behind the badge — used in the
   * full-screen lightbox where there's room and the photo is the focus. */
  defaultRevealed?: boolean;
}

// Renders over a `position: relative` media container: a small "N tagged"
// badge that toggles name pins positioned at each tag's stored (x, y)
// percentage. Distinct from @mention highlighting in post text (PostCard's
// renderContentWithMentions) — these pins point at people, not read them.
// Lives under shared/ (not features/republic) because it's also used by
// ImageLightbox, which is a features/messages component.
export function MediaTagOverlay({
  tags,
  defaultRevealed = false,
}: MediaTagOverlayProps) {
  const [revealed, setRevealed] = useState(defaultRevealed);
  if (tags.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setRevealed((r) => !r);
        }}
        title={
          revealed
            ? "Hide tagged people"
            : `${tags.length} ${tags.length === 1 ? "person" : "people"} tagged`
        }
        className="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm hover:bg-black/90 transition-colors"
      >
        <Users className="h-3 w-3" strokeWidth={2} />
        {tags.length}
      </button>
      {revealed &&
        tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/user/${tag.user.id}`}
            onClick={(e) => e.stopPropagation()}
            style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
            className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/75 py-1 pl-2 pr-2.5 text-[11px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-black/90"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-lime-400" />
            {tag.user.name}
          </Link>
        ))}
    </>
  );
}
