'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface MobileVenueDetailProps {
  venue?: any;
}

const AMENITIES = [
  { icon: 'wifi_calling_3', label: 'WiFi' },
  { icon: 'volume_up', label: 'Sound' },
  { icon: 'local_parking', label: 'Parking' },
];

export default function MobileVenueDetail({ venue }: MobileVenueDetailProps) {
  const router = useRouter();

  const name: string = venue?.name ?? 'Skyline Rooftop Loft';
  const rating: string = venue?.rating ? String(venue.rating) : '4.9';
  const city: string = venue?.city ?? 'Baguio City';
  const capacity: number = venue?.capacity ?? 120;
  const price: number = venue?.pricePerNight ?? venue?.price ?? 18500;

  return (
    <div
      style={{
        background: '#050608',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Hero image area */}
      <div style={{ height: 320, position: 'relative', overflow: 'hidden' }}>
        {venue?.images?.[0]?.url ? (
          <img
            src={venue.images[0].url}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            className="stripe"
            style={{ width: '100%', height: '100%', background: '#111' }}
          />
        )}
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, transparent 50%, #050608 100%)',
          }}
        />

        {/* Back arrow */}
        <button
          onClick={() => router.back()}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            arrow_back
          </span>
        </button>

        {/* Pagination dots */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 5,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: i === 0 ? 16 : 5,
                height: 5,
                borderRadius: 99,
                background: i === 0 ? '#fff' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Pull-up bottom sheet */}
      <div
        style={{
          position: 'absolute',
          top: 290,
          bottom: 0,
          left: 0,
          right: 0,
          background: '#050608',
          borderRadius: '28px 28px 0 0',
          overflowY: 'auto',
          paddingBottom: 112,
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 99,
              background: 'rgba(255,255,255,0.15)',
            }}
          />
        </div>

        <div style={{ padding: '0 20px' }}>
          {/* Venue pill */}
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(204,255,0,0.1)',
              color: '#ccff00',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRadius: 999,
              padding: '3px 10px',
              marginBottom: 10,
            }}
          >
            Venue
          </span>

          {/* Venue name */}
          <h1
            className="font-display"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#fff',
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            {name}
          </h1>

          {/* Rating + location */}
          <div
            className="flex items-center gap-1"
            style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 20 }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 14, color: '#facc15' }}
            >
              star
            </span>
            <span>
              {rating} · {city} · {capacity} cap.
            </span>
          </div>

          {/* Amenities row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              marginBottom: 24,
            }}
          >
            {AMENITIES.map((amenity) => (
              <div
                key={amenity.label}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)' }}
                >
                  {amenity.icon}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.4)',
                    textAlign: 'center',
                  }}
                >
                  {amenity.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.07)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.35)',
                marginBottom: 2,
              }}
            >
              From
            </p>
            <p
              className="font-display"
              style={{ fontSize: 20, fontWeight: 700, color: '#ccff00' }}
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
              padding: '11px 26px',
              boxShadow: '0 4px 16px rgba(204,255,0,0.35)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
