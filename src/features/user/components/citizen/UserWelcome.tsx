"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { UserAvatar, UserRoleBadges } from "./UserIdentityCard";

interface UserWelcomeProps {
  userName: string;
  upcomingEventsCount: number;
  /** Rendered beside the actions, e.g. the tour replay button. */
  extra?: React.ReactNode;
}

/** The dashboard's head: who you are, what's coming, and what to do next. */
export const UserWelcome: React.FC<UserWelcomeProps> = ({
  userName,
  upcomingEventsCount,
  extra,
}) => {
  const user = useAuthStore((s) => s.user);
  const firstName = (user?.name || userName).trim().split(/\s+/)[0];

  const summary =
    upcomingEventsCount === 0
      ? "Nothing coming up yet."
      : `You have ${upcomingEventsCount} upcoming ${
          upcomingEventsCount === 1 ? "event" : "events"
        }.`;

  return (
    <section
      aria-labelledby="dashboard-title"
      className="glass-panel rounded-3xl p-5 sm:p-8 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10"
    >
      <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
        {user && <UserAvatar user={user} />}
        <div className="min-w-0">
          <h1
            id="dashboard-title"
            className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight tracking-tight truncate"
          >
            Hey, {firstName}
          </h1>
          <p className="mt-1 text-base text-text-muted">{summary}</p>
          {user && (
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <UserRoleBadges user={user} />
              {user.email && (
                <span className="text-xs text-white/40 truncate">
                  {user.email}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
        <Link
          href="/packages"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-black hover:bg-accent-hover transition-colors"
        >
          Find an event
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </Link>
        <Link
          href="/user/passport"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
        >
          My passport
        </Link>
        {extra && <div className="flex justify-center sm:pl-1">{extra}</div>}
      </div>
    </section>
  );
};
