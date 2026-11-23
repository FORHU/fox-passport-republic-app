"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactionType } from "@/shared/types/feed";
import { ActionCount } from "./ActionCount";

const LONG_PRESS_MS = 400;

const REACTIONS: Array<{
  type: ReactionType;
  emoji: string;
  label: string;
  color: string;
  activeClass: string;
}> = [
  {
    type: "like",
    emoji: "👍",
    label: "Like",
    color: "text-accent",
    activeClass:
      "bg-accent/15 text-accent border-accent/45 ring-1 ring-accent/25 shadow-[0_0_12px_rgba(173,209,63,0.12)]",
  },
  {
    type: "love",
    emoji: "❤️",
    label: "Love",
    color: "text-rose-400",
    activeClass:
      "bg-rose-500/15 text-rose-300 border-rose-400/45 ring-1 ring-rose-400/25",
  },
  {
    type: "haha",
    emoji: "😂",
    label: "Haha",
    color: "text-amber-400",
    activeClass:
      "bg-amber-500/15 text-amber-300 border-amber-400/45 ring-1 ring-amber-400/25",
  },
  {
    type: "wow",
    emoji: "😮",
    label: "Wow",
    color: "text-amber-400",
    activeClass:
      "bg-amber-500/15 text-amber-300 border-amber-400/45 ring-1 ring-amber-400/25",
  },
  {
    type: "sad",
    emoji: "😢",
    label: "Sad",
    color: "text-sky-400",
    activeClass:
      "bg-sky-500/15 text-sky-300 border-sky-400/45 ring-1 ring-sky-400/25",
  },
  {
    type: "angry",
    emoji: "😠",
    label: "Angry",
    color: "text-orange-400",
    activeClass:
      "bg-orange-500/15 text-orange-300 border-orange-400/45 ring-1 ring-orange-400/25",
  },
];

interface ReactionButtonProps {
  myReaction: ReactionType | null;
  likesCount: number;
  onReact: (type: ReactionType | null) => void;
}

// Facebook's Like button: a plain click toggles the default "like" reaction
// on/off; hovering (desktop) or pressing-and-holding (touch) reveals the
// full 6-reaction picker.
export function ReactionButton({
  myReaction,
  likesCount,
  onReact,
}: ReactionButtonProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const openPicker = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPickerOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setPickerOpen(false), 200);
  };

  const clearLongPressTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = () => {
    longPressTriggered.current = false;
    clearLongPressTimer();
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }
      openPicker();
    }, LONG_PRESS_MS);
  };

  const handleButtonClick = () => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    onReact(myReaction ? null : "like");
  };

  // Long-press opens the picker on touch devices where hover never fires;
  // a tap outside the container closes it the same way mouseleave does on desktop.
  useEffect(() => {
    if (!pickerOpen) return;
    const handleOutside = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [pickerOpen]);

  const current = REACTIONS.find((r) => r.type === myReaction);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={openPicker}
      onMouseLeave={scheduleClose}
    >
      {pickerOpen && (
        <div
          className="absolute bottom-full left-0 mb-1 flex items-center gap-0.5 rounded-full bg-zinc-900 border border-zinc-800 px-1.5 py-1 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
          onMouseEnter={openPicker}
          onMouseLeave={scheduleClose}
        >
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              type="button"
              title={r.label}
              onClick={() => {
                onReact(myReaction === r.type ? null : r.type);
                setPickerOpen(false);
              }}
              className="text-lg leading-none p-1 rounded-full hover:scale-125 hover:bg-zinc-800 transition-transform cursor-pointer"
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        aria-pressed={!!current}
        data-reacted={current ? "true" : "false"}
        onClick={handleButtonClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={clearLongPressTimer}
        onTouchMove={clearLongPressTimer}
        onTouchCancel={clearLongPressTimer}
        onContextMenu={(e) => e.preventDefault()}
        className={`group flex w-full min-w-0 items-center justify-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 rounded-lg border transition-all select-none touch-manipulation ${
          current
            ? `${current.activeClass} font-bold`
            : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/60"
        }`}
      >
        <span
          className={`text-[15px] leading-none transition-transform ${
            current
              ? "scale-110"
              : "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-90"
          }`}
        >
          {current?.emoji ?? "👍"}
        </span>
        <ActionCount n={likesCount} />
      </button>
    </div>
  );
}
