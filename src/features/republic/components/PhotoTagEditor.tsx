"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { searchMentionCandidates } from "@/shared/api/feed";
import type { MentionCandidate } from "@/features/republic/types";

export interface PendingMediaTag {
  userId: string;
  x: number;
  y: number;
  name: string;
  username?: string | null;
  imgId?: string | null;
}

interface PhotoTagEditorProps {
  mediaUrl: string;
  tags: PendingMediaTag[];
  onChange: (tags: PendingMediaTag[]) => void;
  onClose: () => void;
}

// Facebook-style "click a spot on the photo, pick who's there" tagging —
// distinct from @mention-in-text (ComposePostBox's textarea autocomplete),
// this pins a citizen to an (x, y) percentage on a specific photo.
export function PhotoTagEditor({
  mediaUrl,
  tags,
  onChange,
  onClose,
}: PhotoTagEditorProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [pendingSpot, setPendingSpot] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<MentionCandidate[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!pendingSpot) return;
    if (!query.trim()) {
      setCandidates([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      searchMentionCandidates(query)
        .then((results) => {
          if (!cancelled) setCandidates(results);
        })
        .catch(() => {
          if (!cancelled) setCandidates([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, pendingSpot]);

  const handlePickSpot = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingSpot({ x: Math.min(99, Math.max(1, x)), y: Math.min(99, Math.max(1, y)) });
    setQuery("");
    setCandidates([]);
  };

  const confirmTag = (candidate: MentionCandidate) => {
    if (!pendingSpot) return;
    // A person can only be pinned once per photo — picking them again just
    // moves the existing pin instead of stacking a duplicate.
    const withoutExisting = tags.filter((t) => t.userId !== candidate.id);
    onChange([
      ...withoutExisting,
      {
        userId: candidate.id,
        x: pendingSpot.x,
        y: pendingSpot.y,
        name: candidate.name,
        username: candidate.username,
        imgId: candidate.imgId,
      },
    ]);
    setPendingSpot(null);
    setQuery("");
    setCandidates([]);
  };

  const removeTag = (userId: string) => {
    onChange(tags.filter((t) => t.userId !== userId));
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-white">Tag People</h3>
            <p className="text-[11px] text-zinc-500">
              Click anywhere on the photo to tag someone.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          onClick={handlePickSpot}
          className="relative w-full max-h-[60vh] overflow-hidden bg-zinc-900 cursor-crosshair select-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={mediaUrl}
            alt=""
            draggable={false}
            className="w-full max-h-[60vh] object-contain pointer-events-none"
          />

          {tags.map((tag) => (
            <div
              key={tag.userId}
              style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
              onClick={(e) => e.stopPropagation()}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 group"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-lime-400 ring-2 ring-black/60 shrink-0" />
              <span className="flex items-center gap-1 rounded-full bg-black/80 pl-2 pr-1 py-0.5 text-[11px] font-bold text-white whitespace-nowrap">
                {tag.name}
                <button
                  type="button"
                  onClick={() => removeTag(tag.userId)}
                  className="h-3.5 w-3.5 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            </div>
          ))}

          {pendingSpot && (
            <span
              style={{ left: `${pendingSpot.x}%`, top: `${pendingSpot.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-lime-400 animate-pulse"
            />
          )}
        </div>

        {pendingSpot && (
          <div
            className="border-t border-zinc-800 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a citizen to tag..."
              className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400/60 transition-all"
            />
            {searching && (
              <p className="text-[11px] text-zinc-500 mt-1.5 px-1">
                Searching…
              </p>
            )}
            {!searching && candidates.length > 0 && (
              <div className="mt-1.5 max-h-40 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900">
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => confirmTag(c)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800 transition-colors"
                  >
                    <div className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0 overflow-hidden">
                      {c.imgId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.imgId}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        c.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {c.name}
                      </p>
                      {c.username && (
                        <p className="text-[10px] text-zinc-500 truncate">
                          @{c.username}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
          <span className="text-[11px] text-zinc-500">
            {tags.length === 0
              ? "No one tagged yet"
              : `${tags.length} ${tags.length === 1 ? "person" : "people"} tagged`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
