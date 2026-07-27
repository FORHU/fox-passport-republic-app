'use client';

import React from 'react';

interface NotificationItem {
  icon: string;
  color: string;
  title: string;
  body: string;
  time: string;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    icon: 'check_circle',
    color: '#22c55e',
    title: 'Booking Confirmed',
    body: 'Neon Nights Reception · Aug 14',
    time: '2m ago',
  },
  {
    icon: 'verified_user',
    color: '#7c3aed',
    title: 'Role Approved',
    body: 'You are now a Venue Foxer',
    time: '1h ago',
  },
  {
    icon: 'payments',
    color: '#ccff00',
    title: 'Payout Sent',
    body: '₱8,400 deposited to your account',
    time: 'Yesterday',
  },
  {
    icon: 'celebration',
    color: '#f97316',
    title: 'Event Starting Soon',
    body: 'Skyline Rooftop in 3 hours',
    time: '3h ago',
  },
  {
    icon: 'star',
    color: '#3b82f6',
    title: 'New Review',
    body: 'Maria left you a 5-star review',
    time: '2d ago',
  },
];

export default function MobileNotificationList() {
  return (
    <div
      className="pb-28"
      style={{ background: '#050608', minHeight: '100vh' }}
    >
      {/* Header */}
      <div style={{ paddingTop: 60, paddingLeft: 20, paddingRight: 20, paddingBottom: 16 }}>
        <h1
          className="font-display"
          style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}
        >
          Notifications
        </h1>
      </div>

      {/* Notification list */}
      <div style={{ paddingLeft: 20, paddingRight: 20 }}>
        {NOTIFICATIONS.map((item, index) => (
          <div
            key={index}
            className="flex items-start"
            style={{
              gap: 14,
              paddingTop: 14,
              paddingBottom: 14,
              borderBottom:
                index < NOTIFICATIONS.length - 1
                  ? '1px solid rgba(255,255,255,0.05)'
                  : 'none',
            }}
          >
            {/* Icon tile */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: `${item.color}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20, color: item.color }}
              >
                {item.icon}
              </span>
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 2,
                }}
              >
                {item.title}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1.4,
                }}
              >
                {item.body}
              </p>
            </div>

            {/* Timestamp */}
            <span
              style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.25)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                paddingTop: 2,
              }}
            >
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
