'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type BookingStatus = 'confirmed' | 'waitlisted' | 'completed' | 'cancelled';

interface BookingItem {
  id: string;
  name: string;
  meta: string;
  status: BookingStatus;
}

const STATUS_STYLE: Record<BookingStatus, { bg: string; color: string; label: string }> = {
  confirmed:  { bg: 'rgba(204,255,0,0.12)',  color: '#ccff00',              label: 'Confirmed'  },
  waitlisted: { bg: 'rgba(234,179,8,0.12)',  color: '#facc15',              label: 'Waitlisted' },
  completed:  { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', label: 'Completed'  },
  cancelled:  { bg: 'rgba(239,68,68,0.12)',  color: '#f87171',              label: 'Cancelled'  },
};

const PLACEHOLDER: BookingItem[] = [
  { id: '1', name: 'Neon Nights Reception', meta: 'Aug 14 · Venue booking',   status: 'confirmed'  },
  { id: '2', name: 'DJ Marco — Live Set',   meta: 'Aug 14 · Service add-on', status: 'confirmed'  },
  { id: '3', name: 'Garden Pavilion',       meta: 'Sep 2 · Venue booking',   status: 'waitlisted' },
  { id: '4', name: 'Pro Sound Rig',         meta: 'Jul 20 · Asset rental',   status: 'completed'  },
  { id: '5', name: 'Skyline Loft',          meta: 'Jul 2 · Venue booking',   status: 'cancelled'  },
];

interface Props {
  bookings?: BookingItem[];
}

export default function MobileBookingsView({ bookings = PLACEHOLDER }: Props) {
  const router = useRouter();

  return (
    <div style={{ background: '#050608', minHeight: '100svh', position: 'relative', color: '#fff' }}>

      {/* Nav bar */}
      <div style={{
        position: 'fixed', top: 62, left: 0, right: 0, height: 64, zIndex: 5,
        background: 'rgba(5,6,8,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
      }}>
        <Image src="/foxonlylogo.png" alt="FoxPassport" width={22} height={22} style={{ objectFit: 'contain' }} />
        <p style={{ flex: 1, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)', margin: 0 }}>My Bookings</p>
      </div>

      {/* Booking list */}
      <div style={{ padding: '142px 20px 112px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {bookings.map((b) => {
          const s = STATUS_STYLE[b.status];
          return (
            <button
              key={b.id}
              style={{
                display: 'flex', gap: 12, textAlign: 'left', width: '100%',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: 12, cursor: 'pointer',
              }}
              onClick={() => router.push(`/booking/${b.id}`)}
            >
              {/* Thumbnail */}
              <div className="stripe" style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0 }} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: 0 }}>{b.name}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: '3px 0 6px' }}>{b.meta}</p>
                <span style={{
                  fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                  padding: '3px 9px', borderRadius: 999,
                  background: s.bg, color: s.color,
                }}>
                  {s.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
