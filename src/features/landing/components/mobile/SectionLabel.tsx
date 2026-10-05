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
        color: "color-mix(in srgb, var(--color-white) 35%, transparent)",
        marginBottom: 14,
        margin: "0 0 14px",
      }}
    >
      {children}
    </p>
  );
}
