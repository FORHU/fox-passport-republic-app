'use client';

import React from 'react';
import Image from 'next/image';
import PassportBookletCard from './PassportBookletCard';

interface Props {
  user?: any;
}

const STAMPS = [
  { icon: 'queue_music', label: 'DJ Night',    collected: true  },
  { icon: 'celebration', label: 'Party',       collected: true  },
  { icon: 'groups',      label: 'Social',      collected: true  },
  { icon: 'lock',        label: 'Locked',      collected: false },
];

export default function MobilePassportView({ user }: Props) {
  const level: number = user?.passport?.level ?? 4;

  return (
    <div style={{ background: '#050608', minHeight: '100svh', position: 'relative', color: '#fff' }}>

      {/* Lime radial glow */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320, background: 'radial-gradient(circle at 30% 0%, rgba(204,255,0,0.1), transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav bar */}
      <div style={{
        position: 'fixed', top: 62, left: 0, right: 0, height: 64, zIndex: 5,
        background: 'rgba(5,6,8,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
      }}>
        <Image src="/foxonlylogo.png" alt="FoxPassport" width={22} height={22} style={{ objectFit: 'contain' }} />
        <p style={{ flex: 1, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)', margin: 0 }}>Passport</p>
        <button style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>settings</span>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="no-scrollbar" style={{ position: 'relative', zIndex: 1, overflowY: 'auto', padding: '142px 20px 112px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Passport booklet card */}
        <PassportBookletCard
          user={user}
          level={level}
          citizenNo={user?.citizenId ?? 'FX-2026-00481'}
        />

        {/* Stamps Collected */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 12px' }}>
            Stamps Collected
          </p>
          <div className="no-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {STAMPS.map((stamp) => (
              <div
                key={stamp.label}
                style={{
                  flexShrink: 0, width: 78, height: 78, borderRadius: '50%',
                  border: stamp.collected ? '2px dashed #ccff00' : '2px dashed rgba(255,255,255,0.15)',
                  background: stamp.collected ? 'rgba(204,255,0,0.08)' : 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 26, color: stamp.collected ? '#ccff00' : 'rgba(255,255,255,0.2)' }}>
                  {stamp.icon}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Badge */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 12px' }}>
            Next Badge
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 10 }}>
              <span style={{ fontWeight: 700, color: '#fff' }}>Night Owl</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>3/5 events</span>
            </div>
            <div style={{ height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.1)' }}>
              <div style={{ width: '60%', height: '100%', borderRadius: 6, background: '#ccff00' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
