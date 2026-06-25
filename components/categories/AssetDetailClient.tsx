'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAssetById } from '@/lib/api/assets';
import { useCanPartner } from '@/hooks/useCanPartner';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import type { BackendAsset } from '@/lib/api/types';

// Hardcoded add-ons by category (until BE supports them)
const ADDON_PRESETS: Record<string, { name: string; price: number; icon: string }[]> = {
  Audio: [
    { name: 'On-site Sound Engineer', price: 3500, icon: 'engineering' },
    { name: 'In-Ear Monitor System', price: 2000, icon: 'headphones' },
    { name: 'Live Recording Service', price: 5000, icon: 'fiber_manual_record' },
  ],
  Gear: [
    { name: 'Delivery & Setup (within Metro)', price: 1500, icon: 'local_shipping' },
    { name: 'Instax Camera + Film', price: 800, icon: 'photo_camera' },
    { name: 'Extra Batteries & Backup Power', price: 500, icon: 'battery_charging_full' },
  ],
  Lighting: [
    { name: 'Fog Machine Add-on', price: 1000, icon: 'cloud' },
    { name: 'Additional Uplights (x4)', price: 600, icon: 'light_mode' },
  ],
  Default: [
    { name: 'Setup & Teardown Assistance', price: 1200, icon: 'build' },
    { name: 'On-call Tech Support', price: 2000, icon: 'support_agent' },
  ],
};

function getAddons(category?: string | null) {
  if (!category) return ADDON_PRESETS.Default;
  return ADDON_PRESETS[category] ?? ADDON_PRESETS.Default;
}

function getFeatures(asset: BackendAsset) {
  const features = [];
  if (asset.condition) features.push({ icon: 'verified', text: `Condition: ${asset.condition}` });
  if (asset.category) features.push({ icon: 'category', text: asset.category });
  if (asset.billingRate) features.push({ icon: 'schedule', text: `Billed per ${asset.billingRate.replace('per_', '')}` });
  features.push({ icon: 'support_agent', text: 'Owner On-call Support' });
  return features;
}

