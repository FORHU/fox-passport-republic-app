'use client';

import React, { useState } from 'react';

export default function MobileAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div
      className="flex flex-col justify-end min-h-screen max-w-md mx-auto relative"
      style={{ background: '#050608' }}
    >
      {/* Radial gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(204,255,0,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Bottom section */}
      <div className="relative z-10 px-6 pb-10">
        {/* Welcome label */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#ccff00',
            marginBottom: 10,
          }}
        >
          Welcome Back
        </p>

        {/* Title */}
        <h1
          className="font-display font-bold text-white mb-6"
          style={{ fontSize: 26, lineHeight: '1.25' }}
        >
          Log in to your
          <br />
          account
        </h1>

        {/* Input fields */}
        <div className="flex flex-col" style={{ gap: 12, marginBottom: 10 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: 15,
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              width: '100%',
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: 15,
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              width: '100%',
            }}
          />
        </div>

        {/* Forgot password */}
        <div className="flex justify-end mb-5">
          <button
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#ccff00',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Forgot password?
          </button>
        </div>

        {/* Log In CTA */}
        <button
          className="w-full font-bold"
          style={{
            background: '#ccff00',
            color: '#000',
            fontSize: 14,
            borderRadius: 16,
            padding: '14px 0',
            border: 'none',
            cursor: 'pointer',
            marginBottom: 14,
          }}
        >
          Log In
        </button>

        {/* OR divider */}
        <div
          className="flex items-center"
          style={{ gap: 12, marginBottom: 14 }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: 'rgba(255,255,255,0.1)',
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.35)',
              fontWeight: 600,
              letterSpacing: '0.06em',
            }}
          >
            OR
          </span>
          <div
            style={{
              flex: 1,
              height: 1,
              background: 'rgba(255,255,255,0.1)',
            }}
          />
        </div>

        {/* Continue with Google */}
        <button
          className="w-full flex items-center justify-center font-bold"
          style={{
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent',
            color: '#fff',
            fontSize: 14,
            borderRadius: 14,
            padding: '13px 0',
            cursor: 'pointer',
            gap: 10,
          }}
        >
          {/* Google icon (inline SVG) */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.583c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.583 9 3.583z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
