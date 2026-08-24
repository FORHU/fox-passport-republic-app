"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MobileCreatorBottomNav from "./MobileCreatorBottomNav";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const BOOKED_DAYS = new Set([4, 5, 12, 13, 20]);
const BLOCKED_DAYS = new Set([8, 9]);

function getDayStyle(day: number) {
  if (BOOKED_DAYS.has(day)) {
    return {
      background: "rgba(204,255,0,0.18)",
      border: "1px solid rgba(204,255,0,0.35)",
      color: "#ccff00",
    };
  }
  if (BLOCKED_DAYS.has(day)) {
    return {
      background: "rgba(239,68,68,0.12)",
      border: "1px solid rgba(239,68,68,0.25)",
      color: "#ef4444",
    };
  }
  return {
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.55)",
  };
}

export default function MobileHostCalendar() {
  const router = useRouter();
  const [monthIndex, setMonthIndex] = useState(7);
  const [year, setYear] = useState(2026);

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const handlePrev = () => {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setYear((y) => y - 1);
    } else setMonthIndex((m) => m - 1);
  };
  const handleNext = () => {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setYear((y) => y + 1);
    } else setMonthIndex((m) => m + 1);
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div style={{ background: "#050608", minHeight: "100svh", color: "#fff" }}>
      {/* Standard nav bar */}
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
          Calendar
        </p>
        <button
          onClick={() => {}}
          style={{
            background: "#ccff00",
            color: "#000",
            border: "none",
            borderRadius: 999,
            padding: "8px 14px",
            fontSize: 10,
            fontWeight: 800,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          + Block Dates
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "142px 20px 100px" }}>
        {/* Month nav */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <button
            onClick={handlePrev}
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}
            >
              chevron_left
            </span>
          </button>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#ccff00",
              margin: 0,
            }}
          >
            {MONTHS[monthIndex]} {year}
          </p>
          <button
            onClick={handleNext}
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}
            >
              chevron_right
            </span>
          </button>
        </div>

        {/* Day grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 5,
            marginBottom: 16,
          }}
        >
          {days.map((day) => {
            const s = getDayStyle(day);
            return (
              <div
                key={day}
                style={{
                  aspectRatio: "1",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  ...s,
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: 3,
                background: "#ccff00",
              }}
            />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              Booked
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: 3,
                background: "#ef4444",
              }}
            />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              Blocked
            </span>
          </div>
        </div>
      </div>

      <MobileCreatorBottomNav />
    </div>
  );
}
