"use client";

import { useEffect } from "react";
import { useChatWindowsStore } from "../store/useChatWindowsStore";
import { PANEL_WIDTH, PANEL_GAP, EDGE_OFFSET } from "../constants";
import ChatPanel from "./ChatPanel";
import type { Candidate } from "../types";

// Mounted once at the app root. Every trigger across the app (post authors,
// the Following widget, the Messages page, message requests) opens chats
// through useChatWindowsStore instead of rendering its own <ChatPanel> —
// this is the one place that turns that shared list into actual docked
// windows/bubbles, so several open chats stack side by side (and several
// minimized ones stack on top of each other) instead of every trigger point
// piling its own panel on the same fixed position.
interface ChatWindowsManagerProps {
  followingUsers?: Candidate[];
}

export default function ChatWindowsManager({
  followingUsers,
}: ChatWindowsManagerProps = {}) {
  const windows = useChatWindowsStore((s) => s.windows);
  const setMaxOpenWindows = useChatWindowsStore((s) => s.setMaxOpenWindows);

  // How many open panels actually fit side by side, from the real viewport
  // width — not a fixed number. Re-measured on resize so rotating a tablet
  // or resizing a browser window updates the cap live.
  useEffect(() => {
    const measure = () => {
      const available = window.innerWidth - EDGE_OFFSET;
      const perPanel = PANEL_WIDTH + PANEL_GAP;
      setMaxOpenWindows(Math.max(1, Math.floor(available / perPanel)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [setMaxOpenWindows]);

  const minimizedCount = windows.filter((w) => w.minimized).length;
  let panelIndex = 0;
  let bubbleIndex = 0;

  return (
    <>
      {windows.map((w) => {
        const props = w.minimized
          ? { panelIndex: -1, bubbleIndex: bubbleIndex++ }
          : { panelIndex: panelIndex++, bubbleIndex: -1 };
        return (
          <ChatPanel
            key={w.id}
            chatWindow={w}
            minimizedCount={minimizedCount}
            followingUsers={followingUsers}
            {...props}
          />
        );
      })}
    </>
  );
}
