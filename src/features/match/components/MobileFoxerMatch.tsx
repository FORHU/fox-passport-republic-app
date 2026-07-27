'use client';

import React from 'react';

type Props = {
  foxer?: {
    name?: string;
    tags?: string[];
    rating?: number;
    reviewCount?: number;
    eventsHosted?: number;
    matchScore?: number;
  };
};

const DEFAULT_FOXER = {
  name: 'Maria Santos',
  tags: ['Photography', 'DJ'],
  rating: 4.9,
  reviewCount: 124,
  eventsHosted: 62,
  matchScore: 94,
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            fontSize: 14,
            color: i <= Math.round(rating) ? '#ccff00' : 'rgba(255,255,255,0.2)',
          }}
        >
          ★
        </span>
      ))}
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>
        ({rating.toFixed(1)})
      </span>
    </div>
  );
}

export default function MobileFoxerMatch({ foxer }: Props) {
  const data = {
    name: foxer?.name ?? DEFAULT_FOXER.name,
    tags: foxer?.tags ?? DEFAULT_FOXER.tags,
    rating: foxer?.rating ?? DEFAULT_FOXER.rating,
    eventsHosted: foxer?.eventsHosted ?? DEFAULT_FOXER.eventsHosted,
    matchScore: foxer?.matchScore ?? DEFAULT_FOXER.matchScore,
  };

  return (
    <div
      className="flex flex-col min-h-screen max-w-md mx-auto"
      style={{ background: '#050608' }}
    >
      {/* Header */}
      <div className="pt-[60px] text-center pb-5 px-6">
        <h1
          className="font-display font-bold text-white"
          style={{ fontSize: 20 }}
        >
          Find a Match
        </h1>
      </div>

      {/* Card stack */}
      <div
        className="relative px-6"
        style={{ height: 480 }}
      >
        {/* Back card */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 40,
            right: 40,
            bottom: 0,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 26,
            transform: 'rotate(3deg)',
          }}
        />

        {/* Front card */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            margin: '0 24px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 26,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top 60%: stripe bg with avatar */}
          <div
            className="stripe relative"
            style={{
              height: '60%',
              flexShrink: 0,
            }}
          >
            {/* Match score badge */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: '#ccff00',
                borderRadius: 999,
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#000',
                }}
              >
                {data.matchScore}% Match
              </span>
            </div>

            {/* Foxer avatar placeholder */}
            <div
              className="stripe"
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                width: 60,
                height: 60,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            />
          </div>

          {/* Bottom 40%: info panel */}
          <div
            style={{
              flex: 1,
              background: '#0d0d14',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Name */}
            <h2
              className="font-display font-bold text-white"
              style={{ fontSize: 18, lineHeight: '1.2' }}
            >
              {data.name}
            </h2>

            {/* Tags row */}
            <div className="flex items-center" style={{ gap: 8 }}>
              {data.tags.map((tag, i) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: i === 0 ? '#ccff00' : 'rgba(255,255,255,0.08)',
                    color: i === 0 ? '#000' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stars */}
            <StarRow rating={data.rating} />

            {/* Events stat */}
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              {data.eventsHosted} Events Hosted
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="flex justify-center mt-5"
        style={{ gap: 20 }}
      >
        {/* Decline */}
        <button
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)' }}
          >
            close
          </span>
        </button>

        {/* Accept */}
        <button
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: 'none',
            background: '#ccff00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 24, color: '#000', fontVariationSettings: "'wght' 700" }}
          >
            check
          </span>
        </button>
      </div>
    </div>
  );
}
