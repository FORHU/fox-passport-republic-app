'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface MobileVenueDetailProps {
  venue?: any;
}

const AMENITIES = [
  { icon: 'wifi_calling_3', label: 'WiFi' },
  { icon: 'volume_up',      label: 'Sound' },
  { icon: 'local_parking',  label: 'Parking' },
];

export default function MobileVenueDetail({ venue }: MobileVenueDetailProps) {
  const router = useRouter();

  const name: string     = venue?.name ?? 'Skyline Rooftop Loft';
  const rating: string   = venue?.rating ? String(venue.rating) : '4.9';
  const city: string     = venue?.city ?? 'Baguio City';
  const capacity: number = venue?.capacity ?? 120;
  const price: number    = venue?.pricePerNight ?? venue?.price ?? 18000;

  return (
    <div style={{ background: '#050608', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Hero image / stripe */}
      <div style={{ height: 320, position: 'relative', overflow: 'hidden' }}>
        {venue?.images?.[0]?.url ? (
          <img src={venue.images[0].url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> // eslint-disable-line @next/next/no-img-element
        ) : (
          <div className="stripe" style={{ width: '100%', height: '100%', background: '#111' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, #050608 100%)' }} />

        {/* Photo indicator dots */}
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: i === 0 ? 16 : 5, height: 5, borderRadius: 99, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.3)' }} />
          ))}
        </div>
      </div>

      {/* Nav bar — overlaid on hero */}
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
        <p style={{ flex: 1, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)', margin: 0 }}>Venue</p>
        <button style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>favorite_border</span>
        </button>
      </div>

      {/* Pull-up bottom sheet — starts at 352 to give hero breathing room */}
      <div style={{
        position: 'absolute', top: 352, bottom: 0, left: 0, right: 0,
        background: '#050608', borderRadius: '28px 28px 0 0',
        overflowY: 'auto', paddingBottom: 112,
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, marginBottom: 16 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.2)' }} />
        </div>

        <div style={{ padding: '0 20px' }}>
          <span style={{ display: 'inline-block', background: 'rgba(204,255,0,0.12)', color: '#ccff00', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 999, padding: '4px 10px', marginBottom: 10 }}>
            Venue
          </span>

          <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6, lineHeight: 1.2 }}>{name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 16 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#facc15' }}>star</span>
            <span>{rating} · {city} · {capacity} cap.</span>
          </div>

          {/* Amenities */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
            {AMENITIES.map((a) => (
              <div key={a.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)' }}>{a.icon}</span>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 700 }}>{a.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: price + CTA */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>From</p>
            <p className="font-display" style={{ fontSize: 20, fontWeight: 700, color: '#ccff00', margin: '2px 0 0' }}>
              ₱{price.toLocaleString()}/night
            </p>
          </div>
          <button style={{ background: '#ccff00', color: '#000', fontWeight: 800, fontSize: 13, borderRadius: 999, padding: '14px 28px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(204,255,0,0.35)', whiteSpace: 'nowrap' }}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
