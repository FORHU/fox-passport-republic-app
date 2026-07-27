'use client';

import React from 'react';

type Props = {
  ticketCode?: string;
  eventName?: string;
  eventDate?: string;
};

export default function MobileBookingSuccess({
  ticketCode = 'BKG-A3F72E8C41',
  eventName = 'Neon Nights Reception',
  eventDate = 'Aug 14',
}: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-7 text-center max-w-md mx-auto relative"
      style={{ background: '#050608' }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle 320px at 50% 40%, rgba(204,255,0,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Check circle */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: 'rgba(204,255,0,0.12)',
            border: '2px solid #ccff00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 40, color: '#ccff00', fontVariationSettings: "'wght' 300" }}
          >
            check
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-display font-bold text-white mb-3"
          style={{ fontSize: 26 }}
        >
          You&apos;re all set!
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            lineHeight: '1.6',
            marginBottom: 28,
            maxWidth: 280,
          }}
        >
          Your booking for{' '}
          <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            {eventName}
          </span>{' '}
          on{' '}
          <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            {eventDate}
          </span>{' '}
          is confirmed. Your Passport stamp will be awarded once the event is completed.
        </p>

        {/* Confirmation row */}
        <div
          className="w-full flex justify-between items-center"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18,
            padding: '14px 18px',
            marginBottom: 28,
          }}
        >
          <span
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}
          >
            Ticket Code
          </span>
          <span
            style={{
              fontSize: 13,
              color: '#fff',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            {ticketCode}
          </span>
        </div>

        {/* CTA */}
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
          View Booking
        </button>
      </div>
    </div>
  );
}
