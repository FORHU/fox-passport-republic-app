"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
  venue?: {
    name?: string;
    bookingDate?: string;
    imgSrc?: string;
  };
  onSubmit?: (rating: number, text: string) => void;
}

export default function MobileWriteReview({ venue, onSubmit }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(4);
  const [text, setText] = useState("");

  const venueName = venue?.name ?? "Skyline Rooftop Loft";
  const bookingDate = venue?.bookingDate ?? "Aug 14, 2026";

  return (
    <div
      style={{
        background: "#050608",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
        position: "relative",
      }}
    >
      {/* Transparent nav bar */}
      <div
        style={{
          position: "absolute",
          top: 62,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 5,
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
        <button
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
            arrow_back
          </span>
        </button>
        <p
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
            margin: 0,
          }}
        >
          Rate Your Experience
        </p>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "142px 24px 20px",
        }}
      >
        {/* Thumbnail */}
        <div
          className="stripe"
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            marginBottom: 16,
            flexShrink: 0,
          }}
        />

        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 4px",
          }}
        >
          {venueName}
        </p>
        <p
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            margin: "0 0 28px",
          }}
        >
          {bookingDate}
        </p>

        {/* Star rating */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 28,
          }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 36,
                  color: star <= rating ? "#ccff00" : "rgba(255,255,255,0.2)",
                  fontVariationSettings:
                    star <= rating ? "'FILL' 1" : "'FILL' 0",
                  transition: "color 0.15s",
                }}
              >
                star
              </span>
            </button>
          ))}
        </div>

        {/* Review textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell others about your experience..."
          style={{
            width: "100%",
            flex: 1,
            minHeight: 140,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: 16,
            color: "#fff",
            fontSize: 13,
            resize: "none",
            outline: "none",
            boxSizing: "border-box",
            lineHeight: 1.5,
          }}
        />
      </div>

      {/* Sticky footer */}
      <div style={{ padding: "16px 24px 30px" }}>
        <button
          onClick={() => onSubmit?.(rating, text)}
          style={{
            width: "100%",
            background: "#ccff00",
            color: "#000",
            fontWeight: 800,
            fontSize: 14,
            border: "none",
            borderRadius: 16,
            padding: "16px 0",
            cursor: "pointer",
          }}
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}
