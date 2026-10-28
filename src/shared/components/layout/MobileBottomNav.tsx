"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/shared/auth/useAuthStore";

/** The app's mobile nav — signed-in only, like the desktop app tabs. */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuthStore();
  const isAuthenticated = !!user;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const [imgError, setImgError] = useState(false);

  // Signed-out visitors are on the landing side, which has no app nav.
  // Nothing while the store hydrates, so the bar never flashes for them.
  if (isLoading || !user) return null;

  const rawImg = user?.imgId;
  const avatarUrl = rawImg
    ? rawImg.startsWith("http://") || rawImg.startsWith("https://")
      ? rawImg
      : `https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${rawImg}`
    : null;
  const userInitial =
    user?.name?.charAt(0).toUpperCase() ??
    user?.email?.charAt(0).toUpperCase() ??
    "?";

  const tabs = [
    { icon: "group", href: "/search", label: "Foxers" },
    { icon: "map", href: "/venues/map", label: "Map" },
  ];

  const rightTabs = [
    { icon: "confirmation_number", href: "/booking", label: "Bookings" },
    { icon: "person", href: "/user", label: "Profile" },
  ];

  const NavIcon = ({
    icon,
    label,
    active,
    isProfile = false,
  }: {
    icon: string;
    label: string;
    active: boolean;
    isProfile?: boolean;
  }) => (
    <div className="flex flex-col items-center justify-center gap-1 relative">
      {/* Active pill */}
      {active && (
        <span
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 20,
            height: 3,
            borderRadius: 999,
            background: "#C4E85A",
            boxShadow: "none",
          }}
        />
      )}

      {isProfile && isAuthenticated ? (
        /* Avatar */
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            overflow: "hidden",
            border: active
              ? "2px solid #C4E85A"
              : "2px solid rgba(255,255,255,0.2)",
            boxShadow: active ? "none" : "none",
            background: "color-mix(in srgb, var(--color-white) 8%, transparent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        >
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt=""
              onError={() => setImgError(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-text)" }}>
              {userInitial}
            </span>
          )}
        </div>
      ) : (
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 22,
            color: active ? "#C4E85A" : "rgba(255,255,255,0.4)",
            fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
            transition: "color 0.2s",
          }}
        >
          {icon}
        </span>
      )}

      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: active ? "#C4E85A" : "rgba(255,255,255,0.3)",
          transition: "color 0.2s",
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div
      className="lg:hidden fixed left-4 right-4 z-50 grid"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom, 1rem))",
        height: 68,
        background: "rgba(14,14,20,0.92)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "1px solid color-mix(in srgb, var(--color-white) 8%, transparent)",
        borderRadius: 999,
        boxShadow:
          "0 -2px 0 rgba(255,255,255,0.04) inset, 0 16px 48px rgba(0,0,0,0.7)",
        gridTemplateColumns: "repeat(5, 1fr)",
        alignItems: "center",
      }}
    >
      {/* Left tabs */}
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-label={tab.label}
            className="flex items-center justify-center h-full"
          >
            <NavIcon icon={tab.icon} label={tab.label} active={active} />
          </Link>
        );
      })}

      {/* Center Republic Foxer Tab */}
      <div className="flex items-center justify-center">
        <Link
          href="/republic"
          aria-label="Republic Foxer"
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: isActive("/republic")
              ? "linear-gradient(135deg, #CBEB6E 0%, #ADD13F 100%)"
              : "linear-gradient(135deg, #1C1F26 0%, #14161B 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: "translateY(-14px)",
            boxShadow: isActive("/republic")
              ? "0 0 0 4px rgba(14,14,20,0.92), 0 0 0 6px rgba(196,232,90,0.3)"
              : "0 0 0 4px rgba(14,14,20,0.92), 0 4px 16px rgba(0,0,0,0.5)",
            border: isActive("/republic")
              ? "none"
              : "1px solid rgba(255,255,255,0.12)",
            textDecoration: "none",
            transition: "transform 0.15s, box-shadow 0.15s, background 0.15s",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              color: isActive("/republic") ? "#111317" : "#C4E85A",
              fontSize: 24,
              fontVariationSettings: "'FILL' 1, 'wght' 700",
            }}
          >
            dynamic_feed
          </span>
          <span
            style={{
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: "0.02em",
              color: isActive("/republic") ? "#111317" : "#C4E85A",
              lineHeight: 1,
              marginTop: 1,
            }}
          >
            REPUBLIC
          </span>
        </Link>
      </div>

      {/* Right tabs */}
      {rightTabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-label={tab.label}
          className="flex items-center justify-center h-full"
        >
          <NavIcon
            icon={tab.icon}
            label={tab.label}
            active={isActive(tab.href)}
            isProfile={tab.label === "Profile"}
          />
        </Link>
      ))}
    </div>
  );
}
