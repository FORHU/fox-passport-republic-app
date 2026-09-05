"use client";

import React from "react";
import { BrandLogo } from "@/shared/components/layout/BrandLogo";
import NotificationBell from "@/shared/components/layout/NotificationBell";
import UserMenuButton from "@/shared/components/layout/UserMenuButton";

interface MobileTopBarProps {
  user: any;
}

export function MobileTopBar({ user }: MobileTopBarProps) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        background: "rgba(5,6,8,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <BrandLogo logoSize={32} textSize="text-lg" />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {user && (
          <>
            <NotificationBell />
            <UserMenuButton />
          </>
        )}
      </div>
    </div>
  );
}
