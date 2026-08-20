'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

const STRIPE_BG = `repeating-linear-gradient(135deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 12px)`;

const CATEGORIES = [
  { label: 'Weddings',  icon: 'diamond',          color: '#ec4899', gradient: 'rgba(236,72,153,0.2)' },
  { label: 'Corporate', icon: 'business_center',   color: '#3b82f6', gradient: 'rgba(59,130,246,0.2)' },
  { label: 'Birthdays', icon: 'cake',              color: '#f97316', gradient: 'rgba(249,115,22,0.2)' },
  { label: 'Social',    icon: 'people',            color: '#22c55e', gradient: 'rgba(34,197,94,0.2)' },
  { label: 'Nightlife', icon: 'nightlife',         color: '#a855f7', gradient: 'rgba(168,85,247,0.2)' },
  { label: 'Outdoor',   icon: 'park',              color: '#ccff00', gradient: 'rgba(204,255,0,0.15)' },
];

export default function MobileCategoryGrid() {
  const router = useRouter();

  return (
    <div
      className="lg:hidden"
      style={{
        background: '#050608',
        minHeight: '100svh',
        fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
        color: '#fff',
        paddingBottom: 112,
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
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_back</span>
        </button>
        <p style={{ flex: 1, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)', margin: 0 }}>Browse by Vibe</p>
      </div>

      {/* Subtitle */}
      <div style={{ padding: '142px 20px 12px' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Find exactly the kind of night you want
        </p>
      </div>

      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            style={{
              position: 'relative', height: 120, borderRadius: 20, overflow: 'hidden',
              background: `${STRIPE_BG}, #0e0f14`, border: '1px solid rgba(255,255,255,0.07)',
              cursor: 'pointer', textAlign: 'left', padding: 0,
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${cat.gradient} 0%, transparent 70%)` }} />
            <span className="material-symbols-outlined" style={{ position: 'absolute', top: 14, left: 14, fontSize: 22, color: cat.color }}>
              {cat.icon}
            </span>
            <span style={{ position: 'absolute', bottom: 12, left: 14, fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)', fontSize: 14, fontWeight: 700, color: '#fff' }}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
