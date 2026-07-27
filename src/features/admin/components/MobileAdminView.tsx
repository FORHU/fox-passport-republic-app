'use client';

const KPI_CARDS = [
  {
    label: 'Revenue',
    value: '₱0',
    icon: 'payments',
    valueColor: '#ccff00',
    iconColor: '#ccff00',
    iconBg: 'rgba(204,255,0,0.12)',
  },
  {
    label: 'Bookings',
    value: '0',
    icon: 'event_available',
    valueColor: '#3b82f6',
    iconColor: '#3b82f6',
    iconBg: 'rgba(59,130,246,0.15)',
  },
  {
    label: 'Citizens',
    value: '0',
    icon: 'people',
    valueColor: '#22c55e',
    iconColor: '#22c55e',
    iconBg: 'rgba(34,197,94,0.15)',
  },
];

const APPROVALS = [
  { id: 1, name: 'Luna Events Space', type: 'Venue application', time: '1h ago' },
  { id: 2, name: 'Rico Santos', type: 'Event Foxer role request', time: '3h ago' },
  { id: 3, name: 'Gear Up PH', type: 'Gear listing review', time: '6h ago' },
];

export default function MobileAdminView() {
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
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            fontSize: 16,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          Overview
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
          A
        </div>
      </div>

      {/* KPI scroll row */}
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          padding: '28px 20px 4px',
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
                color: kpi.valueColor,
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

      {/* Pending Approvals */}
      <div style={{ padding: '28px 20px 112px' }}>
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
          Pending Approvals
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {APPROVALS.map((item) => (
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
                  background: 'rgba(124,58,237,0.2)',
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
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#22c55e' }}>
                    check
                  </span>
                </button>
                <button
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ef4444' }}>
                    close
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
