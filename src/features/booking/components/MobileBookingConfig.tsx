"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const DAYS_IN_MONTH = 31;
const MONTH_LABEL = "August 2026";
const TODAY = 27;
const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
// August 2026 starts on Saturday (index 6)
const START_DAY_OF_WEEK = 6;

const BTN_GLASS: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0,
};

export default function MobileBookingConfig() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(14);
  const [guestCount, setGuestCount] = useState(4);

  const calendarCells: (number | null)[] = [
    ...Array(START_DAY_OF_WEEK).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];

  return (
    <div
      style={{
        background: "#050608",
        minHeight: "100svh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
      }}
    >
      {/* Nav bar */}
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
          Book Your Date
        </p>
      </div>

      {/* Scrollable content */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "142px 20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Calendar card */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 16,
          }}
        >
          {/* Month nav */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <button style={BTN_GLASS}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 17, color: "rgba(255,255,255,0.6)" }}
              >
                chevron_left
              </span>
            </button>
            <span
              className="font-display"
              style={{ fontSize: 14, fontWeight: 700, color: "#ccff00" }}
            >
              {MONTH_LABEL}
            </span>
            <button style={BTN_GLASS}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 17, color: "rgba(255,255,255,0.6)" }}
              >
                chevron_right
              </span>
            </button>
          </div>

          {/* Day headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "4px 0",
              marginBottom: 8,
            }}
          >
            {DAY_HEADERS.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.3)",
                  paddingBottom: 4,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
            }}
          >
            {calendarCells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;

              const isSelected = day === selectedDay;
              const isToday = day === TODAY;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 10,
                    border:
                      isToday && !isSelected
                        ? "1px solid rgba(255,255,255,0.3)"
                        : "none",
                    background: isSelected ? "#ccff00" : "transparent",
                    color: isSelected ? "#000" : "#fff",
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 400,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Guest counter card */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                margin: 0,
              }}
            >
              Guests
            </p>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                marginTop: 3,
              }}
            >
              Package rate applies
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
              style={BTN_GLASS}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }}
              >
                remove
              </span>
            </button>
            <span
              className="font-display"
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                minWidth: 20,
                textAlign: "center",
              }}
            >
              {guestCount}
            </span>
            <button
              onClick={() => setGuestCount((c) => c + 1)}
              style={BTN_GLASS}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }}
              >
                add
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "16px 20px 30px",
        }}
      >
        <button
          style={{
            width: "100%",
            background: "#ccff00",
            color: "#000",
            fontSize: 14,
            fontWeight: 800,
            borderRadius: 16,
            padding: "16px 0",
            border: "none",
            cursor: "pointer",
          }}
        >
          Continue to Guests
        </button>
      </div>
    </div>
  );
}
