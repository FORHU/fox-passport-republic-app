'use client';

const STRIPE_BG = `repeating-linear-gradient(
  135deg,
  rgba(255,255,255,0.03) 0px,
  rgba(255,255,255,0.03) 1px,
  transparent 1px,
  transparent 12px
)`;

const CARDS = [
  {
    accent: '#7c3aed',
    tag: 'Venues',
    tagBg: 'rgba(124,58,237,0.3)',
    tagColor: '#c4b5fd',
    name: 'The Grand Ballroom',
    meta: 'Makati · ₱12,000/hr',
  },
  {
    accent: '#db2777',
    tag: 'Events',
    tagBg: 'rgba(219,39,119,0.3)',
    tagColor: '#f9a8d4',
    name: 'Saturday Night Social',
    meta: 'BGC · This Saturday',
  },
  {
    accent: '#ccff00',
    tag: 'Gear',
    tagBg: 'rgba(204,255,0,0.15)',
    tagColor: '#ccff00',
    name: 'Pro Sound Package',
    meta: 'Quezon City · ₱3,500/day',
  },
];

export default function MobileHomePage() {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: '100svh',
        background: '#050608',
      }}
    >
      {/* Hero gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(124,58,237,0.25) 0%, rgba(5,6,8,0.95) 60%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top bar */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 20px 0',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.3px',
          }}
        >
          FoxPassport
        </span>
        <button
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 18, color: '#fff' }}
          >
            notifications
          </span>
        </button>
      </div>

      {/* Hero text */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          top: 40,
          padding: '0 20px',
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#ccff00',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Let&apos;s make life an event
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            fontSize: 34,
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Find your next story.
        </h2>
      </div>

      {/* Glassmorphic search bar */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          top: 56,
          padding: '0 20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 9999,
            padding: '12px 18px',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)' }}
          >
            search
          </span>
          <span
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.35)',
              fontWeight: 500,
            }}
          >
            Search venues, events, gear...
          </span>
        </div>
      </div>

      {/* Horizontal card scroll */}
      <div
        className="no-scrollbar"
        style={{
          position: 'absolute',
          top: 340,
          bottom: 112,
          left: 0,
          right: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          alignItems: 'stretch',
          paddingLeft: 20,
          gap: 14,
          zIndex: 1,
        }}
      >
        {CARDS.map((card, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: 190,
              height: 260,
              borderRadius: 22,
              position: 'relative',
              overflow: 'hidden',
              background: `${STRIPE_BG}, linear-gradient(135deg, ${card.accent}22 0%, #111318 100%)`,
              border: '1px solid rgba(255,255,255,0.07)',
              cursor: 'pointer',
            }}
          >
            {/* gradient overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)',
              }}
            />
            {/* accent glow dot */}
            <div
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: `${card.accent}33`,
                filter: `blur(16px)`,
              }}
            />
            {/* tag pill */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                background: card.tagBg,
                border: `1px solid ${card.tagColor}40`,
                borderRadius: 9999,
                padding: '4px 10px',
                fontSize: 10,
                fontWeight: 700,
                color: card.tagColor,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {card.tag}
            </div>
            {/* name + meta */}
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: 14,
                right: 14,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#fff',
                  margin: '0 0 4px',
                  lineHeight: 1.2,
                }}
              >
                {card.name}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.5)',
                  margin: 0,
                }}
              >
                {card.meta}
              </p>
            </div>
          </div>
        ))}
        {/* right padding spacer */}
        <div style={{ flexShrink: 0, width: 6 }} />
      </div>
    </div>
  );
}
