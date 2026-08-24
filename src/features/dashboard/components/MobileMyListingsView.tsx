'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import MobileCreatorBottomNav from './MobileCreatorBottomNav';

const STRIPE_BG = `repeating-linear-gradient(135deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 12px)`;

type FilterTab = 'Venues' | 'Events' | 'Assets' | 'Services';
const FILTER_TABS: FilterTab[] = ['Venues', 'Events', 'Assets', 'Services'];

type StatusKey = 'AVAILABLE' | 'PENDING' | 'PUBLISHED' | 'RESERVED' | 'DRAFT';
const STATUS_STYLE: Record<StatusKey, { bg: string; color: string }> = {
  AVAILABLE: { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  PENDING:   { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  PUBLISHED: { bg: 'rgba(59,130,246,0.15)',  color: '#3b82f6' },
  RESERVED:  { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  DRAFT:     { bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' },
};

const LISTINGS = [
  { id: '1', name: 'Skyline Loft',           type: 'Venue · Makati',         status: 'AVAILABLE' as StatusKey },
  { id: '2', name: 'Garden Pavilion',         type: 'Venue · Quezon City',    status: 'PUBLISHED' as StatusKey },
  { id: '3', name: 'Neon Nights',             type: 'Event Template',         status: 'PENDING'   as StatusKey },
  { id: '4', name: 'Pro Sound Rig',           type: 'Gear · Audio',           status: 'RESERVED'  as StatusKey },
  { id: '5', name: 'Sarah Reyes Photography', type: 'Service · Photography',  status: 'DRAFT'     as StatusKey },
];

export default function MobileMyListingsView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('Venues');

  return (
    <div style={{ background: '#050608', minHeight: '100svh', color: '#fff' }}>

      {/* Standard nav bar */}
      <div style={{
        position: 'fixed', top: 62, left: 0, right: 0, height: 64, zIndex: 5,
        background: 'rgba(5,6,8,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
      }}>
        <Image src="/foxonlylogo.png" alt="FoxPassport" width={22} height={22} style={{ objectFit: 'contain' }} />
        <p style={{ flex: 1, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)', margin: 0 }}>My Listings</p>
        <button
          onClick={() => router.push('/creator-dashboard/new')}
          style={{
            width: 34, height: 34, borderRadius: 999,
            background: '#ccff00', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#000', fontVariationSettings: "'wght' 700" }}>add</span>
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '142px 20px 112px' }}>

        {/* Filter tabs */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 2 }}>
          {FILTER_TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flexShrink: 0, padding: '7px 16px', borderRadius: 999,
                  background: active ? '#ccff00' : 'rgba(255,255,255,0.06)',
                  border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  fontSize: 12, fontWeight: 700,
                  color: active ? '#000' : 'rgba(255,255,255,0.55)',
                  cursor: 'pointer',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Listing rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LISTINGS.map((item) => {
            const s = STATUS_STYLE[item.status];
            return (
              <button
                key={item.id}
                onClick={() => router.push(`/creator-dashboard/listing/${item.id}`)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                {/* Stripe thumbnail */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0, overflow: 'hidden',
                  background: STRIPE_BG, border: '1px solid rgba(255,255,255,0.07)',
                }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{item.type}</p>
                </div>

                {/* Status badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                    padding: '4px 10px', borderRadius: 999,
                    background: s.bg, color: s.color,
                  }}>
                    {item.status}
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'rgba(255,255,255,0.25)' }}>
                    chevron_right
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <MobileCreatorBottomNav />
    </div>
  );
}
