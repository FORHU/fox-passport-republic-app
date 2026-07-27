'use client';

import React, { useState } from 'react';

// August 2026: starts on Saturday (day index 6 in Mo-Su grid)
// So we need 5 leading empty cells before day 1
const DAYS_IN_MONTH = 31;
const START_OFFSET = 5; // August 2026 starts on Saturday (index 5 in Mo..Su = Sa)

const BOOKED_DAYS = new Set([5, 12, 19, 26]);
const BLOCKED_DAYS = new Set([8, 9]);
const TODAY = 27;

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDayStyle(day: number) {
  if (BOOKED_DAYS.has(day)) {
    return {
      background: 'rgba(204,255,0,0.15)',
      border: '1px solid rgba(204,255,0,0.3)',
      color: '#ccff00',
    };
  }
  if (BLOCKED_DAYS.has(day)) {
    return {
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.2)',
      color: '#ef4444',
    };
  }
  if (day === TODAY) {
    return {
      border: '1px solid rgba(255,255,255,0.3)',
      color: '#fff',
    };
  }
  return {
    color: 'rgba(255,255,255,0.6)',
  };
}

export default function MobileHostCalendar() {
  const [monthIndex, setMonthIndex] = useState(7); // August = index 7
  const [year, setYear] = useState(2026);

  const monthLabel = `${MONTHS[monthIndex]} ${year}`;

  const handlePrev = () => {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setYear((y) => y - 1);
    } else {
      setMonthIndex((m) => m - 1);
    }
  };

  const handleNext = () => {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setYear((y) => y + 1);
    } else {
      setMonthIndex((m) => m + 1);
    }
  };

  // Build grid cells: offset empties + days
  const cells: (number | null)[] = [
    ...Array(START_OFFSET).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];

  return (
    <div style={{ background: '#050608', minHeight: '100vh' }} className="text-white">
      {/* Header */}
      <div style={{ paddingTop: '60px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '8px' }}>
        <h1 className="font-display" style={{ fontSize: '22px', fontWeight: 700 }}>
          Availability
        </h1>
      </div>

      {/* Month nav */}
      <div
        style={{
          paddingLeft: '20px',
          paddingRight: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <button
          onClick={handlePrev}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
          aria-label="Previous month"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'rgba(255,255,255,0.6)' }}>
            chevron_left
          </span>
        </button>

        <span style={{ fontSize: '15px', fontWeight: 700, color: '#ccff00' }}>{monthLabel}</span>

        <button
          onClick={handleNext}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
          aria-label="Next month"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'rgba(255,255,255,0.6)' }}>
            chevron_right
          </span>
        </button>
      </div>

      {/* Calendar card */}
      <div
        style={{
          marginLeft: '20px',
          marginRight: '20px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px',
          padding: '16px',
        }}
      >
        {/* Day labels */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            marginBottom: '8px',
          }}
        >
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              style={{
                fontSize: '9px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                textAlign: 'center',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
          }}
        >
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} style={{ width: '40px', height: '40px' }} />;
            }
            const style = getDayStyle(day);
            return (
              <div
                key={day}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  ...style,
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#ccff00', fontSize: '14px' }}>●</span> Booked
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#ef4444', fontSize: '14px' }}>●</span> Blocked
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>●</span> Available
          </span>
        </div>
      </div>

      {/* Summary stats */}
      <div
        style={{
          paddingLeft: '20px',
          paddingRight: '20px',
          marginTop: '16px',
          display: 'flex',
          gap: '10px',
        }}
      >
        {/* Booked */}
        <div
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '12px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#ccff00' }}>8</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Booked</div>
        </div>

        {/* Blocked */}
        <div
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '12px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444' }}>3</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Blocked</div>
        </div>

        {/* Open */}
        <div
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '12px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>20</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Open</div>
        </div>
      </div>

      <div style={{ paddingBottom: '112px' }} />
    </div>
  );
}
