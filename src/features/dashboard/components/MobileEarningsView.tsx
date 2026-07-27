'use client';

const PAYOUTS = [
  { id: 1, name: 'Booking: Luna Events Space', date: 'Jul 24, 2026', amount: '₱4,500' },
  { id: 2, name: 'Booking: Saturday Social Night', date: 'Jul 18, 2026', amount: '₱2,200' },
  { id: 3, name: 'Asset Booking: Pro Sound Pack', date: 'Jul 10, 2026', amount: '₱1,750' },
  { id: 4, name: 'Booking: Corporate Summit', date: 'Jul 3, 2026', amount: '₱6,000' },
];

export default function MobileEarningsView() {
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
      <div style={{ padding: '0 20px' }}>
        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            fontSize: 22,
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 20px',
          }}
        >
          Creator Earnings
        </h1>

        {/* Balance card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #161616, #0a0a0a)',
            border: '1px solid rgba(204,255,0,0.2)',
            borderRadius: 22,
            padding: 20,
            marginBottom: 28,
          }}
        >
          {/* Label */}
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              margin: '0 0 10px',
            }}
          >
            Available Balance
          </p>
          {/* Balance */}
          <p
            style={{
              fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
              fontSize: 30,
              fontWeight: 700,
              color: '#ccff00',
              margin: '0 0 4px',
              lineHeight: 1,
            }}
          >
            ₱0.00
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 0 20px' }}>
            Pending: ₱0.00
          </p>
          {/* Withdraw button */}
          <button
            style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: 9999,
              padding: '11px 28px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Withdraw
          </button>
        </div>

        {/* Recent payouts section */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            margin: '0 0 14px',
          }}
        >
          Recent Payouts
        </p>

        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18,
            overflow: 'hidden',
          }}
        >
          {PAYOUTS.map((payout, index) => (
            <div
              key={payout.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom:
                  index < PAYOUTS.length - 1
                    ? '1px solid rgba(255,255,255,0.05)'
                    : 'none',
              }}
            >
              <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
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
                  {payout.name}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  {payout.date}
                </p>
              </div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#22c55e',
                  margin: 0,
                  flexShrink: 0,
                }}
              >
                +{payout.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
