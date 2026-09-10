"use client";

import { useRef, useState } from "react";
import type { ReactionType } from "@/shared/types/feed";

const REACTIONS: Array<{
  type: ReactionType;
  emoji: string;
  label: string;
  color: string;
}> = [
  { type: "like", emoji: "👍", label: "Like", color: "text-blue-400" },
  { type: "love", emoji: "❤️", label: "Love", color: "text-rose-400" },
  { type: "haha", emoji: "😂", label: "Haha", color: "text-amber-400" },
  { type: "wow", emoji: "😮", label: "Wow", color: "text-amber-400" },
  { type: "sad", emoji: "😢", label: "Sad", color: "text-amber-400" },
  { type: "angry", emoji: "😠", label: "Angry", color: "text-orange-500" },
];

interface ReactionButtonProps {
  myReaction: ReactionType | null;
  likesCount: number;
  onReact: (type: ReactionType | null) => void;
}

// Facebook's Like button: a plain click toggles the default "like" reaction
// on/off; hovering (desktop) or pressing-and-holding (not implemented here,
// out of scope for a mouse-first feed) reveals the full 6-reaction picker.
export function ReactionButton({
  myReaction,
  likesCount,
  onReact,
}: ReactionButtonProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openPicker = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPickerOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setPickerOpen(false), 200);
  };

  const current = REACTIONS.find((r) => r.type === myReaction);

  return (
    <div
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
        onClick={() => onReact(myReaction ? null : "like")}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
          current
            ? `${current.color} bg-white/5 font-bold`
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
        }`}
      >
        <span className="text-[15px] leading-none">
          {current?.emoji ?? "👍"}
        </span>
        <span>{likesCount}</span>
      </button>
    </div>
  );
}
