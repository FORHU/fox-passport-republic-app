'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchStamps, Stamp } from '@/features/gamification/api/stamps';
import { useCategories } from '@/features/category/hooks/useCategories';

interface Props {
  userId: string;
}

function formatEarnedAt(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function formatPostmarkDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate().toString().padStart(2, '0');
  const mon = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const yr = d.getFullYear().toString().slice(-2);
  return `${day} ${mon} ${yr}`;
}

// Deterministic slight tilt so the collection looks hand-stuck, not gridded
const TILTS = [-3, 2, -1.5, 2.5, -2, 1.5, -2.5, 1.8];

function Postmark({ iso }: { iso: string }) {
  return (
    <div className="pointer-events-none absolute -right-5 -top-5 rotate-[-16deg] select-none">
      <div
        className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full text-center"
        style={{
          border: '2px solid rgba(20,20,20,0.55)',
          boxShadow: 'inset 0 0 0 1px rgba(20,20,20,0.25)',
          color: 'rgba(20,20,20,0.6)',
        }}
      >
        <div className="absolute inset-1 rounded-full border border-[rgba(20,20,20,0.4)]" />
        {/* wavy cancellation lines */}
        <div
          className="absolute -left-6 top-1/2 h-px w-10 -translate-y-1/2"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(20,20,20,0.45) 0 4px, transparent 4px 7px)',
          }}
        />
        <div className="leading-none">
          <p className="text-[7px] font-black uppercase tracking-[0.18em]">FoxPassport</p>
          <p className="text-[11px] font-extrabold tracking-wide mt-1">{formatPostmarkDate(iso)}</p>
          <p className="text-[6px] font-bold uppercase tracking-[0.22em] mt-1">Arrived</p>
        </div>
      </div>
    </div>
  );
}

function StampCard({ stamp, index }: { stamp: Stamp; index: number }) {
  const tilt = TILTS[index % TILTS.length];
  return (
    <div
      className="group relative transition-transform duration-300 hover:-translate-y-2 hover:rotate-0 hover:z-10"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {/* Stamp paper */}
      <div className="relative rounded-xl bg-[#f3efe3] p-2 shadow-[0_10px_22px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
        <div className="relative aspect-[4/5] overflow-hidden border border-dashed border-black/15 bg-black/10">
          {stamp.imageUrl ? (
            <Image
              fill
              src={stamp.imageUrl}
              alt={stamp.eventName}
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 320px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black">
              <div className="flex h-20 w-20 items-center justify-center rounded-full ring-2 ring-accent/70">
                {/* Brand fox as a white silhouette on black — always visible */}
                <img
                  src="/foxonlylogo.png"
                  alt=""
                  className="h-12 w-12 object-contain"
                  style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 5px #ccff00)' }}
                />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#ccff00] via-black to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-display font-bold text-sm leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-3">
              {stamp.eventName}
            </h3>
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[11px] font-bold text-black shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
              <span className="material-symbols-outlined text-[14px]">event_available</span>
              {formatEarnedAt(stamp.earnedAt)}
            </p>
          </div>
        </div>
      </div>
      <Postmark iso={stamp.earnedAt} />
    </div>
  );
}

export default function PassportStampsClient({ userId }: Props) {
  const router = useRouter();
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { categories } = useCategories();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchStamps(userId)
      .then(setStamps)
      .catch(() => setError('Could not load your passport stamps'))
      .finally(() => setLoading(false));
  }, [userId]);

  const featuredCategories = categories
    .filter((c) => !c.parentCategoryId)
    .slice(0, 4);

  return (
    <div className="bg-black text-text-main antialiased min-h-screen font-body">
      {/* Navbar */}
      <header className="fixed top-6 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold group-hover:rotate-180 transition-transform duration-700">
                <span className="material-symbols-outlined text-[24px]">explore</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-white group-hover:text-accent transition-colors">FoxPassport</h2>
            </Link>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
          </div>
        </div>
      </header>

      <main className="pt-36 pb-20 px-4">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="glass-panel rounded-3xl p-8 border border-white/10 mb-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-accent text-[28px]">menu_book</span>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white">Your Passport</h1>
              <p className="text-accent font-bold text-sm mt-1">{stamps.length} stamps collected</p>
            </div>
          </div>

          {loading ? (
            <div className="glass-panel rounded-3xl p-16 text-center border border-white/10">
              <span className="animate-spin material-symbols-outlined text-accent text-4xl block mx-auto">progress_activity</span>
            </div>
          ) : (stamps.length === 0 || error) ? (
            <div className="glass-panel rounded-3xl p-10 border border-white/10 text-center relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

              <h3 className="relative z-10 text-2xl font-display font-bold text-white mb-1">No stamps yet</h3>
              <p className="relative z-10 text-text-muted max-w-md mx-auto mb-8">
                Your passport is blank — book and attend an event to collect your first stamp!
              </p>

              {/* Ghost preview of the reward */}
              <div className="relative z-10 mx-auto mb-8 w-44 opacity-50 grayscale pointer-events-none">
                <StampCard
                  stamp={{ id: 'sample', eventName: 'Your First Event', earnedAt: new Date().toISOString(), imageUrl: '' }}
                  index={0}
                />
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/70">
                  Preview
                </span>
              </div>

              <Link
                href="/categories"
                className="relative z-10 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-bold text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(204,255,0,0.4)]"
              >
                <span className="material-symbols-outlined text-[18px]">explore</span>
                Explore Events
              </Link>

              {featuredCategories.length > 0 && (
                <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex flex-wrap justify-center gap-3">
                  {featuredCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white hover:border-accent/40 transition-all"
                    >
                      {cat.icon && <span className="material-symbols-outlined text-[16px] text-accent">{cat.icon}</span>}
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 px-2 py-4">
                {stamps.map((stamp, i) => (
                  <StampCard key={stamp.id} stamp={stamp} index={i} />
                ))}
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
