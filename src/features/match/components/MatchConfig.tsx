'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useCheckoutStore } from '@/features/booking/store/useCheckoutStore';
import { createMatch } from '@/features/match/api/matches';
import { toast } from 'sonner';
import { fetchFoxerById } from '@/features/user/api/foxers';

interface Foxer {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  avatar: string;
  styles: string[];
  styleDescriptions: Record<string, string>;
  styleImages: Record<string, string>;
  styleCategories: Record<string, string>;
  basePrice: number;
}

function getRoleLabel(roleType: string[]): string {
  if (roleType.includes('eventFoxer')) return 'Event Foxer';
  if (roleType.includes('gearFoxer')) return 'Gear Foxer';
  if (roleType.includes('serviceFoxer')) return 'Talent Foxer';
  return 'Foxer';
}

const MatchConfig: React.FC = () => {
  const router = useRouter();
  const { foxerId } = useParams();
  const [step, setStep] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState('');
  const [requestContent, setRequestContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foxer, setFoxer] = useState<Foxer | null>(null);
  const [isLoadingFoxers, setIsLoadingFoxers] = useState(true);

  useEffect(() => {
    if (!foxerId) return;
    fetchFoxerById(foxerId as string)
      .then(u => {
        const isEventFoxer = u.roleType?.includes('eventFoxer');
        const templates = (u.eventTemplates ?? []).slice(0, 3);
        const services = (u.services ?? []).slice(0, 3);
        // Signature experiences: event template names for EventFoxers, service names otherwise
        const styles: string[] = isEventFoxer
          ? templates.map(t => t.name)
          : services.map(s => s.name);
        const styleDescriptions: Record<string, string> = {};
        const styleImages: Record<string, string> = {};
        const styleCategories: Record<string, string> = {};
        if (isEventFoxer) {
          templates.forEach(t => {
            styleDescriptions[t.name] = t.description ?? '';
            styleImages[t.name] = t.images?.[0]?.url ?? '';
            styleCategories[t.name] = t.category ?? '';
          });
        } else {
          services.forEach(s => {
            styleDescriptions[s.name] = s.description ?? '';
            styleImages[s.name] = (s as any).images?.[0]?.url ?? '';
            styleCategories[s.name] = s.category ?? '';
          });
        }
        const prices = services.map(s => s.price).filter((p: number) => p > 0);
        const basePrice = prices.length > 0 ? Math.min(...prices) : 0;
        setFoxer({
          id: u.id,
          name: u.name,
          role: getRoleLabel(u.roleType ?? []),
          rating: 0,
          reviews: 0,
          avatar: u.imgId
            ? `https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${u.imgId}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=ccff00&color=000`,
          styles: styles.length > 0 ? styles : [u.name + "'s Package"],
          styleDescriptions,
          styleImages,
          styleCategories,
          basePrice,
        });
      })
      .catch(() => toast.error('Could not load foxer profile'))
      .finally(() => setIsLoadingFoxers(false));
  }, [foxerId]);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  if (isLoadingFoxers || !foxer) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white/40">
          <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-sm font-display tracking-widest uppercase">Loading Foxer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background bg-gradient-dark min-h-screen text-text-main font-body flex flex-col">
      <header className="fixed top-6 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:rotate-180">
                <span className="material-symbols-outlined">explore</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-white">FoxPassport</h2>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-black/40 px-4 py-2 rounded-full border border-white/10">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${s <= step ? 'bg-accent' : 'bg-white/10'}`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="grow pt-32 pb-20 px-4">
        <div className="mx-auto max-w-4xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12 text-center"
              >
                <div className="relative inline-block">
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="h-32 w-32 rounded-full border-4 border-accent shadow-glow-accent overflow-hidden mx-auto"
                  >
                    <img src={foxer.avatar} alt={foxer.name} className="w-full h-full object-cover" />
                  </motion.div>
                  <div className="absolute -bottom-2 -right-2 bg-accent text-black rounded-full p-2 shadow-lg">
                    <span className="material-symbols-outlined font-bold">verified</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-display font-bold text-white">Match with {foxer.name}</h1>
                  <p className="text-xl text-text-muted max-w-2xl mx-auto">
                    These are events <span className="text-white font-bold">{foxer.name}</span> has brought to life.
                    Pick one that matches your vision — they&apos;ll tailor it entirely to you.
                  </p>
                </div>

                <div className={`grid gap-4 ${foxer.styles.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : foxer.styles.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                  {foxer.styles.map(style => {
                    const img = foxer.styleImages[style];
                    const category = foxer.styleCategories[style];
                    const isSelected = selectedStyle === style;
                    return (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`rounded-[2rem] border transition-all duration-300 text-left flex flex-col overflow-hidden group ${isSelected ? 'border-accent shadow-glow-accent' : 'border-white/5 hover:border-white/20'}`}
                      >
                        {/* Image */}
                        <div className="relative h-40 w-full overflow-hidden bg-white/5">
                          {img ? (
                            <img
                              src={img}
                              alt={style}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-4xl text-white/20">celebration</span>
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                              <span className="material-symbols-outlined text-accent text-4xl">check_circle</span>
                            </div>
                          )}
                          {category && (
                            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-black/60 text-white/70 backdrop-blur-sm">
                              {category}
                            </span>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-5 space-y-1.5 bg-surface-highlight/30">
                          <p className="font-bold text-white text-sm leading-snug">{style}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-accent/70">Past Creation</p>
                          <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
                            {foxer.styleDescriptions[style] || 'A proven event format successfully organized by this foxer.'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-8 space-y-4 flex flex-col items-center">
                  <button
                    disabled={!selectedStyle}
                    onClick={nextStep}
                    className="btn-neon px-12 py-4 rounded-full bg-accent text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    I want something like this
                  </button>
                  <button
                    onClick={() => { setSelectedStyle(''); nextStep(); }}
                    className="text-sm text-white/40 hover:text-white/70 underline underline-offset-4 transition-colors"
                  >
                    I have my own idea in mind →
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-display font-bold text-white">The Logistics</h2>
                  <p className="text-text-muted">When and how many characters are in this story?</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Select Date</label>
                      <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:ring-accent focus:border-accent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Total Guests</label>
                      <div className="flex items-center justify-between bg-black/40 p-2 rounded-2xl border border-white/10">
                        <button onClick={() => setGuests(Math.max(1, guests-1))} className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10">
                          <span className="material-symbols-outlined text-white">remove</span>
                        </button>
                        <span className="text-2xl font-display font-bold text-white">{guests}</span>
                        <button onClick={() => setGuests(guests+1)} className="h-12 w-12 rounded-xl bg-accent text-black flex items-center justify-center hover:opacity-90">
                          <span className="material-symbols-outlined">add</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {selectedStyle ? (
                    <div className="glass-card p-8 rounded-[2.5rem] bg-accent/5 border border-accent/20 space-y-5">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-accent/70 mb-1">Your Starting Point</p>
                        <h3 className="text-lg font-bold text-white leading-snug">{selectedStyle}</h3>
                        <p className="text-xs text-white/40 mt-1 uppercase tracking-wide">{foxer.styleCategories[selectedStyle]}</p>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {foxer.name} will use this as your baseline and tailor every detail — venue, timing, vibe — entirely to you.
                      </p>
                      <ul className="space-y-3 pt-1">
                        {[
                          'Venue sourcing & coordination',
                          'Services, talent & equipment',
                          'On-the-day management',
                        ].map(item => (
                          <li key={item} className="flex gap-3 text-sm text-white/70">
                            <span className="material-symbols-outlined text-accent text-[18px]">check_circle</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="glass-card p-8 rounded-[2.5rem] bg-white/3 border border-white/10 space-y-5">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Your Path</p>
                        <h3 className="text-xl font-bold text-white">Your vision. Their expertise.</h3>
                      </div>
                      <p className="text-sm text-white/50 leading-relaxed">
                        In the next step, describe exactly what you&apos;re imagining — theme, vibe, scale. {foxer.name} will review it and craft a custom proposal built around your idea.
                      </p>
                      <div className="flex items-center gap-3 pt-2 p-4 rounded-2xl bg-black/20 border border-white/5">
                        <span className="material-symbols-outlined text-white/30">lightbulb</span>
                        <p className="text-xs text-white/40">The more detail you give, the better the match.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-4">
                  <button onClick={prevStep} className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white">Back</button>
                  <button 
                    disabled={!date}
                    onClick={nextStep}
                    className="btn-neon px-12 py-4 rounded-full bg-accent text-black font-bold disabled:opacity-50"
                  >
                    Check Availability
                  </button>
                </div>
              </motion.div>
            )}

             {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-display font-bold text-white">
                    {selectedStyle ? 'Make it yours' : 'Paint the picture'}
                  </h2>
                  <p className="text-text-muted">
                    {selectedStyle
                      ? <>Tell {foxer.name} how you&apos;d like to put your own spin on <span className="text-white font-semibold">{selectedStyle}</span>.</>
                      : <>Describe the event you have in mind — {foxer.name} will take it from there.</>
                    }
                  </p>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem]">
                  <textarea
                    value={requestContent}
                    onChange={(e) => setRequestContent(e.target.value)}
                    placeholder={selectedStyle
                      ? `e.g. I love the ${selectedStyle} concept — I'd like something similar but for a 50-person birthday, outdoors if possible, with a live band...`
                      : "e.g. I'm thinking a rooftop gathering for 60 people, Boho theme, sunset ceremony, live acoustic music, and a grazing table for food..."
                    }
                    className="w-full bg-black/20 border border-white/10 rounded-3xl p-6 text-white min-h-[200px] outline-none focus:border-accent transition-all leading-relaxed"
                  />
                </div>

                <div className="flex justify-center gap-4">
                  <button onClick={prevStep} className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white">Back</button>
                  <button onClick={nextStep} className="btn-neon px-12 py-4 rounded-full bg-accent text-black font-bold">Review Match</button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-display font-bold text-white">Ready to Match?</h2>
                  <p className="text-text-muted">Review your custom experience request.</p>
                </div>

                <div className="glass-card overflow-hidden rounded-[2.5rem] border-white/20">
                  <div className="p-8 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-6">
                      <img src={foxer.avatar} className="h-20 w-20 rounded-2xl object-cover" alt="" />
                      <div>
                        <h3 className="text-2xl font-bold text-white">{foxer.name}</h3>
                        <p className="text-accent font-bold uppercase tracking-widest text-xs">{foxer.role}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 grid md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Based on</span>
                          <span className="text-white font-bold text-right max-w-[60%]">{selectedStyle || 'Own idea'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Date</span>
                          <span className="text-white font-bold">{date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Citizens</span>
                          <span className="text-white font-bold">{guests} Guests</span>
                        </div>
                        <div className="h-px bg-white/10"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-white font-bold">Estimated Cost</span>
                          {foxer.basePrice > 0 ? (
                            <span className="text-2xl font-display font-bold text-accent">₱{(foxer.basePrice * guests).toLocaleString()}</span>
                          ) : (
                            <span className="text-sm font-bold text-white/50 italic">To be quoted</span>
                          )}
                        </div>
                     </div>
                     <div className="bg-black/20 p-6 rounded-2xl border border-white/5 overflow-hidden">
                        <label className="text-xs font-bold text-text-muted uppercase mb-4 block">Your Note</label>
                        <p className="text-sm italic text-gray-400 break-words whitespace-pre-wrap">&quot;{requestContent || 'No special requests added.'}&quot;</p>
                     </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button onClick={prevStep} className="px-8 py-4 rounded-full border border-white/10 text-white">Edit info</button>
                  <button 
                    disabled={isSubmitting}
                    onClick={async () => {
                      try {
                        setIsSubmitting(true);
                        // 1. Create the match request on backend
                        const response = await createMatch({
                          foxerId: foxer.id,
                          style: selectedStyle || 'Own idea',
                          date: date,
                          guestCount: guests,
                          requestContent: requestContent,
                          totalAmount: foxer.basePrice * guests
                        });

                        if (response.clientSecret) {
                          // Known price — go straight to payment
                          useCheckoutStore.getState().setConfig({
                            venueId: foxer.id.toString(),
                            venueName: `${foxer.name} - ${selectedStyle || 'Own idea'}`,
                            venueImage: foxer.avatar,
                            checkInDate: date || null,
                            checkInTime: "09:00 PM",
                            nights: 1,
                            totalAmount: foxer.basePrice * guests,
                            guestCount: guests
                          });
                          useCheckoutStore.getState().setDraftIds(response.bookingId, response.bookingId);
                          useCheckoutStore.getState().setClientSecret(response.clientSecret);
                          toast.success('Match request created! Proceeding to payment...');
                          router.push('/checkout');
                        } else {
                          // Price TBD — match request sent, foxer will follow up
                          toast.success('Match request sent! The foxer will reach out with a custom quote.');
                          router.push('/');
                        }
                      } catch (error: any) {
                        toast.error(error.response?.data?.message || 'Failed to create match request');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="btn-neon px-12 py-4 rounded-full bg-accent text-black font-bold shadow-glow-accent disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating Request...' : foxer.basePrice > 0 ? 'Send Match Request & Pay' : 'Send Match Request'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default MatchConfig;
