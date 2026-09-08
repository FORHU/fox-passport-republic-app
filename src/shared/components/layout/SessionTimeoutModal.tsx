"use client";

import React, { useEffect, useState } from "react";
import { Clock, LogOut, Loader2 } from "lucide-react";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onStayLoggedIn: () => void;
  onLogout: () => void;
  /**
   * Set while `onLogout` is in flight. Signing out awaits a round trip to
   * /auth/logout before the page navigates, so without this the dialog sits
   * there looking untouched and invites a second click.
   */
  isLoggingOut?: boolean;
}

export default function SessionTimeoutModal({
  isOpen,
  onStayLoggedIn,
  onLogout,
  isLoggingOut = false,
}: SessionTimeoutModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(120);
  const startTimeRef = React.useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setSecondsLeft(Math.max(0, 120 - elapsed));
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
            <h2 className="text-white font-bold text-lg leading-tight">
              Session Expiring Soon
            </h2>
            <p className="text-white/40 text-xs">
              You&apos;ve been inactive for a while
            </p>
          </div>
        </div>

        <p className="text-white/60 text-sm leading-relaxed">
          You&apos;ll be automatically logged out in{" "}
          <span className="text-yellow-400 font-bold tabular-nums">
            {countdown}
          </span>{" "}
          due to inactivity.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onStayLoggedIn}
            disabled={isLoggingOut}
            className="flex-1 py-2.5 rounded-xl bg-[#ccff00] text-black font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            Stay Logged In
          </button>
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 text-white/50 font-semibold text-sm hover:bg-white/10 hover:text-white active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            {isLoggingOut ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LogOut size={14} />
            )}
            {isLoggingOut ? "Signing out…" : "Log Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
