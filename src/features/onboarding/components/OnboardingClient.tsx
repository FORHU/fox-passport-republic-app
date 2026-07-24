"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import RequireAuth from '@/features/auth/components/RequireAuth';
import api from '@/shared/lib/axios';

type Step = 1 | 2 | 3;

const FOXER_ROLES = ['eventFoxer', 'venueFoxer', 'serviceFoxer', 'gearFoxer'];

const ROLES = [
  {
    type: 'service',
    roleType: 'serviceFoxer',
    href: '/foxer/apply?type=service',
    color: '#00d2ff',
    icon: 'design_services',
    tag: 'Talent Foxer',
    title: 'Talent Provider',
    desc: 'Offer catering, photography, entertainment, and professional services.',
  },
  {
    type: 'asset',
    roleType: 'gearFoxer',
    href: '/foxer/apply?type=asset',
    color: '#a78bfa',
    icon: 'inventory_2',
    tag: 'Gear Foxer',
    title: 'Gear Provider',
    desc: 'Rent out sound systems, lighting, furniture, and event equipment.',
  },
  {
    type: 'venue',
    roleType: 'venueFoxer',
    href: '/mayor/apply',
    color: '#ccff00',
    icon: 'apartment',
    tag: 'Venue Foxer',
    title: 'Space Provider',
    desc: 'List and manage your venues for others to host memorable events.',
  },
  {
    type: 'event',
    roleType: 'eventFoxer',
    href: '/creator-dashboard/apply',
    color: '#ff00aa',
    icon: 'travel_explore',
    tag: 'Event Foxer',
    title: 'Event Creator',
    desc: 'Create and organize events, coordinating every detail end-to-end.',
  },
];

