"use client";

import React from "react";

export function MobileHeroHeader() {
  return (
    <>
      {/* Background gradients */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 380,
          background:
            "linear-gradient(180deg,rgba(124,58,237,0.3) 0%,rgba(219,39,119,0.08) 60%,rgba(5,6,8,0) 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -60,
          left: "30%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(204,255,0,0.07)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Hero Badge & Title */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(204,255,0,0.1)",
          border: "1px solid rgba(204,255,0,0.25)",
          borderRadius: 999,
          padding: "4px 12px",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#ccff00",
            boxShadow: "0 0 8px #ccff00",
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#ccff00",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Let&apos;s make life an event
        </span>
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
          fontSize: 34,
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1.05,
          margin: "0 0 6px",
          letterSpacing: "-0.5px",
        }}
      >
        Find your
        <br />
        <span
          style={{
            backgroundImage: "linear-gradient(90deg,#c084fc,#f472b6,#fb923c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          next story.
        </span>
      </h1>
      <p
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.45)",
          margin: "0 0 28px",
          lineHeight: 1.5,
        }}
      >
        Events, venues &amp; foxers — all in one place.
      </p>
    </>
  );
}
