"use client";

import React from "react";

export default function MobileScannerView() {
  return (
    <div
      style={{
        background: "#050608",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      className="text-white"
    >
      {/* Header */}
      <div
        style={{
          paddingTop: "60px",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingBottom: "20px",
          textAlign: "center",
          width: "100%",
        }}
      >
        <h1
          className="font-display"
          style={{ fontSize: "19px", fontWeight: 700, margin: "0 0 4px" }}
        >
          Scan Guest Pass
        </h1>
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.45)",
            margin: 0,
          }}
        >
          Neon Nights Reception
        </p>
      </div>

      {/* Camera viewport */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        {/* Scan frame */}
        <div
          className="stripe"
          style={{
            width: "260px",
            height: "260px",
            borderRadius: "28px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Inner border */}
          <div
            style={{
              position: "absolute",
              inset: "16px",
              border: "2px solid #ccff00",
              borderRadius: "20px",
              pointerEvents: "none",
            }}
          />

          {/* Scan line */}
          <div
            className="scan-animate"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "#ccff00",
              boxShadow: "0 0 12px #ccff00",
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingBottom: "40px",
          width: "100%",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "16px",
          }}
        >
          Align QR code within frame
        </p>
        <button
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "14px",
            padding: "14px",
            fontSize: "13px",
            fontWeight: 700,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Enter Code Manually
        </button>
      </div>
    </div>
  );
}