export default function AssetDetailClient({ assetId }: { assetId: string }) {
  const router = useRouter();
  const canPartner = useCanPartner();
  const { user } = useAuthStore();

  const [asset, setAsset] = useState<BackendAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    fetchAssetById(assetId)
      .then(setAsset)
      .catch(() => toast.error('Could not load equipment details.'))
      .finally(() => setIsLoading(false));
  }, [assetId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
          <p className="text-text-muted text-sm">Loading equipment details…</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center text-center p-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">Equipment Not Found</h2>
          <Link href="/categories" className="px-6 py-3 rounded-xl bg-accent text-black font-bold">
            Browse Equipment
          </Link>
        </div>
      </div>
    );
  }

  const images = (asset.images ?? []).map((img: any) => img.url ?? img.imageUrl ?? '').filter(Boolean);
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop';
  const galleryImages = images.length > 1 ? images : [mainImage, mainImage, mainImage, mainImage];
  const price = Number(asset.price ?? 0);
  const billingUnit = asset.billingRate?.replace('per_', '') ?? 'day';
  const features = getFeatures(asset);
  const addons = getAddons(asset.category);
  const ownerName = asset.ownerId ? `Provider #${asset.ownerId}` : 'Fox Provider';

  return (
    <div className="min-h-screen bg-background bg-gradient-dark text-text-main pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-background/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black group-hover:rotate-180 transition-transform duration-700">
            <span className="material-symbols-outlined text-[20px]">explore</span>
          </div>
          <span className="text-xl font-display font-bold text-white group-hover:text-accent transition-colors">FoxPassport</span>
        </Link>
        <div className="flex gap-3">
          <button className="h-10 w-10 flex items-center justify-center rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all">
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
          <button className="h-10 w-10 flex items-center justify-center rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all">
            <span className="material-symbols-outlined text-[20px]">favorite_border</span>
          </button>
        </div>
      </header>

      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[420px] mb-12 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
          <div className="md:col-span-2 md:row-span-2 overflow-hidden cursor-pointer" onClick={() => setActiveImg(0)}>
            <img src={galleryImages[activeImg] ?? mainImage} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="Main" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="hidden md:block overflow-hidden cursor-pointer group relative" onClick={() => setActiveImg(i % galleryImages.length)}>
              <img src={galleryImages[i % galleryImages.length]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={`View ${i}`} />
              {i === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-display font-bold">+{images.length - 4} photos</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Details */}
          <div className="lg:col-span-8 space-y-16">

            {/* Header Section */}
            <section>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-purple-400/20 border border-purple-400/30 rounded-full px-4 py-1 text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">
                  {asset.category ?? 'Equipment'}
                </span>
                {asset.condition && (
                  <span className="flex items-center gap-1 text-white font-bold text-[10px] uppercase tracking-widest bg-white/5 rounded-full px-3 py-1">
                    <span className="material-symbols-outlined text-accent text-[14px]">verified</span>
                    {asset.condition}
                  </span>
                )}
              </div>
              <h1 className="text-5xl font-display font-bold text-white mb-6 tracking-tight leading-tight">{asset.name}</h1>

              <div className="flex items-center gap-5 p-5 rounded-3xl bg-white/5 border border-white/5 w-fit hover:border-white/20 transition-all group">
                <div className="h-12 w-12 rounded-full bg-surface-highlight flex items-center justify-center text-accent font-bold text-lg ring-2 ring-white/5 group-hover:ring-accent transition-all">
                  {ownerName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-widest mb-0.5 leading-none">Listed by {ownerName}</p>
                  <p className="text-xs text-text-muted">Equipment Specialist</p>
                </div>
              </div>
            </section>

            {/* Included in this Build */}
            <section className="bg-surface-highlight/30 rounded-[3rem] p-10 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <span className="material-symbols-outlined text-8xl">format_quote</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-6 uppercase tracking-widest">Included in this Build</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((f, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-accent">
                      <span className="material-symbols-outlined">{f.icon}</span>
                    </div>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{f.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Description */}
            <section>
              <h3 className="text-2xl font-display font-bold text-white mb-6">About this Equipment</h3>
              <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">
                {asset.description || 'High-quality equipment available for your event. Contact the provider for full specs and setup requirements.'}
              </p>
            </section>

            {/* Monetized Add-ons */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-bold text-white">Monetized Add-ons</h3>
                <div className="px-4 py-1 rounded-full border border-white/5 text-[9px] font-bold text-white/30 uppercase tracking-widest">Optional Enhancements</div>
              </div>
              <div className="grid gap-4">
                {addons.map((addon, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-accent/40 hover:bg-accent/5 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-all">
                        <span className="material-symbols-outlined text-[20px]">{addon.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-white tracking-wide">{addon.name}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest">Managed by {ownerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-accent font-display font-bold text-xl block">₱{addon.price.toLocaleString()}</span>
                      <span className="text-[8px] text-white/20 font-bold uppercase tracking-tighter">One-time fee</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sticky Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-5">

              {/* FLOW 1: BOOK */}
              <div className="glass-card rounded-[3rem] p-8 border border-accent/20 bg-accent/5 overflow-hidden relative group shadow-glow-accent">
                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 blur-[60px] rounded-full pointer-events-none transition-transform group-hover:scale-150" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2 block">Equipment Hire</span>
                      <h3 className="text-3xl font-display font-bold text-white">Book Now</h3>
                    </div>
                    <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-white/40">
                      <span className="material-symbols-outlined text-[20px]">bolt</span>
                    </div>
                  </div>

                  <p className="text-sm text-text-muted mb-8 leading-relaxed">
                    Secure this equipment for your event. Standard rates apply with instant scheduling.
                  </p>

                  <div className="flex justify-between items-end border-b border-white/5 pb-6 mb-8">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Starting Price</span>
                    <div className="text-right">
                      <span className="text-4xl font-display font-bold text-white">₱{price.toLocaleString()}</span>
                      <p className="text-[10px] text-accent font-bold uppercase leading-none mt-1">Per {billingUnit}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/booking/asset/${assetId}`)}
                    className="w-full py-5 rounded-[2rem] bg-accent text-black font-bold text-lg hover:bg-white transition-all transform active:scale-95 shadow-xl group flex items-center justify-center gap-3"
                  >
                    Configure Booking
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* FLOW 2: PARTNER PROPOSAL — gated by role */}
              {canPartner && (
                <div className="glass-card rounded-[3rem] p-8 border border-white/10 bg-white/5 hover:border-white/20 transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none transition-transform group-hover:scale-150" />
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Collaboration</span>
                    <h3 className="text-2xl font-display font-bold text-white mb-2 leading-none">Partner Proposal</h3>
                    <p className="text-sm text-text-muted mb-6 leading-relaxed">Pitch a revenue-share model or cultural exchange co-branding.</p>

                    <div className="bg-black/40 rounded-2xl p-4 mb-6 border border-white/5 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">handshake</span>
                      </div>
                      <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest leading-tight">Shared Success<br />Model Available</span>
                    </div>

                    <button
                      onClick={() => router.push(`/booking/asset/${assetId}?mode=partner`)}
                      className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 border border-white/5"
                    >
                      Propose Match
                      <span className="material-symbols-outlined">join_inner</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="p-5 text-center">
                <p className="text-xs text-text-muted leading-relaxed">
                  Not sure which option to pick?<br />
                  <button
                    onClick={() => toast.info('Messaging feature coming soon!')}
                    className="text-white font-bold underline decoration-accent underline-offset-4 tracking-wide"
                  >
                    Talk to the provider
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
