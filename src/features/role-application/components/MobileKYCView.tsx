'use client';

import React from 'react';

type RoleType = 'venueFoxer' | 'eventFoxer' | 'gearFoxer' | 'serviceFoxer';

const ROLE_DISPLAY: Record<RoleType, string> = {
  venueFoxer: 'Venue Foxer',
  eventFoxer: 'Event Foxer',
  gearFoxer: 'Gear Foxer',
  serviceFoxer: 'Service Foxer',
};

type StepStatus = 'verified' | 'in-review' | 'required';

interface KYCStep {
  label: string;
  status: StepStatus;
  icon: string;
  iconColor: string;
  iconBg: string;
  pillLabel: string;
  pillColor: string;
  pillBg: string;
}

const STEPS: KYCStep[] = [
  {
    label: 'Valid ID',
    status: 'verified',
    icon: 'check_circle',
    iconColor: '#22c55e',
    iconBg: 'rgba(34,197,94,0.15)',
    pillLabel: 'Verified',
    pillColor: '#22c55e',
    pillBg: 'rgba(34,197,94,0.15)',
  },
  {
    label: 'Business Permit',
    status: 'in-review',
    icon: 'hourglass_empty',
    iconColor: '#f97316',
    iconBg: 'rgba(249,115,22,0.15)',
    pillLabel: 'In Review',
    pillColor: '#f97316',
    pillBg: 'rgba(249,115,22,0.15)',
  },
  {
    label: 'Proof of Address',
    status: 'required',
    icon: 'upload_file',
    iconColor: 'rgba(255,255,255,0.4)',
    iconBg: 'rgba(255,255,255,0.08)',
    pillLabel: 'Upload',
    pillColor: 'rgba(255,255,255,0.7)',
    pillBg: 'rgba(255,255,255,0.10)',
  },
];

function getStatusText(status: StepStatus): string {
  if (status === 'verified') return 'Verified';
  if (status === 'in-review') return 'Under Review';
  return 'Required';
}

interface Props {
  roleType?: RoleType;
}

export default function MobileKYCView({ roleType = 'venueFoxer' }: Props) {
  const roleLabel = ROLE_DISPLAY[roleType];
  return (
    <div style={{ background: '#050608', minHeight: '100vh' }} className="text-white">
      {/* Header */}
      <div style={{ paddingTop: '60px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '4px' }}>
        <h1 className="font-display" style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
          Verify Your Identity
        </h1>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          Complete all steps to unlock {roleLabel} status
        </p>
      </div>

      {/* Steps */}
      <div
        style={{
          paddingLeft: '20px',
          paddingRight: '20px',
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {STEPS.map((step) => (
          <div
            key={step.label}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '18px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {/* Status icon */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: step.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '24px',
                  color: step.iconColor,
                  fontVariationSettings: step.status === 'verified' ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {step.icon}
              </span>
            </div>

            {/* Center info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>
                {step.label}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                {getStatusText(step.status)}
              </p>
            </div>

            {/* Status pill */}
            <div
              style={{
                background: step.pillBg,
                borderRadius: '20px',
                padding: '4px 10px',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: step.pillColor }}>
                {step.pillLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ paddingLeft: '20px', paddingRight: '20px', marginTop: '20px' }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
          1 of 3 Complete
        </p>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: i === 0 ? '#ccff00' : 'rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '30px', marginTop: '24px' }}>
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
          Upload Documents
        </button>
      </div>

      <div style={{ paddingBottom: '112px' }} />
    </div>
  );
}
