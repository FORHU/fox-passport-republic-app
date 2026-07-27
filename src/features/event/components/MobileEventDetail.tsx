'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface MobileEventDetailProps {
  event?: any;
}

export default function MobileEventDetail({ event }: MobileEventDetailProps) {
  const router = useRouter();

  const name = event?.name ?? 'Neon Nights: Rooftop Reception';
  const category = event?.category ?? 'Wedding';
  const locationText = event?.targetCity ?? 'Baguio City';
  const maxAttendees = event?.maxAttendees ?? 120;
  const price = event?.estimatedTotal ?? 48500;

  return (
    <div
      className="relative overflow-hidden pb-28"
      style={{ background: '#050608', minHeight: '100vh' }}
    >
      {/* Hero gradient */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: 420,
          background:
            'linear-gradient(180deg, rgba(219,39,119,0.2) 0%, rgba(5,6,8,0.3) 70%, #050608 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top row actions */}
      <div className="absolute inset-x-5 top-4 flex items-center justify-between z-10">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            arrow_back
          </span>
        </button>
        <button
          className="flex items-center justify-center"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            favorite_border
          </span>
        </button>
      </div>

      {/* Stripe hero placeholder area */}
      <div
        className="stripe"
        style={{ height: 320, width: '100%' }}
      />

      {/* Glassmorphic info card */}
      <div
        className="absolute inset-x-5"
        style={{
          top: 290,
          background: 'rgba(18,18,24,0.9)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 24,
          padding: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Category pill */}
        <span
          style={{
            display: 'inline-block',
            background: 'rgba(219,39,119,0.15)',
            color: '#f472b6',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            borderRadius: 999,
            padding: '3px 10px',
            marginBottom: 10,
          }}
        >
          {category}
        </span>

        {/* Event name */}
        <h1
          className="font-display"
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.2,
            marginBottom: 8,
          }}
        >
          {name}
        </h1>

        {/* Location */}
        <div
          className="flex items-center gap-1"
          style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 14 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            location_on
          </span>
          <span>
            {locationText} · Up to {maxAttendees} guests
          </span>
        </div>

        {/* Host avatars row */}
        <div className="flex items-center gap-2" style={{ marginBottom: 18 }}>
          <div className="flex" style={{ position: 'relative' }}>
            {['#7c3aed', '#db2777', '#f97316', '#3b82f6'].map((color, i) => (
              <div
                key={i}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: color,
                  border: '2px solid rgba(18,18,24,0.9)',
                  marginLeft: i === 0 ? 0 : -8,
                  zIndex: 4 - i,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 14, color: '#fff' }}
                >
                  person
                </span>
              </div>
            ))}
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
            +42 curated
          </span>
        </div>

        {/* Bottom: price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
              Est. total
            </p>
            <p
              className="font-display"
              style={{ fontSize: 22, fontWeight: 700, color: '#ccff00' }}
            >
              ₱{price.toLocaleString()}
            </p>
          </div>
          <button
            style={{
              background: '#ccff00',
              color: '#000',
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 999,
              padding: '10px 24px',
              boxShadow: '0 4px 16px rgba(204,255,0,0.35)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reserve
          </button>
        </div>
      </div>

      {/* Spacer so content below card is visible */}
      <div style={{ marginTop: 290, paddingTop: 220 }} />
    </div>
  );
}
