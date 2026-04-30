'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { fetchFoxerById, type Foxer } from '@/lib/api/foxers';

function getRoleLabel(foxer: Foxer): string {
  const roles = foxer.roleType ?? [];
  if (roles.includes('host')) return 'Event Foxer';
  if (roles.includes('foxerAsset')) return 'Gear Foxer';
  if (roles.includes('foxerService')) return 'Talent Foxer';
  return 'Foxer';
}

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop';

function SkeletonProfile() {
  return (
    <div className="min-h-screen bg-background bg-gradient-dark text-text-main selection:bg-accent selection:text-black">
      <header className="fixed top-0 left-0 right-0 z-50 p-6">
        <div className="h-10 w-36 rounded-full bg-white/5 animate-pulse" />
      </header>
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card rounded-[3rem] p-8 flex flex-col items-center gap-4">
              <div className="h-40 w-40 rounded-full bg-white/10" />
              <div className="h-6 w-32 bg-white/10 rounded" />
              <div className="h-3 w-20 bg-white/5 rounded" />
              <div className="h-16 w-full bg-white/5 rounded" />
            </div>
            <div className="glass-card rounded-[2.5rem] p-8 space-y-4">
              <div className="h-4 w-40 bg-white/10 rounded" />
              <div className="flex flex-wrap gap-2">
                {[...Array(6)].map((_, i) => <div key={i} className="h-6 w-20 bg-white/5 rounded-full" />)}
              </div>
            </div>
            <div className="h-14 w-full rounded-full bg-white/10" />
          </div>
          <div className="lg:col-span-8 space-y-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-48 bg-white/10 rounded" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-white/5 rounded" />
                  <div className="h-3 w-4/5 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

const FoxerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: foxer, isLoading, isError } = useQuery({
    queryKey: ['foxer', id],
    queryFn: () => fetchFoxerById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <SkeletonProfile />;

  if (isError || !foxer) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark text-text-main flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-6xl text-text-muted">person_off</span>
        <p className="text-text-muted">Foxer not found.</p>
        <Link href="/" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  const avatarUrl = foxer.imgId
    ? `https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${foxer.imgId}`
    : FALLBACK_AVATAR;

  const isHost = foxer.roleType?.includes('host');
  const roleLabel = getRoleLabel(foxer);
  const location = [foxer.city, foxer.state].filter(Boolean).join(', ');

  // Tags: service tags for talent/gear, event categories for hosts
  const allTags = isHost
    ? [...new Set((foxer.eventTemplates ?? []).map((t) => t.category))]
    : [...new Set(foxer.services.flatMap((s) => s.tags))];

  // Chip labels for the skills card
  const chipLabels = allTags.length > 0
    ? allTags
    : isHost
      ? (foxer.eventTemplates ?? []).map((t) => t.name)
      : foxer.services.map((s) => s.name);

  // Bio: first event template description for hosts, first service description otherwise
  const bio = isHost
    ? (foxer.eventTemplates?.[0]?.description ?? 'This host has not added a bio yet.')
    : (foxer.services[0]?.description ?? 'This foxer has not added a bio yet.');

  // Portfolio images: event template images for hosts, service images otherwise
  const portfolioImages = (
    isHost
      ? (foxer.eventTemplates ?? []).flatMap((t) => t.images.map((img) => img.url))
      : foxer.services.flatMap((s) => s.images.map((img) => img.url))
  ).slice(0, 6);

  // Stats card counts
  const primaryCount = isHost ? (foxer.eventTemplates?.length ?? 0) : foxer.services.length;
  const primaryLabel = isHost ? 'Events' : 'Services';
  const secondaryCount = allTags.length;
  const secondaryLabel = isHost ? 'Categories' : 'Skills';

  return (
    <div className="min-h-screen bg-background bg-gradient-dark text-text-main selection:bg-accent selection:text-black">
      <header className="fixed top-0 left-0 right-0 z-50 p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-all text-sm font-bold"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Listings
        </Link>
      </header>

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left Column */}
            <div className="lg:col-span-4 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[3rem] p-8 text-center"
              >
                <div className="relative inline-block mb-6">
                  <div className="h-40 w-40 rounded-full border-4 border-accent shadow-glow-accent overflow-hidden">
                    <img
                      src={avatarUrl}
                      alt={foxer.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
                    />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-accent text-black rounded-full p-2 shadow-lg scale-110">
                    <span className="material-symbols-outlined font-bold text-[20px]">verified</span>
                  </div>
                </div>

                <h1 className="text-3xl font-display font-bold mb-2">{foxer.name}</h1>
                <p className="text-accent font-bold uppercase tracking-widest text-xs mb-3">{roleLabel}</p>
                {location && (
                  <p className="text-text-muted text-xs mb-3 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {location}
                  </p>
                )}

                <div className="flex items-center justify-center gap-8 border-t border-white/5 pt-6">
                  <div>
                    <p className="text-xl font-display font-bold text-white">{primaryCount}</p>
                    <p className="text-[10px] text-text-muted uppercase font-bold">{primaryLabel}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <p className="text-xl font-display font-bold text-white">{secondaryCount}</p>
                    <p className="text-[10px] text-text-muted uppercase font-bold">{secondaryLabel}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-[2.5rem] p-8 space-y-6"
              >
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent">inventory_2</span>
                  {isHost ? 'Event Categories' : 'Skills & Services'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {chipLabels.map((label) => (
                    <span key={label} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/70 uppercase">
                      {label}
                    </span>
                  ))}
                </div>
              </motion.div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push(`/match/${foxer.id}`)}
                  className="w-full btn-neon py-5 bg-accent text-black rounded-full font-bold text-lg shadow-glow-accent flex items-center justify-center gap-2 group"
                >
                  Match with {foxer.name}
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">bolt</span>
                </button>
                <button
                  onClick={() => router.push(`/booking/config?foxerId=${foxer.id}`)}
                  className="w-full py-4 rounded-full font-bold text-base flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/5 hover:border-white/40 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isHost ? "event_available" : "handshake"}
                  </span>
                  {isHost ? "Book an Event" : "Avail Services"}
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-8 space-y-12">
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-display font-bold text-white">About the Pro</h2>
                <p className="text-lg text-text-muted leading-relaxed">{bio}</p>
              </motion.section>

              {/* Event Foxer (host): show event templates */}
              {isHost && (foxer.eventTemplates?.length ?? 0) > 0 && (
                <motion.section
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-display font-bold text-white">Events Created</h2>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      <span className="text-[10px] text-success font-bold uppercase">Public Events</span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {foxer.eventTemplates!.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/20 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-white group-hover:text-accent transition-colors">{tmpl.name}</h4>
                            <p className="text-xs text-text-muted">{tmpl.category}</p>
                          </div>
                          {(tmpl.targetCity || tmpl.targetState) && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-black/40 rounded-full text-accent border border-accent/20 shrink-0 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">location_on</span>
                              {tmpl.targetCity ?? tmpl.targetState}
                            </span>
                          )}
                        </div>
                        {tmpl.description && (
                          <p className="text-xs text-text-muted line-clamp-2">{tmpl.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Talent / Gear Foxer: show services */}
              {!isHost && foxer.services.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-display font-bold text-white">Available Services</h2>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      <span className="text-[10px] text-success font-bold uppercase">Available Now</span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {foxer.services.map((svc) => (
                      <div
                        key={svc.id}
                        className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/20 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-white group-hover:text-accent transition-colors">{svc.name}</h4>
                            <p className="text-xs text-text-muted">{svc.category.replace(/_/g, ' ')}</p>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-black/40 rounded-full text-accent border border-accent/20 shrink-0">
                            ₱{svc.price.toLocaleString()} / {svc.billingRate}
                          </span>
                        </div>
                        {svc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {svc.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {portfolioImages.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-display font-bold text-white">Recent Work</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {portfolioImages.map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-500 cursor-pointer border border-white/10 group"
                      >
                        <img
                          src={img}
                          alt="Portfolio"
                          className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                        />
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default FoxerProfile;
