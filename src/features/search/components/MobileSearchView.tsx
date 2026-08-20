'use client';

import { useState } from 'react';
import Image from 'next/image';

const STRIPE_BG = `repeating-linear-gradient(135deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 12px)`;

const FILTERS = ['All', 'Venues', 'Events', 'Gear', 'Services'];

const RESULTS = [
  { id: 1, name: 'The Grand Ballroom', meta: 'Makati · Venue · Up to 300 pax', price: '₱12,000/hr', accent: '#7c3aed' },
  { id: 2, name: 'Saturday Night Social', meta: 'BGC · Event · This Saturday', price: '₱1,500/head', accent: '#db2777' },
  { id: 3, name: 'Pro Sound Package', meta: 'Quezon City · Gear · Available now', price: '₱3,500/day', accent: '#ccff00' },
  { id: 4, name: 'Marco Reyes — Event Foxer', meta: 'Pasig · Coordinator · 4.9 ★', price: '₱8,000/event', accent: '#f59e0b' },
];

export default function MobileSearchView() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');

  return (
    <div
      className="lg:hidden"
      style={{
        background: '#050608',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
        position: 'relative',
      }}
    >
      {/* Nav bar */}
      <div style={{
        position: 'absolute', top: 62, left: 0, right: 0, height: 64, zIndex: 5,
        background: 'rgba(5,6,8,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
      }}>
        <Image src="/foxonlylogo.png" alt="FoxPassport" width={22} height={22} style={{ objectFit: 'contain' }} />
        <p style={{ flex: 1, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)', margin: 0 }}>Explore</p>
        <button style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>tune</span>
        </button>
      </div>

      {/* Search + filter chips */}
      <div style={{ padding: '142px 20px 0', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 9999, padding: '12px 16px', marginBottom: 14,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>search</span>
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'inherit' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>close</span>
            </button>
          )}
        </div>

        <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 14 }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              flexShrink: 0, padding: '9px 18px', borderRadius: 9999,
              fontSize: 11, fontWeight: 800, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: activeFilter === f ? '#ccff00' : 'rgba(255,255,255,0.08)',
              color: activeFilter === f ? '#0a0a0c' : 'rgba(255,255,255,0.6)',
              outline: activeFilter === f ? 'none' : '1px solid rgba(255,255,255,0.14)',
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 14px', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 100 }}>
        {RESULTS.map((item) => (
          <div key={item.id} style={{
            display: 'flex', gap: 14,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18, padding: 12, cursor: 'pointer',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 14, flexShrink: 0,
              background: `${STRIPE_BG}, linear-gradient(135deg, ${item.accent}22 0%, #111318 100%)`,
              border: '1px solid rgba(255,255,255,0.07)',
            }} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>favorite_border</span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 6px' }}>{item.meta}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#ccff00', margin: 0 }}>{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
