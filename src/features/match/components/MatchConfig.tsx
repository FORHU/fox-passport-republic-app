'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useCheckoutStore } from '@/features/booking/store/useCheckoutStore';
import { createMatch } from '@/features/match/api/matches';
import { toast } from 'sonner';
import api from '@/shared/lib/axios';

interface Foxer {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  avatar: string;
  styles: string[];
  basePrice: number;
}

// Maps roleType array → display role label
function getRoleLabel(roleType: string[]): string {
  if (roleType.includes('foxerService')) return 'Talent Foxer';
  if (roleType.includes('foxerAsset')) return 'Gear Foxer';
  return 'Event Foxer';
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
  const [foxers, setFoxers] = useState<Foxer[]>([]);
  const [isLoadingFoxers, setIsLoadingFoxers] = useState(true);

  useEffect(() => {
    api.get('/users?roleType=foxerService,foxerAsset')
      .then(res => {
        const users: any[] = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        const mapped: Foxer[] = users.map(u => ({
          id: u.id,
          name: u.name || u.username || 'Foxer',
          role: getRoleLabel(u.roleType ?? []),
          rating: 5.0,
          reviews: 0,
          avatar: u.imgId || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'Foxer')}&background=ccff00&color=000`,
          styles: u.roleType?.includes('foxerService')
            ? ['Live Band', 'Team Building', 'Stargazing Night']
            : ['Sound System', 'Electronic Lighting', 'Event Power'],
          basePrice: 3500,
        }));
        setFoxers(mapped);
      })
      .catch(() => toast.error('Could not load foxers'))
      .finally(() => setIsLoadingFoxers(false));
  }, []);

  const foxer = foxers.find(f => f.id === foxerId) ?? foxers[0];

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
                  <p className="text-xl text-text-muted max-w-2xl mx-auto italic">
                    Select a <span className="text-white font-bold underline decoration-accent/50 underline-offset-4">Signature Experience</span>. These represent {foxer.name}&apos;s most successful past works.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {foxer.styles.map(style => (
                    <button 
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`p-6 rounded-[2.5rem] border transition-all duration-300 text-center flex flex-col items-center gap-4 group ${selectedStyle === style ? 'border-accent bg-accent/10 shadow-glow-accent' : 'border-white/5 bg-surface-highlight/30 hover:border-white/20'}`}
                    >
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${selectedStyle === style ? 'bg-accent text-black' : 'bg-white/5 text-accent'}`}>
                        <span className="material-symbols-outlined font-bold">award_star</span>
                      </div>
                      <div className="space-y-2">
                        <span className="font-bold text-lg block text-white">{style}</span>
                        <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block">Past Success</span>
                        <p className="text-xs text-text-muted leading-relaxed group-hover:text-white/80 transition-colors px-2">
                          {style === 'Boho Camping' && 'A 5-star rated transformation of pine forests into cozy, aesthetic retreats.'}
                          {style === 'Intimate Soirée' && 'Curated high-end social gatherings with meticulous attention to detail.'}
                          {style === 'Forest Fairy Tale' && 'Ethereal lighting and decor themes that went viral on the FoxVerse.'}
                          {style === 'Live Band' && 'Professional acoustic sets delivered for mountain-top expeditions.'}
                          {style === 'Sound System' && 'High-fidelity audio setups for remote wilderness environments.'}
                          {!['Boho Camping', 'Intimate Soirée', 'Forest Fairy Tale', 'Live Band', 'Sound System'].includes(style) && 'A signature format refined through multiple successful bookings.'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-8">
                  <button 
                    disabled={!selectedStyle}
                    onClick={nextStep}
                    className="btn-neon px-12 py-4 rounded-full bg-accent text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Continue
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

                  <div className="glass-card p-8 rounded-[2.5rem] bg-accent/5 border-accent/20">
                    <h3 className="text-xl font-bold mb-4 text-white">Why this works:</h3>
                    <ul className="space-y-4">
                      {[
                        'Verified safety protocols',
                        'Premium ' + selectedStyle + ' equipment',
                        'Expert guidance from ' + foxer.name
                      ].map(item => (
                        <li key={item} className="flex gap-3 text-sm text-white/80">
                          <span className="material-symbols-outlined text-accent text-[20px]">check_circle</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
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
                  <h2 className="text-4xl font-display font-bold text-white">Personalize it</h2>
                  <p className="text-text-muted">Tell {foxer.name} what would make this perfect for you.</p>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem]">
                  <textarea 
                    value={requestContent}
                    onChange={(e) => setRequestContent(e.target.value)}
                    placeholder="I'm planning a surprise for my friend's birthday and would love for this to be really special. We particularly like..."
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
                          <span className="text-text-muted">Vibe</span>
                          <span className="text-white font-bold">{selectedStyle}</span>
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
                        <div className="flex justify-between">
                          <span className="text-white font-bold">Estimated Cost</span>
                          <span className="text-2xl font-display font-bold text-accent">₱{(foxer.basePrice * guests).toLocaleString()}</span>
                        </div>
                     </div>
                     <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                        <label className="text-xs font-bold text-text-muted uppercase mb-4 block">Your Note</label>
                        <p className="text-sm italic text-gray-400">&quot;{requestContent || 'No special requests added.'}&quot;</p>
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
                          style: selectedStyle,
                          date: date,
                          guestCount: guests,
                          requestContent: requestContent,
                          totalAmount: foxer.basePrice * guests
                        });

                        // 2. Set checkout configuration for the match
                        useCheckoutStore.getState().setConfig({
                          venueId: foxer.id.toString(),
                          venueName: `${foxer.name} - ${selectedStyle}`,
                          venueImage: foxer.avatar,
                          checkInDate: date || null,
                          checkInTime: "09:00 PM",
                          nights: 1,
                          totalAmount: foxer.basePrice * guests,
                          guestCount: guests
                        });

                        // 3. Store draft IDs and client secret for checkout
                        useCheckoutStore.getState().setDraftIds(response.bookingId, response.bookingId);
                        useCheckoutStore.getState().setClientSecret(response.clientSecret);

                        toast.success('Match request created! Proceeding to payment...');
                        router.push('/checkout');
                      } catch (error: any) {
                        toast.error(error.response?.data?.message || 'Failed to create match request');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="btn-neon px-12 py-4 rounded-full bg-accent text-black font-bold shadow-glow-accent disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating Request...' : 'Send Match Request & Pay'}
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
