'use client';

import React from 'react';

interface MobileSettingsViewProps {
  user?: any;
}

const SETTINGS_ROWS = [
  { icon: 'account_circle', label: 'Account Info' },
  { icon: 'shield', label: 'Privacy & Security' },
  { icon: 'notifications', label: 'Notifications' },
  { icon: 'credit_card', label: 'Payment Methods' },
  { icon: 'help', label: 'Help & Support' },
  { icon: 'logout', label: 'Log Out' },
];

export default function MobileSettingsView({ user }: MobileSettingsViewProps) {
  const name: string = user?.name ?? 'Juan Dela Cruz';
  const email: string = user?.email ?? 'juan@example.com';
  const initial: string = name.charAt(0).toUpperCase();

  return (
    <div
      className="pb-28"
      style={{
        background: '#050608',
        minHeight: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Purple radial gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 300,
          height: 300,
          background: 'radial-gradient(circle at 70% 0%, rgba(124,58,237,0.15), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Profile section */}
      <div
        style={{
          paddingTop: 60,
          paddingBottom: 0,
          textAlign: 'center',
          padding: '60px 20px 0',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#7c3aed',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
          }}
        >
          {user?.imgId ? (
            <img
              src={user.imgId}
              alt={name}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <span
              className="font-display"
              style={{ fontSize: 30, fontWeight: 700, color: '#fff' }}
            >
              {initial}
            </span>
          )}
        </div>

        <h2
          className="font-display"
          style={{ fontSize: 19, fontWeight: 700, color: '#fff', marginBottom: 4 }}
        >
          {name}
        </h2>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{email}</p>
      </div>

      {/* Settings list */}
      <div
        style={{
          paddingTop: 26,
          paddingLeft: 20,
          paddingRight: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {SETTINGS_ROWS.map((row) => (
          <button
            key={row.label}
            className="flex items-center"
            style={{
              gap: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18,
              padding: 14,
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 20,
                  color:
                    row.icon === 'logout'
                      ? 'rgba(239,68,68,0.8)'
                      : 'rgba(255,255,255,0.6)',
                }}
              >
                {row.icon}
              </span>
            </div>

            {/* Label */}
            <span
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: 500,
                color: row.icon === 'logout' ? 'rgba(239,68,68,0.9)' : '#fff',
              }}
            >
              {row.label}
            </span>

            {/* Chevron */}
            {row.icon !== 'logout' && (
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: 'rgba(255,255,255,0.25)' }}
              >
                chevron_right
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
