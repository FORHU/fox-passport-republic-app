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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {[
              { 
                title: 'Become a Foxer', 
                role: 'Service & Equipment Provider',
                icon: 'smart_toy', 
                desc: 'Provide services and equipments to enhance the ecosystem.', 
                color: '#00d2ff', // Cyan-ish for Foxer
                colorClass: 'cyan-400',
                link: '/foxer/apply'
              },
              { 
                title: 'Become a Mayor', 
                role: 'Space Provider',
                icon: 'apartment', 
                desc: 'Provide and manage your venues for others to host events.', 
                color: '#ccff00', // Lime for Mayor
                colorClass: '[#ccff00]',
                link: '/mayor/apply'
              },
              { 
                title: 'Become a Host', 
                role: 'Event Creator',
                icon: 'travel_explore', 
                desc: 'Create and organize events using venues provided by Mayors.', 
                color: '#ff00aa', // Pink for Host
                colorClass: 'pink-500',
                link: '/host/apply'
              },
            ].map((card, i) => (
              <Link 
                href={card.link} 
                key={i} 
                className={`group relative bg-[#1a1a24] rounded-[2rem] p-8 text-left border border-white/5 hover:bg-[#2a2a36] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col`}
                style={{
                  borderColor: 'rgba(255,255,255,0.05)',
                }}
              >
                {/* Hover border glow effect */}
                <div 
                  className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
                  style={{ boxShadow: `inset 0 0 0 1px ${card.color}` }}
                />
                
                <div 
                  className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all`}
                  style={{ backgroundColor: `${card.color}20` }}
                >
                  <span 
                    className={`material-symbols-outlined text-[32px]`}
                    style={{ color: card.color, textShadow: `0 0 10px ${card.color}80` }}
                  >
                    {card.icon}
                  </span>
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-1">{card.title}</h3>
                <p 
                  className={`text-xs font-bold uppercase tracking-wider mb-4`}
                  style={{ color: card.color }}
                >
                  {card.role}
                </p>
                <p className="text-sm text-white/50 group-hover:text-white/80 mt-auto">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
