'use client';

import React, { useState } from 'react';

type Role = {
  id: string;
  label: string;
  icon: string;
  description: string;
};

const ROLES: Role[] = [
  {
    id: 'citizen',
    label: 'Citizen',
    icon: 'person',
    description: 'Discover events & book venues',
  },
  {
    id: 'venueFoxer',
    label: 'Venue Foxer',
    icon: 'location_city',
    description: 'List your space for events',
  },
  {
    id: 'eventFoxer',
    label: 'Event Foxer',
    icon: 'celebration',
    description: 'Create and host events',
  },
  {
    id: 'gearFoxer',
    label: 'Gear Foxer',
    icon: 'inventory_2',
    description: 'Rent out gear & equipment',
  },
  {
    id: 'serviceFoxer',
    label: 'Service Foxer',
    icon: 'design_services',
    description: 'Offer catering, photography & more',
  },
];

export default function MobileRolePicker() {
  const [selected, setSelected] = useState<Set<string>>(new Set(['citizen']));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div
      className="flex flex-col min-h-screen px-5 pt-[60px] pb-10 max-w-md mx-auto"
      style={{ background: '#050608' }}
    >
      {/* Progress dots */}
      <div className="flex items-center gap-[6px] mb-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: i === 1 ? 24 : 8,
              height: 8,
              borderRadius: 999,
              background: i === 1 ? '#ccff00' : 'rgba(255,255,255,0.15)',
              transition: 'width 0.3s',
            }}
          />
        ))}
      </div>

      {/* Step label */}
      <p
        className="text-[10px] font-bold tracking-widest uppercase mb-3"
        style={{ color: '#ccff00' }}
      >
        Step 2 of 4
      </p>

      {/* Title */}
      <h1
        className="font-display font-bold text-white mb-2"
        style={{ fontSize: 28, lineHeight: '1.2' }}
      >
        What brings you here?
      </h1>

      {/* Subtitle */}
      <p className="text-[13px] mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Pick every role that fits — you can add more later.
      </p>

      {/* Role cards */}
      <div className="flex flex-col" style={{ gap: 12 }}>
        {ROLES.map((role) => {
          const isSelected = selected.has(role.id);
          return (
            <button
              key={role.id}
              onClick={() => toggle(role.id)}
              className="flex items-center text-left w-full"
              style={{
                gap: 14,
                borderRadius: 18,
                padding: 16,
                border: isSelected
                  ? '1.5px solid #ccff00'
                  : '1.5px solid rgba(255,255,255,0.1)',
                background: isSelected
                  ? 'rgba(204,255,0,0.06)'
                  : 'rgba(255,255,255,0.03)',
                transition: 'all 0.2s',
              }}
            >
              {/* Icon box */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: '#ccff00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 22, color: '#000' }}
                >
                  {role.icon}
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-bold text-white"
                  style={{ fontSize: 14, lineHeight: '1.3' }}
                >
                  {role.label}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: '1.4',
                    marginTop: 2,
                  }}
                >
                  {role.description}
                </p>
              </div>

              {/* Checkmark circle */}
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: isSelected ? '#ccff00' : 'transparent',
                  border: isSelected ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                {isSelected && (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 14, color: '#000', fontVariationSettings: "'wght' 700" }}
                  >
                    check
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Continue CTA */}
      <button
        className="w-full font-bold mt-6"
        style={{
          background: '#ccff00',
          color: '#000',
          fontSize: 16,
          borderRadius: 16,
          padding: '15px 0',
          border: 'none',
          cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
          opacity: selected.size === 0 ? 0.5 : 1,
          transition: 'opacity 0.2s',
        }}
        disabled={selected.size === 0}
      >
        Continue
      </button>
    </div>
  );
}
