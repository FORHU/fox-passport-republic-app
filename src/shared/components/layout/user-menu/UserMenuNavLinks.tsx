"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Heart,
  Briefcase,
  MessageSquare,
  User,
  Settings,
  HelpCircle,
  UserPlus,
  LogOut,
  RefreshCw,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useLogout } from "@/shared/auth/useLogout";
import { CurrencySwitcher } from "@/shared/components/layout/CurrencySwitcher";
import { useUnreadMessagesCount } from "@/features/messages/hooks/useUnreadMessagesCount";

interface UserMenuNavLinksProps {
  userId?: string | null;
  isAdmin: boolean;
  syncing: boolean;
  onSync: () => void;
  onClose: () => void;
}

export function UserMenuNavLinks({
  userId,
  isAdmin,
  syncing,
  onSync,
  onClose,
}: UserMenuNavLinksProps) {
  const router = useRouter();
  const logout = useLogout();
  const { unreadCount: unreadMessages } = useUnreadMessagesCount();

  const navItems = [
    ...(userId
      ? [
          {
            label: "My Public Passport",
            icon: User,
            href: `/user/${userId}`,
          },
        ]
      : []),
    { label: "Wishlists", icon: Heart, href: "/wishlists" },
    {
      label: "Trips",
      icon: Briefcase,
      href: "/trips",
      comingSoon: true,
    },
    { label: "My Bookings", icon: Briefcase, href: "/booking" },
    // Every role's calendar — bookings, hosted events, venue dates, jobs.
    { label: "Calendar", icon: CalendarDays, href: "/calendar" },
    {
      label: "QR Check-In Scanner",
      icon: QrCode,
      href: "/scanner",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      href: "/messages",
      badge: unreadMessages > 0 ? (unreadMessages > 9 ? "9+" : unreadMessages) : undefined,
    },
    {
      label: "Account settings",
      icon: Settings,
      href: "/user/settings",
    },
    // Email check for booking, and the status of role-application documents.
    { label: "Verification", icon: ShieldCheck, href: "/kyc" },
    {
      label: "Help Center",
      icon: HelpCircle,
      href: "/help",
      comingSoon: true,
    },
  ];

  return (
    <>
      <div className="px-2 py-2 border-b border-white/5 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              onClose();
              if ((item as { comingSoon?: boolean }).comingSoon) {
                toast.info(`${item.label} coming soon!`);
                return;
              }
              router.push(item.href);
            }}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
          >
            <item.icon className="w-4 h-4 text-white/40 group-hover:text-[#ccff00] transition-colors shrink-0" />
            <span className="text-sm text-white/70 group-hover:text-white transition-colors">
              {item.label}
            </span>
            {(item as { comingSoon?: boolean }).comingSoon && (
              <span className="ml-auto text-[9px] font-bold text-white/20 uppercase tracking-wider">
                Soon
              </span>
            )}
            {(item as { badge?: string | number }).badge !== undefined && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ccff00] px-1.5 text-[10px] font-bold text-black">
                {(item as { badge?: string | number }).badge}
              </span>
            )}
          </button>
        ))}
        <CurrencySwitcher />
        {!isAdmin && (
          <button
            onClick={() => {
              onClose();
              router.push("/onboarding");
            }}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[#ccff00]/5 transition-colors group cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#ccff00]/60 group-hover:text-[#ccff00] transition-colors shrink-0" />
            <span className="text-sm text-[#ccff00]/60 group-hover:text-[#ccff00] transition-colors font-medium">
              Apply for a Role
            </span>
          </button>
        )}
      </div>

      {/* Sync + Logout */}
      <div className="px-2 py-2 space-y-0.5">
        <button
          onClick={onSync}
          disabled={syncing}
          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors group disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            className={`w-4 h-4 text-white/40 group-hover:text-blue-400 transition-colors shrink-0 ${
              syncing ? "animate-spin" : ""
            }`}
          />
          <span className="text-sm text-white/50 group-hover:text-blue-400 transition-colors">
            {syncing ? "Syncing account…" : "Sync Account"}
          </span>
        </button>
        <button
          onClick={() => {
            onClose();
            logout();
          }}
          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors group cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-white/40 group-hover:text-red-400 transition-colors shrink-0" />
          <span className="text-sm text-white/50 group-hover:text-red-400 transition-colors">
            Log out
          </span>
        </button>
      </div>
    </>
  );
}
