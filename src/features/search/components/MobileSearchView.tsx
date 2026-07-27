'use client';

import { useState } from 'react';

const STRIPE_BG = `repeating-linear-gradient(
  135deg,
  rgba(255,255,255,0.03) 0px,
  rgba(255,255,255,0.03) 1px,
  transparent 1px,
  transparent 12px
)`;

const FILTERS = ['All', 'Venues', 'Events', 'Gear', 'Services'];

const RESULTS = [
  {
    id: 1,
    name: 'The Grand Ballroom',
    meta: 'Makati · Venue · Up to 300 pax',
    price: '₱12,000/hr',
    accent: '#7c3aed',
  },
  {
    id: 2,
    name: 'Saturday Night Social',
    meta: 'BGC · Event · This Saturday',
    price: '₱1,500/head',
    accent: '#db2777',
  },
  {
    id: 3,
    name: 'Pro Sound Package',
    meta: 'Quezon City · Gear · Available now',
    price: '₱3,500/day',
    accent: '#ccff00',
  },
  {
    id: 4,
    name: 'Marco Reyes — Event Foxer',
    meta: 'Pasig · Coordinator · 4.9 ★',
    price: '₱8,000/event',
    accent: '#f59e0b',
  },
];

export default function MobileSearchView() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');

  return (
    <div
      className="sm:hidden"
      style={{
        background: '#050608',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
      }}
    >
      {/* Top section */}
      <div style={{ padding: '60px 16px 0', flexShrink: 0 }}>
        {/* Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 9999,
            padding: '12px 18px',
            marginBottom: 14,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)' }}
          >
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search venues, events, gear..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: '#fff',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>
                close
              </span>
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 14,
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                flexShrink: 0,
                padding: '7px 16px',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.15s',
                background: activeFilter === f ? '#ccff00' : 'rgba(255,255,255,0.06)',
                color: activeFilter === f ? '#000' : 'rgba(255,255,255,0.6)',
                outline: activeFilter === f ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 16px',
          paddingBottom: 90,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {RESULTS.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              gap: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18,
              padding: 12,
              cursor: 'pointer',
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 14,
                flexShrink: 0,
                background: `${STRIPE_BG}, linear-gradient(135deg, ${item.accent}22 0%, #111318 100%)`,
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            />
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#fff',
                    margin: '0 0 4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </p>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}
                >
                  favorite_border
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 6px' }}>
                {item.meta}
              </p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#ccff00',
                  margin: 0,
                }}
              >
                {item.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Map View button */}
      <div
        style={{
          position: 'fixed',
          bottom: 80,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10,
          pointerEvents: 'none',
        }}
        className="sm:hidden"
      >
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#ccff00',
            color: '#000',
            border: 'none',
            borderRadius: 9999,
            padding: '10px 22px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(204,255,0,0.3)',
            pointerEvents: 'all',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            map
          </span>
          Map View
        </button>
      </div>
    </div>
  );
}
