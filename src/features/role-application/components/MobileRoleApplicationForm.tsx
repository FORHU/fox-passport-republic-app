'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type RoleType = 'venueFoxer' | 'eventFoxer' | 'gearFoxer' | 'serviceFoxer';

interface Props {
  roleType?: RoleType;
}

const ROLE_TABS: { id: RoleType; label: string; icon: string }[] = [
  { id: 'venueFoxer',   label: 'Venue Foxer',   icon: 'apartment'       },
  { id: 'eventFoxer',   label: 'Event Foxer',   icon: 'celebration'     },
  { id: 'gearFoxer',    label: 'Gear Foxer',    icon: 'inventory_2'     },
  { id: 'serviceFoxer', label: 'Service Foxer', icon: 'design_services' },
];

const ROLE_CONFIG: Record<RoleType, { placeholder: string; docs: string }> = {
  venueFoxer:   { placeholder: 'e.g. Skyline Loft Manila',       docs: 'Business permit, valid ID, proof of ownership'       },
  eventFoxer:   { placeholder: 'e.g. Neon Nights Events Co.',    docs: 'Valid ID, portfolio or event references'             },
  gearFoxer:    { placeholder: 'e.g. Pro Sound PH',              docs: 'Valid ID, proof of equipment ownership'              },
  serviceFoxer: { placeholder: 'e.g. Maria Santos Photography',  docs: 'Valid ID, business permit or freelance credentials'  },
};

const EXPERIENCE_OPTIONS = ['Less than 1 year', '1–3 years', '3–5 years', '5+ years'];

export default function MobileRoleApplicationForm({ roleType = 'venueFoxer' }: Props) {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<RoleType>(roleType);
  const [businessName, setBusinessName] = useState('');
  const [experience, setExperience] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const config = ROLE_CONFIG[activeRole];

  return (
    <div style={{ background: '#050608', minHeight: '100svh', color: '#fff' }}>

      {/* Standard nav bar */}
      <div style={{
        position: 'fixed', top: 62, left: 0, right: 0, height: 64, zIndex: 5,
        background: 'rgba(5,6,8,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
      }}>
        <Image src="/foxonlylogo.png" alt="FoxPassport" width={22} height={22} style={{ objectFit: 'contain' }} />
        <button
          onClick={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_back</span>
        </button>
        <p style={{ flex: 1, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)', margin: 0 }}>Apply as a Foxer</p>
      </div>

      {/* Content */}
      <div style={{ padding: '142px 20px 40px' }}>

        {/* Role variant chips */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 28, paddingBottom: 4 }}>
          {ROLE_TABS.map((tab) => {
            const active = activeRole === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveRole(tab.id)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 999,
                  background: active ? '#ccff00' : 'rgba(255,255,255,0.06)',
                  border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: active ? '#000' : 'rgba(255,255,255,0.5)' }}>
                  {tab.icon}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: active ? '#000' : 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Business Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>
            Business Name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder={config.placeholder}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 12, padding: 14, fontSize: 13, color: '#fff', outline: 'none',
            }}
          />
        </div>

        {/* Years of Experience */}
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>
            Years of Experience
          </label>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 12, padding: 14, fontSize: 13,
              color: experience ? '#fff' : 'rgba(255,255,255,0.35)',
              outline: 'none', boxSizing: 'border-box', textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span>{experience || 'Select range'}</span>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>
              {showDropdown ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {showDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: 'rgba(20,20,28,0.97)', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 12, zIndex: 10, overflow: 'hidden',
            }}>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setExperience(opt); setShowDropdown(false); }}
                  style={{
                    width: '100%', background: 'none', border: 'none', padding: '12px 14px',
                    fontSize: 13, color: experience === opt ? '#ccff00' : '#fff',
                    textAlign: 'left', cursor: 'pointer',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Upload Documents */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>
            Upload Documents
          </label>
          <div style={{ border: '1.5px dashed rgba(255,255,255,0.15)', borderRadius: 14, padding: 24, textAlign: 'center', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 8 }}>
              upload
            </span>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{config.docs}</p>
          </div>
        </div>

        {/* Submit */}
        <button style={{
          width: '100%', background: '#ccff00', color: '#000', fontWeight: 800,
          fontSize: 14, border: 'none', borderRadius: 14, padding: 16, cursor: 'pointer',
        }}>
          Submit Application
        </button>
      </div>
    </div>
  );
}
