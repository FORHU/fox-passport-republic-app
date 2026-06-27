"use client";

import React, { useEffect, useState } from "react";
import { Clock, LogOut } from "lucide-react";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export default function SessionTimeoutModal({ isOpen, onStayLoggedIn, onLogout }: SessionTimeoutModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(120);

  useEffect(() => {
    if (!isOpen) { setSecondsLeft(120); return; }

    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const countdown = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
            <Clock className="text-yellow-400" size={20} />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Session Expiring Soon</h2>
            <p className="text-white/40 text-xs">You&apos;ve been inactive for a while</p>
          </div>
        </div>

        <p className="text-white/60 text-sm leading-relaxed">
          You&apos;ll be automatically logged out in{" "}
          <span className="text-yellow-400 font-bold tabular-nums">{countdown}</span>{" "}
          due to inactivity.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onStayLoggedIn}
            className="flex-1 py-2.5 rounded-xl bg-[#ccff00] text-black font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Stay Logged In
          </button>
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 text-white/50 font-semibold text-sm hover:bg-white/10 hover:text-white active:scale-95 transition-all"
          >
            <LogOut size={14} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
