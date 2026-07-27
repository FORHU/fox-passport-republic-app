'use client';

import React, { useState } from 'react';

const DAYS_IN_MONTH = 31;
const MONTH_LABEL = 'August 2026';
const TODAY = 27;
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
// August 2026 starts on Saturday (index 6)
const START_DAY_OF_WEEK = 6;

export default function MobileBookingConfig() {
  const [selectedDay, setSelectedDay] = useState(14);
  const [guestCount, setGuestCount] = useState(4);

  const calendarCells: (number | null)[] = [
    ...Array(START_DAY_OF_WEEK).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];

  return (
    <div
      className="flex flex-col min-h-screen max-w-md mx-auto"
      style={{ background: '#050608' }}
    >
      {/* Header */}
      <div className="pt-[60px] px-5 mb-5">
        <div className="flex items-center gap-3">
          <button
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}
            >
              arrow_back
            </span>
          </button>
          <h1
            className="font-display font-bold text-white"
            style={{ fontSize: 18 }}
          >
            Book Your Date
          </h1>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 no-scrollbar px-5 pb-4"
        style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {/* Calendar card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20,
            padding: 16,
          }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }}
              >
                chevron_left
              </span>
            </button>
            <span
              className="font-display font-bold"
              style={{ fontSize: 14, color: '#ccff00' }}
            >
              {MONTH_LABEL}
            </span>
            <button
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }}
              >
                chevron_right
              </span>
            </button>
          </div>

          {/* Day headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px 0',
              marginBottom: 8,
            }}
          >
            {DAY_HEADERS.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.3)',
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
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
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
                    aspectRatio: '1',
                    borderRadius: 10,
                    border: isToday && !isSelected
                      ? '1px solid rgba(255,255,255,0.3)'
                      : 'none',
                    background: isSelected ? '#ccff00' : 'transparent',
                    color: isSelected ? '#000' : '#fff',
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s',
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
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p className="font-bold text-white" style={{ fontSize: 14 }}>
              Guests
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              Price scales with guest count
            </p>
          </div>

          <div className="flex items-center" style={{ gap: 14 }}>
            {/* Minus */}
            <button
              onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}
              >
                remove
              </span>
            </button>

            {/* Count */}
            <span
              className="font-display font-bold text-white"
              style={{ fontSize: 15, minWidth: 20, textAlign: 'center' }}
            >
              {guestCount}
            </span>

            {/* Plus */}
            <button
              onClick={() => setGuestCount((c) => c + 1)}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: 'none',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: '#000' }}
              >
                add
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 20px 30px',
        }}
      >
        <button
          className="w-full font-bold"
          style={{
            background: '#ccff00',
            color: '#000',
            fontSize: 14,
            borderRadius: 16,
            padding: '14px 0',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Continue to Guests
        </button>
      </div>
    </div>
  );
}
