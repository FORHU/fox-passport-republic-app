'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type PaymentMethod = 'card' | 'gcash';

const STEPS = ['CONFIG', 'GUESTS', 'PAY'] as const;

export default function MobileCheckoutView() {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('card');

  return (
    <div style={{ background: '#050608', minHeight: '100svh', position: 'relative', display: 'flex', flexDirection: 'column', color: '#fff' }}>

      {/* Nav bar */}
      <div style={{
        position: 'fixed', top: 62, left: 0, right: 0, height: 64, zIndex: 5,
        background: 'rgba(5,6,8,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
      }}>
        <Image src="/foxonlylogo.png" alt="FoxPassport" width={22} height={22} style={{ objectFit: 'contain' }} />
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_back</span>
        </button>
        <p style={{ flex: 1, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)', margin: 0 }}>Confirm &amp; Pay</p>
      </div>

      {/* Scrollable content */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '140px 20px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* 3-step progress */}
        <div style={{ display: 'flex', gap: 8 }}>
          {STEPS.map((step, i) => {
            const isActive    = i === 2; // PAY is current screen
            const isCompleted = i < 2;   // CONFIG, GUESTS done
            return (
              <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ height: 3, borderRadius: 999, background: isCompleted || isActive ? '#ccff00' : 'rgba(255,255,255,0.1)' }} />
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: isActive ? '#fff' : 'rgba(255,255,255,0.35)', margin: 0 }}>
                  {step}
                </p>
              </div>
            );
          })}
        </div>

        {/* Booking summary card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="stripe" style={{ width: 56, height: 56, borderRadius: 14, flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3, margin: 0 }}>Neon Nights Reception</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>Aug 14 · 6:00 PM · 2 guests</p>
          </div>
        </div>

        {/* Payment method label */}
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Payment Method
        </p>

        {/* Payment pills — vertical stack layout */}
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Card */}
          <button
            onClick={() => setSelectedPayment('card')}
            style={{
              flex: 1, padding: '14px 10px', borderRadius: 14,
              border: selectedPayment === 'card' ? '1.5px solid #ccff00' : '1.5px solid rgba(255,255,255,0.1)',
              background: selectedPayment === 'card' ? 'rgba(204,255,0,0.06)' : 'rgba(255,255,255,0.03)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: selectedPayment === 'card' ? '#ccff00' : 'rgba(255,255,255,0.45)' }}>
              credit_card
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: selectedPayment === 'card' ? '#fff' : 'rgba(255,255,255,0.45)' }}>Card</span>
          </button>

          {/* GCash */}
          <button
            onClick={() => setSelectedPayment('gcash')}
            style={{
              flex: 1, padding: '14px 10px', borderRadius: 14,
              border: selectedPayment === 'gcash' ? '1.5px solid #ccff00' : '1.5px solid rgba(255,255,255,0.1)',
              background: selectedPayment === 'gcash' ? 'rgba(204,255,0,0.06)' : 'rgba(255,255,255,0.03)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: selectedPayment === 'gcash' ? '#ccff00' : 'rgba(255,255,255,0.45)' }}>
              account_balance_wallet
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: selectedPayment === 'gcash' ? '#fff' : 'rgba(255,255,255,0.45)' }}>GCash</span>
          </button>
        </div>

        {/* Fee breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Package estimate</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>₱48,500</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Service fee</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>₱150</span>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 20px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Total</span>
          <span className="font-display" style={{ fontSize: 22, fontWeight: 700, color: '#ccff00' }}>₱48,650</span>
        </div>
        <button style={{ width: '100%', background: '#ccff00', color: '#000', fontSize: 14, fontWeight: 800, borderRadius: 16, padding: '16px 0', border: 'none', cursor: 'pointer' }}>
          Pay Now
        </button>
      </div>
    </div>
  );
}
