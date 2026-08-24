'use client';

import React from 'react';
import { getPathLabel } from '@/features/gamification/lib/gamification';
import { UserPath } from '@/features/gamification/types/gamification';

interface PassportBookletCardProps {
  user: any;
  level?: number;
  citizenNo?: string;
}

export default function PassportBookletCard({
  user,
  level = 1,
  citizenNo = 'FX-2026-00481',
}: PassportBookletCardProps) {
  const name: string = user?.name ?? 'Juan Dela Cruz';
  const tierLabel = getPathLabel('user', level);
  const initial: string = name.charAt(0).toUpperCase();

  return (
    <div
      style={{
        borderRadius: 22,
        background: 'linear-gradient(135deg, #161616 0%, #0a0a0a 100%)',
        border: '1px solid rgba(204,255,0,0.25)',
        padding: 22,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle lime glow top-right */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(204,255,0,0.07)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
        <div>
          <p
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#ccff00',
              marginBottom: 2,
            }}
          >
            Republic of
          </p>
          <h2
            className="font-display"
            style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1 }}
          >
            Fox Passport
          </h2>
        </div>

        {/* Avatar */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#7c3aed',
            border: '2px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
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
              style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}
            >
              {initial}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{name}</p>

      {/* Citizen No */}
      <p
        style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        Citizen No. {citizenNo}
      </p>

      {/* Bottom right: level + role */}
      <div className="flex items-end justify-between">
        <div
          style={{
            height: 1,
            flex: 1,
            marginRight: 12,
            background: 'rgba(255,255,255,0.06)',
          }}
        />
        <div className="flex flex-col items-end">
          <span
            className="font-display"
            style={{ fontSize: 26, fontWeight: 700, color: '#ccff00', lineHeight: 1 }}
          >
            Lvl {level}
          </span>
          <span
            style={{
              fontSize: 9,
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: 2,
            }}
          >
            {tierLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
