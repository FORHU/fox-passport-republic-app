"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { icon: "dashboard", label: "Overview", href: "/creator-dashboard" },
  { icon: "grid_view", label: "Listings", href: "/creator-dashboard/venues" },
  {
    icon: "calendar_month",
    label: "Calendar",
    href: "/creator-dashboard/calendar",
  },
  {
    icon: "account_balance_wallet",
    label: "Earnings",
    href: "/creator-dashboard/earnings",
  },
  { icon: "person", label: "Profile", href: "/user/settings" },
];

export default function MobileCreatorBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/creator-dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <div
      className="lg:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 78,
        zIndex: 50,
        background: "rgba(8,8,11,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: 14,
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-label={tab.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 21,
                color: active ? "#ccff00" : "rgba(255,255,255,0.35)",
                fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {tab.icon}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.04em",
                lineHeight: 1,
                color: active ? "#ccff00" : "rgba(255,255,255,0.35)",
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
