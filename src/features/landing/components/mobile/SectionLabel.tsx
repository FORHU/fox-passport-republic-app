"use client";

import React from "react";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.35)",
        marginBottom: 14,
        margin: "0 0 14px",
      }}
    >
      {children}
    </p>
  );
}
