'use client';

import React, { useState } from 'react';

type PaymentMethod = 'card' | 'gcash';

const STEPS = ['CONFIG', 'GUESTS', 'PAY'] as const;

export default function MobileCheckoutView() {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('card');

  return (
    <div
      className="flex flex-col min-h-screen max-w-md mx-auto"
      style={{ background: '#050608' }}
    >
      {/* Header */}
      <div className="pt-[60px] px-5">
        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-6">
          <button
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}
            >
              arrow_back
            </span>
          </button>
          <h1
            className="font-display font-bold text-white"
            style={{ fontSize: 18 }}
          >
            Confirm &amp; Pay
          </h1>
        </div>

        {/* 3-step progress */}
        <div className="flex gap-2 mb-6">
          {STEPS.map((step, i) => {
            const isActive = i === 2; // PAY is active
            const isCompleted = i < 2;
            return (
              <div key={step} className="flex-1 flex flex-col gap-1">
                <div
                  style={{
                    height: 3,
                    borderRadius: 999,
                    background: isActive
                      ? '#ccff00'
                      : isCompleted
                      ? 'rgba(255,255,255,0.35)'
                      : 'rgba(255,255,255,0.1)',
                  }}
                />
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: isActive
                      ? '#fff'
                      : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 px-5 flex flex-col gap-5 pb-4">
        {/* Booking summary card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18,
            padding: 14,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}
        >
          {/* Thumbnail */}
          <div
            className="stripe"
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              flexShrink: 0,
            }}
          />
          {/* Info */}
          <div className="min-w-0">
            <p
              className="font-bold text-white"
              style={{ fontSize: 14, lineHeight: '1.3' }}
            >
              Neon Nights Reception
            </p>
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.45)',
                marginTop: 3,
              }}
            >
              Aug 14 · 6:00 PM · 2 guests
            </p>
          </div>
        </div>

        {/* Payment method label */}
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          Payment Method
        </p>

        {/* Payment pills */}
        <div className="flex" style={{ gap: 10 }}>
          {/* Card */}
          <button
            onClick={() => setSelectedPayment('card')}
            className="flex items-center gap-2 flex-1 justify-center"
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border:
                selectedPayment === 'card'
                  ? '1.5px solid #ccff00'
                  : '1.5px solid rgba(255,255,255,0.1)',
              background:
                selectedPayment === 'card'
                  ? 'rgba(204,255,0,0.06)'
                  : 'rgba(255,255,255,0.03)',
              transition: 'all 0.2s',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 18,
                color: selectedPayment === 'card' ? '#ccff00' : 'rgba(255,255,255,0.5)',
              }}
            >
              credit_card
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: selectedPayment === 'card' ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            >
              Card
            </span>
          </button>

          {/* GCash */}
          <button
            onClick={() => setSelectedPayment('gcash')}
            className="flex items-center gap-2 flex-1 justify-center"
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border:
                selectedPayment === 'gcash'
                  ? '1.5px solid #ccff00'
                  : '1.5px solid rgba(255,255,255,0.1)',
              background:
                selectedPayment === 'gcash'
                  ? 'rgba(204,255,0,0.06)'
                  : 'rgba(255,255,255,0.03)',
              transition: 'all 0.2s',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 18,
                color: selectedPayment === 'gcash' ? '#ccff00' : 'rgba(255,255,255,0.5)',
              }}
            >
              account_balance_wallet
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: selectedPayment === 'gcash' ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            >
              GCash
            </span>
          </button>
        </div>

        {/* Fee breakdown */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              Package estimate
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              ₱48,500
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              Service fee
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              ₱150
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 20px 30px',
        }}
      >
        <div className="flex justify-between items-baseline mb-4">
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Total</span>
          <span
            className="font-display font-bold"
            style={{ fontSize: 22, color: '#ccff00' }}
          >
            ₱48,650
          </span>
        </div>
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
          }}
        >
          Pay Now
        </button>
      </div>
    </div>
  );
}
