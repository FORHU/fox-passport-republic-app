"use client";

import React, { useState } from "react";
import api from "@/shared/lib/axios";

export function MobileNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await api.post("/newsletter/subscribe", { email });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      style={{
        margin: "36px 20px 0",
        borderRadius: 24,
        overflow: "hidden",
        position: "relative",
        background:
          "linear-gradient(135deg,#2d0080 0%,#1a0040 50%,#050608 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "28px 20px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(204,255,0,0.15)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <span
          style={{
            display: "inline-block",
            background: "#fff",
            color: "#000",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderRadius: 999,
            padding: "4px 12px",
            marginBottom: 14,
          }}
        >
          Weekly Digest
        </span>
        <h3
          style={{
            fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
            fontSize: 28,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: 10,
          }}
        >
          FOMO is real.
          <br />
          Don&apos;t let it win.
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.55)",
            marginBottom: 18,
            lineHeight: 1.5,
          }}
        >
          Fresh drops on parties, pop-ups &amp; limited adventures — straight to
          your inbox.
        </p>
        {status === "success" ? (
          <p style={{ color: "#ccff00", fontWeight: 700, fontSize: 14 }}>
            You&apos;re on the list! 🎉
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="your@email.com"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 14,
                padding: "12px 16px",
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              style={{
                background: "#ccff00",
                color: "#000",
                fontWeight: 700,
                fontSize: 14,
                borderRadius: 14,
                padding: "12px 0",
                border: "none",
                cursor: "pointer",
              }}
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
            {status === "error" && (
              <p
                style={{ color: "#ef4444", fontSize: 11, textAlign: "center" }}
              >
                Something went wrong. Try again.
              </p>
            )}
          </div>
        )}
        <p
          style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.3)",
            marginTop: 14,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          No spam, just vibes.
        </p>
      </div>
    </div>
  );
}
