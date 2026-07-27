'use client';

const STRIPE_BG = `repeating-linear-gradient(
  135deg,
  rgba(255,255,255,0.03) 0px,
  rgba(255,255,255,0.03) 1px,
  transparent 1px,
  transparent 12px
)`;

const CATEGORIES = [
  {
    label: 'Weddings',
    icon: 'diamond',
    color: '#ec4899',
    gradient: 'rgba(236,72,153,0.2)',
  },
  {
    label: 'Corporate',
    icon: 'business_center',
    color: '#3b82f6',
    gradient: 'rgba(59,130,246,0.2)',
  },
  {
    label: 'Birthdays',
    icon: 'cake',
    color: '#f97316',
    gradient: 'rgba(249,115,22,0.2)',
  },
  {
    label: 'Social',
    icon: 'people',
    color: '#22c55e',
    gradient: 'rgba(34,197,94,0.2)',
  },
  {
    label: 'Nightlife',
    icon: 'nightlife',
    color: '#a855f7',
    gradient: 'rgba(168,85,247,0.2)',
  },
  {
    label: 'Outdoor',
    icon: 'park',
    color: '#ccff00',
    gradient: 'rgba(204,255,0,0.15)',
  },
];

export default function MobileCategoryGrid() {
  return (
    <div
      className="sm:hidden"
      style={{
        background: '#050608',
        minHeight: '100svh',
        fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
        color: '#fff',
        paddingTop: 60,
        paddingBottom: 112,
      }}
    >
      {/* Header */}
      <div style={{ padding: '0 20px 24px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 6px',
          }}
        >
          Browse by Vibe
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Find exactly the kind of night you want
        </p>
      </div>

      {/* 2-column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          padding: '0 20px',
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            style={{
              position: 'relative',
              height: 120,
              borderRadius: 20,
              overflow: 'hidden',
              background: `${STRIPE_BG}, #0e0f14`,
              border: '1px solid rgba(255,255,255,0.07)',
              cursor: 'pointer',
              textAlign: 'left',
              padding: 0,
            }}
          >
            {/* Gradient overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(160deg, ${cat.gradient} 0%, transparent 70%)`,
              }}
            />
            {/* Icon */}
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                fontSize: 26,
                color: cat.color,
              }}
            >
              {cat.icon}
            </span>
            {/* Label */}
            <span
              style={{
                position: 'absolute',
                bottom: 12,
                left: 14,
                fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
