"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

interface MobileBottomNavProps {
  onCreateClick?: () => void;
  onLoginClick?: () => void;
}

export default function MobileBottomNav({
  onCreateClick,
  onLoginClick,
}: MobileBottomNavProps) {
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

  const [imgError, setImgError] = useState(false);

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
    { icon: "home", href: "/", label: "Home" },
    { icon: "explore", href: "/search", label: "Explore" },
  ];

  const rightTabs = [
    { icon: "confirmation_number", href: "/booking", label: "Bookings" },
    {
      icon: "person",
      href: "/user",
      label: "Profile",
      onClick: handleProfileClick,
    },
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
            background: "#ccff00",
            boxShadow: "0 0 8px rgba(204,255,0,0.8)",
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
              ? "2px solid #ccff00"
              : "2px solid rgba(255,255,255,0.2)",
            boxShadow: active ? "0 0 8px rgba(204,255,0,0.5)" : "none",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        >
          {avatarUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              onError={() => setImgError(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#ccff00" }}>
              {userInitial}
            </span>
          )}
        </div>
      ) : (
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 22,
            color: active ? "#ccff00" : "rgba(255,255,255,0.4)",
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
          color: active ? "#ccff00" : "rgba(255,255,255,0.3)",
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
      className="lg:hidden fixed bottom-4 left-4 right-4 z-50 grid"
      style={{
        height: 68,
        background: "rgba(14,14,20,0.92)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "1px solid rgba(255,255,255,0.08)",
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

      {/* Center FAB */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleCreateClick}
          aria-label="Create"
          style={{
            width: 54,
            height: 54,
            borderRadius: 999,
            background: "linear-gradient(135deg, #d4ff33 0%, #aaee00 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "translateY(-16px)",
            boxShadow:
              "0 0 0 4px rgba(14,14,20,0.92), 0 0 0 6px rgba(204,255,0,0.2), 0 8px 24px rgba(204,255,0,0.5)",
            border: "none",
            cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-14px) scale(0.94)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-16px) scale(1)";
          }}
          onTouchStart={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-14px) scale(0.94)";
          }}
          onTouchEnd={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-16px) scale(1)";
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              color: "#000",
              fontSize: 26,
              fontVariationSettings: "'FILL' 1, 'wght' 700",
            }}
          >
            add
          </span>
        </button>
      </div>

      {/* Right tabs */}
      {rightTabs.map((tab) => {
        const active = isActive(tab.href);
        const content = (
          <NavIcon
            icon={tab.icon}
            label={tab.label}
            active={active}
            isProfile={tab.label === "Profile"}
          />
        );

        return tab.onClick ? (
          <button
            key={tab.href}
            onClick={tab.onClick}
            aria-label={tab.label}
            className="flex items-center justify-center h-full"
          >
            {content}
          </button>
        ) : (
          <Link
            key={tab.href}
            href={tab.href}
            aria-label={tab.label}
            className="flex items-center justify-center h-full"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
