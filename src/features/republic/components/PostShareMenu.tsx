"use client";

import { useEffect, useRef, useState } from "react";
import { Link2, Loader2, Repeat2, Send, Share2 } from "lucide-react";
import { FacebookIcon } from "@/shared/components/ui/FacebookIcon";
import { useShareToFacebook } from "../hooks/useShareToFacebook";
import { ActionCount } from "./ActionCount";

interface PostShareMenuProps {
  postId: string;
  /** Copies the post's link; PostCard owns it and the "Copied!" flag. */
  onCopyLink: () => void;
  copied: boolean;
  /** The viewer's own public video post: it can go to their Facebook Page. */
  canShareToFacebook: boolean;
  /** Shown beside the icon; hidden at 0. */
  sharesCount?: number;
  /** The viewer has shared this post: the trigger is shown active. Sharing
   * again still works; it just doesn't count again. */
  shared?: boolean;
  /** Called when a press puts the video on Facebook, so it's counted. */
  onFacebookShared?: () => void;
  /** Opens the "Send in message" picker; PostCard owns it (and the sign-in
   * prompt). Without it the menu has no Send item. */
  onSendInMessage?: () => void;
  /** Opens the repost composer; PostCard owns it (and the sign-in prompt).
   * Without it (e.g. on a repost, which can't be reposted) there's no
   * Repost item. */
  onRepost?: () => void;
}

const ITEM =
  "w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-60 disabled:pointer-events-none";

/**
 * "Share" in a post's action bar. Opens a menu: Send in message (when the page
 * wires the picker), Repost (when the post can be reposted), Copy link for
 * everyone, and on the viewer's own public video post, Share to Facebook Page. A Facebook share
 * keeps running after the menu closes, and the button shows it.
 */
export function PostShareMenu({
  postId,
  onCopyLink,
  copied,
  canShareToFacebook,
  sharesCount = 0,
  shared = false,
  onFacebookShared,
  onSendInMessage,
  onRepost,
}: PostShareMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const facebook = useShareToFacebook(postId, onFacebookShared);
  const sharing = facebook.state === "sharing";

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const facebookLabel =
    facebook.state === "sharing"
      ? "Sharing to Facebook…"
      : facebook.state === "shared"
        ? "Shared to Facebook"
        : facebook.state === "failed"
          ? "Retry sharing to Facebook"
          : "Share to Facebook Page";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-busy={sharing}
        className={`w-full h-full flex min-w-0 items-center justify-center gap-1 whitespace-nowrap px-2.5 py-1.5 rounded-lg transition-colors ${
          shared
            ? "text-lime-400 bg-lime-400/10 font-bold"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
        }`}
      >
        {sharing ? (
          <Loader2
            className="h-[18px] w-[18px] shrink-0 animate-spin"
            strokeWidth={2}
          />
        ) : (
          <Share2 className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
        )}
        <span className="hidden sm:inline">
          {copied ? "Copied!" : sharing ? "Sharing…" : "Share"}
        </span>
        <ActionCount n={sharesCount} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Share options"
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-60 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-20 py-1"
        >
          {onSendInMessage && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSendInMessage();
              }}
              className={ITEM}
            >
              <Send className="w-4 h-4" />
              Send in message
            </button>
          )}
          {onRepost && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onRepost();
              }}
              className={ITEM}
            >
              <Repeat2 className="w-4 h-4" />
              Repost
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onCopyLink();
            }}
            className={ITEM}
          >
            <Link2 className="w-4 h-4" />
            Copy link
          </button>
          {canShareToFacebook && (
            <button
              type="button"
              role="menuitem"
              disabled={sharing}
              onClick={() => {
                setOpen(false);
                void facebook.share();
              }}
              className={`${ITEM} ${
                facebook.state === "shared"
                  ? "text-[#1877F2]"
                  : facebook.state === "failed"
                    ? "text-red-400"
                    : ""
              }`}
            >
              {sharing ? (
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
              ) : (
                <FacebookIcon className="w-4 h-4" brand />
              )}
              {facebookLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