export default function OnboardingClient({ user: serverUser }: { user: any }) {
  const router = useRouter();
  const { user: clientUser, setUser } = useAuthStore();
  const user = clientUser || serverUser;

  const existingRoles: string[] = (user?.roleType ?? []).filter((r: string) => FOXER_ROLES.includes(r));
  const hasExistingRoles = existingRoles.length > 0;

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState(user?.name ?? '');
  const [city, setCity] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const goAfterProfile = () => setStep(hasExistingRoles ? 3 : 2);
  const goBackFromRoles = () => setStep(hasExistingRoles ? 1 : 2);

  const handleProfileContinue = async () => {
    if (name.trim()) {
      try {
        setIsSaving(true);
        await api.put('/profile', {
          name: name.trim(),
          ...(city.trim() ? { city: city.trim() } : {}),
        });
        if (user) setUser({ ...user, name: name.trim() });
      } catch {
        // Non-blocking — continue even if save fails
      } finally {
        setIsSaving(false);
      }
    }
    goAfterProfile();
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center p-4 pt-20 pb-12 font-body">
        <div className="w-full max-w-2xl">

          {/* Exit — always visible */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/70 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Home
            </Link>

            {/* Step progress */}
            <div className="flex items-center gap-2">
              {([1, 2, 3] as Step[]).map((s) => {
                const active = step === s;
                const done = step > s || (hasExistingRoles && s === 2 && step === 3);
                return (
                  <div
                    key={s}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: active ? 32 : 8,
                      backgroundColor: active || done ? '#ccff00' : 'rgba(255,255,255,0.1)',
                    }}
                  />
                );
              })}
            </div>

            {/* spacer to balance the back link */}
            <div className="w-16" />
          </div>

          {/* ── Step 1: Profile setup ── */}
          {step === 1 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-10">
                <div className="mb-5 h-16 w-16 mx-auto rounded-full bg-[#ccff00]/10 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(204,255,0,0.25)]">
                  👋
                </div>
                <h2 className="text-4xl font-display font-bold text-white mb-3">
                  {hasExistingRoles ? 'Back again,' : 'Welcome,'}{' '}
                  <span className="text-[#ccff00]">
                    {user?.name?.split(' ')[0] || 'Friend'}!
                  </span>
                </h2>
                <p className="text-white/50">
                  {hasExistingRoles
                    ? 'Update your profile or continue to manage your roles.'
                    : "Let's set up your profile first."}
                </p>
              </div>

              <div className="bg-[#1a1a24] rounded-[2rem] p-8 border border-white/5 space-y-6">
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                    Display Name <span className="text-[#ccff00]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/[0.07] transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                    Your City{' '}
                    <span className="text-white/30 normal-case font-normal tracking-normal">
                      — optional
                    </span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#ccff00]/50 focus:bg-white/[0.07] transition-colors"
                    placeholder="e.g. Manila, Cebu, Davao"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={goAfterProfile}
                  className="flex-1 py-3.5 rounded-xl border border-white/10 text-white/40 text-sm hover:bg-white/5 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleProfileContinue}
                  disabled={isSaving || !name.trim()}
                  className="flex-2 py-3.5 rounded-xl bg-[#ccff00] text-black font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving…' : 'Continue →'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Intent (new users only) ── */}
          {step === 2 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-display font-bold text-white mb-3">
                  What brings you here?
                </h2>
                <p className="text-white/50">Choose how you plan to use FoxPassport.</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => router.push('/')}
                  className="group w-full bg-[#1a1a24] rounded-[1.5rem] p-7 text-left border border-white/5 hover:border-[#ccff00]/40 hover:bg-[#1e1e2c] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#ccff00]/15 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[24px]" style={{ color: '#ccff00' }}>
                        local_activity
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-display font-bold text-white">Book Events</h3>
                      <p className="text-sm text-white/40">
                        Browse foxers, venues, and services to create your perfect event.
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-[#ccff00] transition-colors">
                      arrow_forward
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="group w-full bg-[#1a1a24] rounded-[1.5rem] p-7 text-left border border-white/5 hover:border-[#ff00aa]/40 hover:bg-[#1e1e2c] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#ff00aa]/15 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[24px]" style={{ color: '#ff00aa' }}>
                        badge
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-display font-bold text-white">Become a Foxer</h3>
                      <p className="text-sm text-white/40">
                        Offer services, rent gear, list venues, or create events professionally.
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-[#ff00aa] transition-colors">
                      arrow_forward
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="group w-full bg-[#1a1a24] rounded-[1.5rem] p-7 text-left border border-white/5 hover:border-white/20 hover:bg-[#1e1e2c] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[24px] text-white/50">
                        people
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-display font-bold text-white">Both</h3>
                      <p className="text-sm text-white/40">
                        Book events and apply to become a Foxer in the ecosystem.
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-white transition-colors">
                      arrow_forward
                    </span>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setStep(1)}
                className="mt-6 text-sm text-white/30 hover:text-white/60 transition-colors mx-auto block"
              >
                ← Back
              </button>
            </div>
          )}

          {/* ── Step 3: Role selection ── */}
          {step === 3 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-display font-bold text-white mb-3">
                  {hasExistingRoles ? 'Your roles' : 'Choose your role'}
                </h2>
                <p className="text-white/50">
                  {hasExistingRoles
                    ? 'Active roles are shown below. Apply for additional roles anytime.'
                    : 'Select how you want to contribute. You can hold multiple roles over time.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLES.map((role) => {
                  const isActive = existingRoles.includes(role.roleType);

                  if (isActive) {
                    return (
                      <div
                        key={role.type}
                        className="relative bg-[#1a1a24] rounded-[1.5rem] p-6 border border-green-500/20 flex flex-col"
                        style={{ boxShadow: 'inset 0 0 0 1px rgba(34,197,94,0.15)' }}
                      >
                        <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[11px] fill-current">check_circle</span>
                          Active
                        </span>
                        <div
                          className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
                          style={{ backgroundColor: `${role.color}20` }}
                        >
                          <span className="material-symbols-outlined text-[24px]" style={{ color: role.color }}>
                            {role.icon}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: role.color }}>
                          {role.tag}
                        </p>
                        <h3 className="text-lg font-display font-bold text-white mb-1">{role.title}</h3>
                        <p className="text-xs text-white/30 mt-auto">{role.desc}</p>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={role.type}
                      href={role.href}
                      className="group relative bg-[#1a1a24] rounded-[1.5rem] p-6 text-left border border-white/5 hover:bg-[#1e1e2c] transition-all duration-300 hover:-translate-y-1 flex flex-col"
                    >
                      <div
                        className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{ boxShadow: `inset 0 0 0 1px ${role.color}` }}
                      />
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all"
                        style={{ backgroundColor: `${role.color}20` }}
                      >
                        <span className="material-symbols-outlined text-[24px]" style={{ color: role.color }}>
                          {role.icon}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: role.color }}>
                        {role.tag}
                      </p>
                      <h3 className="text-lg font-display font-bold text-white mb-1">{role.title}</h3>
                      <p className="text-xs text-white/40 group-hover:text-white/70 mt-auto transition-colors">
                        {role.desc}
                      </p>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={goBackFromRoles}
                  className="text-sm text-white/30 hover:text-white/60 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => router.push(hasExistingRoles ? '/creator-dashboard' : '/')}
                  className="py-2.5 px-6 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-colors"
                >
                  {hasExistingRoles ? 'Go to Dashboard' : 'Skip for now'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </RequireAuth>
  );
}
