/* eslint-disable @next/next/no-img-element */
"use client";

import { useAuthStore } from "@/shared/auth/useAuthStore";

interface ComposePostTriggerProps {
  /** Opens the shared ComposePostModal — owned by the page, not this
   * component, since several trigger points (desktop sidebar, mobile bar,
   * mobile inline prompt) all need to open the same one modal. */
  onOpen: () => void;
}

// Facebook-style compose entry point: a slim, always-in-place bar that opens
// the full compose form in a modal on click, instead of the form itself
// living inline in the sidebar (where it pushed everything below it around
// as it expanded, and was easy to miss below the fold).
export function ComposePostTrigger({ onOpen }: ComposePostTriggerProps) {
  const { user, openLogin } = useAuthStore();

  const userInitial =
    user?.name?.charAt(0).toUpperCase() ||
    user?.username?.charAt(0).toUpperCase() ||
    "C";

  const openCompose = () => (user ? onOpen() : openLogin());

  return (
    <div className="w-full rounded-2xl backdrop-blur-xl bg-zinc-950/90 border border-zinc-800/90 p-3 shadow-[0_10px_35px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-2.5">
        {user?.imgId ? (
          <img
            src={user.imgId}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border border-zinc-700 shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-lime-400 to-lime-600 text-black flex items-center justify-center font-black text-sm shrink-0">
            {userInitial}
          </div>
        )}
        <button
          type="button"
          onClick={openCompose}
          className="flex-1 min-w-0 text-left px-4 py-2.5 rounded-full bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/60 text-sm text-zinc-400 transition-colors cursor-pointer truncate"
        >
          What&apos;s happening in the Republic?
        </button>
      </div>

      <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-zinc-800/60">
        <button
          type="button"
          onClick={openCompose}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-lime-400">
            photo_library
          </span>
          Photo
        </button>
        <button
          type="button"
          onClick={openCompose}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-amber-400">
            handshake
          </span>
          Offer
        </button>
        <span className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold text-amber-400/80">
          <span className="material-symbols-outlined text-[12px]">bolt</span>
          +15 XP
        </span>
      </div>
    </div>
  );
}
