'use client';

const STRIPE_BG = `repeating-linear-gradient(
  135deg,
  rgba(255,255,255,0.03) 0px,
  rgba(255,255,255,0.03) 1px,
  transparent 1px,
  transparent 12px
)`;

const KPI_CARDS = [
  {
    label: 'Revenue',
    value: '₱0',
    icon: 'payments',
    iconColor: '#10b981',
    iconBg: 'rgba(16,185,129,0.15)',
  },
  {
    label: 'Bookings',
    value: '0',
    icon: 'event_available',
    iconColor: '#3b82f6',
    iconBg: 'rgba(59,130,246,0.15)',
  },
  {
    label: 'Occupancy',
    value: '-%',
    icon: 'bar_chart',
    iconColor: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.15)',
  },
];

const PENDING = [
  { id: 1, name: 'Maria Santos', type: 'Venue booking request', time: '2h ago' },
  { id: 2, name: 'Juan dela Cruz', type: 'Event crew inquiry', time: '5h ago' },
];

interface MobileCreatorHomeProps {
  user: any;
}

export default function MobileCreatorHome({ user }: MobileCreatorHomeProps) {
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Creator';
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <div
      className="sm:hidden"
      style={{
        background: '#050608',
        minHeight: '100svh',
        fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
        color: '#fff',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '64px 20px 0',
        }}
      >
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>
            menu
          </span>
        </button>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          Creator Studio
        </span>

        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          {initial}
        </div>
      </div>

      {/* Hero greeting */}
      <div style={{ padding: '28px 20px 0' }}>
        <p
          style={{
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            fontSize: 26,
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Good morning,{' '}
          <span style={{ color: '#ccff00' }}>{firstName}.</span>
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* KPI scroll row */}
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          padding: '20px 20px 4px',
        }}
      >
        {KPI_CARDS.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              flexShrink: 0,
              width: 130,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18,
              padding: '16px 14px',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: kpi.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: kpi.iconColor }}
              >
                {kpi.icon}
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                fontSize: 20,
                fontWeight: 700,
                color: '#fff',
                margin: '0 0 2px',
              }}
            >
              {kpi.value}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Pending Requests */}
      <div style={{ padding: '24px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              margin: 0,
            }}
          >
            Pending Requests
          </p>
          <span
            style={{
              fontSize: 11,
              color: '#ccff00',
              fontWeight: 600,
            }}
          >
            {PENDING.length} new
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PENDING.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(124,58,237,0.25)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#c4b5fd',
                  flexShrink: 0,
                }}
              >
                {item.name.charAt(0)}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#fff',
                    margin: '0 0 2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  {item.type} · {item.time}
                </p>
              </div>
              {/* Review button */}
              <button
                style={{
                  flexShrink: 0,
                  background: '#ccff00',
                  color: '#000',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '7px 14px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Review
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '0 20px 112px' }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            margin: '0 0 14px',
          }}
        >
          Quick Actions
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: 'add_circle', label: 'New Event', color: '#ccff00' },
            { icon: 'apartment', label: 'Add Venue', color: '#c4b5fd' },
            { icon: 'inventory_2', label: 'Add Gear', color: '#93c5fd' },
            { icon: 'design_services', label: 'Add Service', color: '#fcd34d' },
          ].map((action) => (
            <button
              key={action.label}
              style={{
                background: `${STRIPE_BG}, rgba(255,255,255,0.03)`,
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                padding: '16px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20, color: action.color }}
              >
                {action.icon}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
