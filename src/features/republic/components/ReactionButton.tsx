"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactionType } from "@/shared/types/feed";
import { ActionCount } from "./ActionCount";

const LONG_PRESS_MS = 400;

const REACTIONS: Array<{
  type: ReactionType;
  emoji: string;
  label: string;
}> = [
  {
    type: "like",
    emoji: "👍",
    label: "Like",
  },
  {
    type: "love",
    emoji: "❤️",
    label: "Love",
  },
  {
    type: "haha",
    emoji: "😂",
    label: "Haha",
  },
  {
    type: "wow",
    emoji: "😮",
    label: "Wow",
  },
  {
    type: "sad",
    emoji: "😢",
    label: "Sad",
  },
  {
    type: "angry",
    emoji: "😠",
    label: "Angry",
  },
];

interface ReactionButtonProps {
  myReaction: ReactionType | null;
  likesCount: number;
  onReact: (type: ReactionType | null) => void;
  /** "sm" is the inline comment/reply size (api#427). */
  size?: "md" | "sm";
}

// Facebook's Like button: a plain click toggles the default "like" reaction
// on/off; hovering (desktop) or pressing-and-holding (touch) reveals the
// full 6-reaction picker.
export function ReactionButton({
  myReaction,
  likesCount,
  onReact,
  size = "md",
}: ReactionButtonProps) {
  const small = size === "sm";
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
        // Reacting changes only the emoji (greyed 👍 → the chosen one in
        // colour); the button itself keeps one look, with no tinted fill.
        className={`group flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent text-zinc-400 hover:text-white transition-colors select-none touch-manipulation cursor-pointer ${
          small
            ? "px-1 py-0.5 text-[10px] font-bold"
            : "w-full min-w-0 justify-center px-2.5 py-1.5 hover:bg-zinc-800/60"
        }`}
      >
        <span
          aria-hidden
          className={`${small ? "text-[13px]" : "text-[15px]"} leading-none transition-transform ${
            current
              ? "scale-110"
              : "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-90"
          }`}
        >
          {current?.emoji ?? "👍"}
        </span>
        {small && likesCount <= 0 ? (
          <span>{current?.label ?? "Like"}</span>
        ) : (
          <>
            <span className="sr-only">{current?.label ?? "Like"}</span>
            <ActionCount n={likesCount} />
          </>
        )}
      </button>
    </div>
  );
}
