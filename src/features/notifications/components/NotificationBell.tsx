"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronDown } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { Notification } from "../types";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (n: Notification) => {
    if (!n.isRead) markAsRead(n.id);

    const link = n.metadata?.link as string | undefined;
    if (link) {
      setIsOpen(false);
      router.push(link);
      return;
    }

    setExpandedId((prev) => (prev === n.id ? null : n.id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ccff00] px-1 text-[10px] font-bold text-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-white/10 bg-[#0f111a] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAllAsRead()} className="text-xs font-medium text-[#ccff00] hover:underline">
                Mark all as read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-white/30">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-white/30">No notifications yet</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {notifications.map((n) => {
                const isExpanded = expandedId === n.id;
                const isRejected = n.type === "role_request_rejected";
                const isAccepted = n.type === "role_request_approved";

                return (
                  <li
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`px-4 py-3 cursor-pointer hover:bg-white/5 transition-all duration-200 ${!n.isRead ? "bg-white/[0.03]" : ""
                      } ${isExpanded ? "bg-white/[0.06] border-l-2 border-[#ccff00]" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#ccff00] shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-white truncate">{n.title}</p>
                          <ChevronDown
                            size={14}
                            className={`text-white/40 shrink-0 mt-0.5 transition-transform duration-200 ${isExpanded ? "rotate-180 text-[#ccff00]" : ""
                              }`}
                          />
                        </div>

                        <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{n.message}</p>

                        {isExpanded && (
                          <p
                            className={`text-xs mt-2 p-3 rounded-lg border whitespace-pre-line leading-relaxed ${isRejected
                              ? "bg-red-500/10 border-red-500/20 text-red-300"
                              : isAccepted
                                ? "bg-green-500/10 border-green-500/20 text-green-300"
                                : "text-white/60"
                              }`}
                          >
                            {n.message}
                          </p>
                        )}

                        <p className="text-[10px] text-white/30 mt-1.5">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {notifications.length > 0 && (
            <div className="border-t border-white/5 px-4 py-3">
              <Link
                href="/notifications"
                className="flex items-center justify-center gap-1 text-xs font-medium text-[#ccff00] hover:underline"
              >
                View all notifications
                <ChevronDown size={12} className="rotate-[-90deg]" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}