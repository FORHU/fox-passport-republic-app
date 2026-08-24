"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
  user?: any;
}

const ROWS = [
  { icon: "person", label: "Edit Profile", href: "/user/edit" },
  { icon: "verified", label: "Roles & Verification", href: "/user/roles" },
  { icon: "favorite", label: "Wishlists", href: "/wishlists" },
  { icon: "credit_card", label: "Payment Methods", href: "/user/payments" },
  {
    icon: "notifications",
    label: "Notification Preferences",
    href: "/user/notifications",
  },
  { icon: "logout", label: "Log Out", href: null },
] as const;

export default function MobileSettingsView({ user }: Props) {
  const router = useRouter();

  const name: string = user?.name ?? "Juan Dela Cruz";
  const email: string = user?.email ?? "juan@email.com";
  const initial: string = name.charAt(0).toUpperCase();
  const isLogout = (icon: string) => icon === "logout";

  return (
    <div
      style={{
        background: "#050608",
        minHeight: "100svh",
        position: "relative",
        color: "#fff",
      }}
    >
      {/* Nav bar — no back button, top-level page */}
      <div
        style={{
          position: "fixed",
          top: 62,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 5,
          background: "rgba(5,6,8,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
        }}
      >
        <Image
          src="/foxonlylogo.png"
          alt="FoxPassport"
          width={22}
          height={22}
          style={{ objectFit: "contain" }}
        />
        <p
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
            margin: 0,
          }}
        >
          Profile &amp; Settings
        </p>
      </div>

      {/* Scrollable content */}
      <div style={{ padding: "142px 20px 112px" }}>
        {/* Avatar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
              overflow: "hidden",
            }}
          >
            {user?.imgId ? (
              <img
                src={user.imgId}
                alt={name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              /> // eslint-disable-line @next/next/no-img-element
            ) : (
              <span
                className="font-display"
                style={{ fontSize: 30, fontWeight: 700, color: "#fff" }}
              >
                {initial}
              </span>
            )}
          </div>
          <h2
            className="font-display"
            style={{
              fontSize: 19,
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 4px",
            }}
          >
            {name}
          </h2>
          <p
            style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}
          >
            {email}
          </p>
        </div>

        {/* Settings rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ROWS.map((row) => (
            <button
              key={row.label}
              onClick={() => (row.href ? router.push(row.href) : undefined)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                textAlign: "left",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: "14px 16px",
                cursor: "pointer",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 20,
                  color: isLogout(row.icon)
                    ? "rgba(239,68,68,0.8)"
                    : "rgba(255,255,255,0.55)",
                  flexShrink: 0,
                }}
              >
                {row.icon}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: 500,
                  color: isLogout(row.icon) ? "#ef4444" : "#fff",
                }}
              >
                {row.label}
              </span>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: "rgba(255,255,255,0.2)" }}
              >
                chevron_right
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
