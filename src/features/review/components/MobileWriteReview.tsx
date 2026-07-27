'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MobileWriteReviewProps {
  venue?: {
    name?: string;
    bookingDate?: string;
  };
}

export default function MobileWriteReview({ venue }: MobileWriteReviewProps) {
  const router = useRouter();
  const [rating, setRating] = useState(4);

  const venueName = venue?.name ?? 'Skyline Rooftop Loft';
  const bookingDate = venue?.bookingDate ?? 'Aug 14, 2026';

  return (
    <div
      style={{ background: '#050608', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      className="text-white"
    >
      {/* Header */}
      <div
        style={{
          paddingTop: '60px',
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
          aria-label="Go back"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#fff' }}>
            arrow_back
          </span>
        </button>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Rate Your Experience</span>
      </div>

      {/* Content */}
      <div style={{ paddingLeft: '24px', paddingRight: '24px', textAlign: 'center', flex: 1 }}>
        {/* Thumbnail */}
        <div
          className="stripe"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            margin: '0 auto 14px',
          }}
        />

        {/* Venue name */}
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
          {venueName}
        </p>

        {/* Booking date */}
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', margin: '0 0 28px' }}>
          {bookingDate}
        </p>

        {/* Star rating */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '28px',
          }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '32px',
                  color: star <= rating ? '#ccff00' : 'rgba(255,255,255,0.2)',
                  fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                star
              </span>
            </button>
          ))}
        </div>

        {/* Review textarea */}
        <textarea
          placeholder="Tell others about your experience..."
          style={{
            width: '100%',
            height: '120px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '16px',
            color: '#fff',
            fontSize: '12px',
            resize: 'none',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '30px' }}>
        <button
          style={{
            width: '100%',
            background: '#ccff00',
            color: '#000',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            borderRadius: '14px',
            padding: '16px',
            cursor: 'pointer',
          }}
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}
