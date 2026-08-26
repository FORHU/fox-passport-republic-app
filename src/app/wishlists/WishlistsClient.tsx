"use client";

import React from "react";

const SAVED_ITEMS = [
  { id: 1, name: "Skyline Rooftop", price: "₱18,000/night" },
  { id: 2, name: "DJ Maria Santos", price: "₱8,500/event" },
  { id: 3, name: "Neon Lights Package", price: "₱12,000/pkg" },
  { id: 4, name: "Sound System Pro", price: "₱4,500/day" },
];

export default function WishlistsClient() {
  return (
    <div
      style={{ background: "#050608", minHeight: "100vh" }}
      className="text-white"
    >
      {/* Header */}
      <div
        style={{
          paddingTop: "60px",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingBottom: "20px",
        }}
      >
        <h1
          className="font-display text-white"
          style={{ fontSize: "24px", fontWeight: 700 }}
        >
          Saved
        </h1>
      </div>

      {/* 2-column grid */}
      <div
        style={{
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingBottom: "112px",
        }}
        className="grid grid-cols-2 gap-3"
      >
        {SAVED_ITEMS.map((item) => (
          <div
            key={item.id}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "18px",
              overflow: "hidden",
            }}
          >
            {/* Thumbnail */}
            <div
              className="stripe"
              style={{ height: "100px", position: "relative" }}
            >
              <button
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                }}
                aria-label="Remove from saved"
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "22px",
                    color: "#ec4899",
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  favorite
                </span>
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "10px" }}>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#fff",
                  margin: 0,
                }}
              >
                {item.name}
              </p>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#ccff00",
                  marginTop: "4px",
                  marginBottom: 0,
                }}
              >
                {item.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
