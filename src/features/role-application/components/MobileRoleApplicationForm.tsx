'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type RoleType = 'venueFoxer' | 'eventFoxer' | 'gearFoxer' | 'serviceFoxer';

interface Props {
  roleType?: RoleType;
}

const ROLE_CONFIG: Record<RoleType, { title: string; placeholder: string; docs: string }> = {
  venueFoxer: {
    title: 'Become a Venue Foxer',
    placeholder: 'e.g. Skyline Loft Manila',
    docs: 'Business permit, valid ID, proof of ownership',
  },
  eventFoxer: {
    title: 'Become an Event Foxer',
    placeholder: 'e.g. Neon Nights Events Co.',
    docs: 'Valid ID, portfolio or event references',
  },
  gearFoxer: {
    title: 'Become a Gear Foxer',
    placeholder: 'e.g. Pro Sound PH',
    docs: 'Valid ID, proof of equipment ownership',
  },
  serviceFoxer: {
    title: 'Become a Service Foxer',
    placeholder: 'e.g. Maria Santos Photography',
    docs: 'Valid ID, business permit or freelance credentials',
  },
};

const EXPERIENCE_OPTIONS = ['Less than 1 year', '1–3 years', '3–5 years', '5+ years'];

export default function MobileRoleApplicationForm({ roleType = 'venueFoxer' }: Props) {
  const router = useRouter();
  const config = ROLE_CONFIG[roleType];

  const [businessName, setBusinessName] = useState('');
  const [experience, setExperience] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

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
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{config.title}</span>
      </div>

      {/* Scrollable form */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingLeft: '20px',
          paddingRight: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Business Name */}
        <div>
          <label
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              display: 'block',
            }}
          >
            Business Name
          </label>
          <div style={{ marginTop: '6px' }}>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={config.placeholder}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '13px',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Years of Experience */}
        <div style={{ position: 'relative' }}>
          <label
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              display: 'block',
            }}
          >
            Years of Experience
          </label>
          <div style={{ marginTop: '6px', position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '13px',
                color: experience ? '#fff' : 'rgba(255,255,255,0.35)',
                outline: 'none',
                boxSizing: 'border-box',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{experience || 'Select range'}</span>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)' }}
              >
                {showDropdown ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: 'rgba(20,20,28,0.97)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '12px',
                  zIndex: 10,
                  overflow: 'hidden',
                }}
              >
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setExperience(opt);
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '12px 14px',
                      fontSize: '13px',
                      color: experience === opt ? '#ccff00' : '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upload Documents */}
        <div>
          <label
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              display: 'block',
            }}
          >
            Upload Documents
          </label>
          <div style={{ marginTop: '6px' }}>
            <div
              style={{
                border: '1.5px dashed rgba(255,255,255,0.15)',
                borderRadius: '14px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '24px', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '8px' }}
              >
                upload
              </span>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                {config.docs}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '30px', paddingTop: '16px' }}>
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
          Submit Application
        </button>
      </div>
    </div>
  );
}
