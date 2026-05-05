"use client";

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import RequireAuth from '@/components/authentication/RequireAuth';

export default function OnboardingClient({ user: serverUser }: { user: any }) {
  const { user: clientUser } = useAuthStore();
  const user = clientUser || serverUser;

  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center p-4 pt-20 font-body">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-12 animate-in fade-in zoom-in duration-700">
            <div className="mb-6 h-16 w-16 mx-auto rounded-full bg-[#ccff00]/10 flex items-center justify-center text-4xl shadow-[0_0_15px_rgba(204,255,0,0.4)] animate-bounce">
              🎉
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Welcome to FoxPassport, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-green-400">{user?.name || "Friend"}!</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Your journey begins now. Choose your identity in the ecosystem:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {/* Foxer — Service */}
            <Link
              href="/foxer/apply?type=service"
              className="group relative bg-[#1a1a24] rounded-[2rem] p-8 text-left border border-white/5 hover:bg-[#2a2a36] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col"
            >
              <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px #00d2ff' }} />
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all" style={{ backgroundColor: '#00d2ff20' }}>
                <span className="material-symbols-outlined text-[32px]" style={{ color: '#00d2ff', textShadow: '0 0 10px #00d2ff80' }}>design_services</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#00d2ff' }}>Foxer · Service</p>
              <h3 className="text-xl font-display font-bold text-white mb-1">Service Provider</h3>
              <p className="text-xs text-white/50 group-hover:text-white/80 mt-auto">Offer catering, entertainment, design, and other professional services for events.</p>
            </Link>

            {/* Foxer — Gear */}
            <Link
              href="/foxer/apply?type=asset"
              className="group relative bg-[#1a1a24] rounded-[2rem] p-8 text-left border border-white/5 hover:bg-[#2a2a36] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col"
            >
              <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px #a78bfa' }} />
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all" style={{ backgroundColor: '#a78bfa20' }}>
                <span className="material-symbols-outlined text-[32px]" style={{ color: '#a78bfa', textShadow: '0 0 10px #a78bfa80' }}>inventory_2</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#a78bfa' }}>Foxer · Gear</p>
              <h3 className="text-xl font-display font-bold text-white mb-1">Gear Provider</h3>
              <p className="text-xs text-white/50 group-hover:text-white/80 mt-auto">Rent out sound systems, furniture, decorations, and equipment for events.</p>
            </Link>

            {/* Mayor */}
            <Link
              href="/mayor/apply"
              className="group relative bg-[#1a1a24] rounded-[2rem] p-8 text-left border border-white/5 hover:bg-[#2a2a36] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col"
            >
              <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px #ccff00' }} />
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all" style={{ backgroundColor: '#ccff0020' }}>
                <span className="material-symbols-outlined text-[32px]" style={{ color: '#ccff00', textShadow: '0 0 10px #ccff0080' }}>apartment</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#ccff00' }}>Mayor</p>
              <h3 className="text-xl font-display font-bold text-white mb-1">Space Provider</h3>
              <p className="text-xs text-white/50 group-hover:text-white/80 mt-auto">List and manage your venues for others to host events.</p>
            </Link>

            {/* Host */}
            <Link
              href="/creator-dashboard/apply"
              className="group relative bg-[#1a1a24] rounded-[2rem] p-8 text-left border border-white/5 hover:bg-[#2a2a36] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col"
            >
              <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px #ff00aa' }} />
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all" style={{ backgroundColor: '#ff00aa20' }}>
                <span className="material-symbols-outlined text-[32px]" style={{ color: '#ff00aa', textShadow: '0 0 10px #ff00aa80' }}>travel_explore</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#ff00aa' }}>Host</p>
              <h3 className="text-xl font-display font-bold text-white mb-1">Event Creator</h3>
              <p className="text-xs text-white/50 group-hover:text-white/80 mt-auto">Create and organize events using venues provided by Mayors.</p>
            </Link>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
