"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useState } from "react";

interface MobileBottomNavProps {
  onCreateClick?: () => void;
  onLoginClick?: () => void;
}

export default function MobileBottomNav({ onCreateClick, onLoginClick }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleProfileClick = () => {
    if (isAuthenticated) {
      router.push("/user");
    } else {
      onLoginClick?.();
    }
  };

  const handleCreateClick = () => {
    if (isAuthenticated) {
      onCreateClick?.();
    } else {
      onLoginClick?.();
    }
  };

  const tabs = [
    { icon: "home", href: "/", label: "Home" },
    { icon: "explore", href: "/search", label: "Explore" },
  ];

  const rightTabs = [
    { icon: "confirmation_number", href: "/booking", label: "Bookings" },
    { icon: "person", href: "/user", label: "Profile", onClick: handleProfileClick },
  ];

  return (
    <div
      className="sm:hidden fixed bottom-5 left-5 right-5 z-50"
      style={{
        height: 64,
        background: "rgba(20,20,26,0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 999,
        boxShadow: "0 10px 40px rgba(0,0,0,0.55)",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        alignItems: "center",
      }}
    >
      {/* Left tabs — 2 cells */}
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-label={tab.label}
          className="flex items-center justify-center"
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 22,
              color: isActive(tab.href) ? "#ccff00" : "rgba(255,255,255,0.4)",
              fontVariationSettings: isActive(tab.href) ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            {tab.icon}
          </span>
        </Link>
      ))}

      {/* Center FAB — cell 3 */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleCreateClick}
          aria-label="Create"
          style={{
            width: 52,
            height: 52,
            borderRadius: 999,
            background: "#ccff00",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "translateY(-14px)",
            boxShadow: "0 6px 20px rgba(204,255,0,0.45)",
            border: "4px solid #14141a",
          }}
        >
          <span className="material-symbols-outlined" style={{ color: "#000", fontSize: 24 }}>
            add
          </span>
        </button>
      </div>

      {/* Right tabs — 2 cells */}
      {rightTabs.map((tab) =>
        tab.onClick ? (
          <button
            key={tab.href}
            onClick={tab.onClick}
            aria-label={tab.label}
            className="flex items-center justify-center"
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 22,
                color: isActive(tab.href) ? "#ccff00" : "rgba(255,255,255,0.4)",
                fontVariationSettings: isActive(tab.href) ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {tab.icon}
            </span>
          </button>
        ) : (
          <Link
            key={tab.href}
            href={tab.href}
            aria-label={tab.label}
            className="flex items-center justify-center"
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 22,
                color: isActive(tab.href) ? "#ccff00" : "rgba(255,255,255,0.4)",
                fontVariationSettings: isActive(tab.href) ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {tab.icon}
            </span>
          </Link>
        )
      )}
    </div>
  );
}
