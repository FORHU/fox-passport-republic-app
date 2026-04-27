'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';

const FOXERS_DATA = [
  {
    id: 1,
    name: 'Jasmine L.',
    role: 'Event Foxer',
    subRole: 'Producer & Stylist',
    rating: 4.9,
    reviews: 128,
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop',
    bio: 'I turn pine forests into fairy tales. Specializing in boho camping setups and intimate gatherings. My goal is to ensure your event flow is flawless and aesthetically unmatched.',
    specialties: ['Site Management', 'Floral Design', 'Lighting Moods'],
    provides: ['Decorations', 'Table Styling', 'Vendor Management'],
    activeEvents: [
      { id: 'E1', title: 'Whispering Pines Wedding', status: 'Live', date: 'Tonight' },
      { id: 'E2', title: 'Sunset Glamping Soirée', status: 'Setup', date: 'Tomorrow' }
    ],
    portfolio: [
      'https://images.unsplash.com/photo-1519222970733-f546218fa6d7?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    id: 2,
    name: 'Marco D.',
    role: 'Talent Foxer',
    subRole: 'Adventure Guide',
    rating: 5.0,
    reviews: 84,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    bio: 'Leading treks and organizing outdoor activities. I bring the energy and expertise to keep your group safe while pushing the boundaries of adventure.',
    specialties: ['Navigation', 'Survival Skills', 'Group Dynamics'],
    provides: ['Live Trekking', 'Team Building Workshops', 'Storytelling'],
    activeEvents: [
      { id: 'E3', title: 'Midnight Peak Expedition', status: 'Planning', date: 'May 10' }
    ],
    portfolio: [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523592121529-f6d1ebee57b1?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    id: 3,
    name: 'Sarah K.',
    role: 'Gear Foxer',
    subRole: 'Sound System & Lighting',
    rating: 4.8,
    reviews: 56,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    bio: 'Acoustic vibes for sunset or electric beats for the after-party. I provide high-end audio equipment and state-of-the-art lighting to transform any space.',
    specialties: ['Audio Engineering', 'Visual Projection', 'Stage Setup'],
    provides: ['L-Acoustics Sound', 'DMX Lighting', 'Generators'],
    activeEvents: [
      { id: 'E4', title: 'Neon Night Raver', status: 'Teardown', date: 'Just finished' },
      { id: 'E5', title: 'Corporate Gala Stage', status: 'Soundcheck', date: 'In 2h' }
    ],
    portfolio: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=400&auto=format&fit=crop'
    ]
  }
];

const ROLE_DESCRIPTIONS: Record<string, string> = {
  'Event Foxer': 'Manage and decorate events to ensure every experience ends flawlessly. Includes site selection, space design, and total service management.',
  'Talent Foxer': 'Contribute professional services: from live bands and DJs to expert catering, baristas, and specialized entertainers.',
  'Gear Foxer': 'Provide the essential infrastructure: high-end sound systems, lighting rigs, generators, and specialized event hardware.'
};

const FoxerProfile: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const foxer = FOXERS_DATA.find(f => f.id === Number(id)) || FOXERS_DATA[0];
  const roleDesc = ROLE_DESCRIPTIONS[foxer.role as keyof typeof ROLE_DESCRIPTIONS];

  return (
    <div className="min-h-screen bg-background bg-gradient-dark text-text-main selection:bg-accent selection:text-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-all text-sm font-bold">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Listings
        </Link>
      </header>

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Essential Info */}
            <div className="lg:col-span-4 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[3rem] p-8 text-center"
              >
                <div className="relative inline-block mb-6">
                  <div className="h-40 w-40 rounded-full border-4 border-accent shadow-glow-accent overflow-hidden">
                    <img src={foxer.avatar} alt={foxer.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-accent text-black rounded-full p-2 shadow-lg scale-110">
                    <span className="material-symbols-outlined font-bold text-[20px]">verified</span>
                  </div>
                </div>
                
                <h1 className="text-3xl font-display font-bold mb-2">{foxer.name}</h1>
                <p className="text-accent font-bold uppercase tracking-widest text-xs mb-3">{foxer.role}</p>
                <p className="text-[10px] leading-relaxed text-text-muted px-4 mb-6">
                  {roleDesc}
                </p>
                
                <div className="flex items-center justify-center gap-8 border-t border-white/5 pt-6">
                  <div>
                    <p className="text-xl font-display font-bold text-white">{foxer.rating}</p>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Rating</p>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div>
                    <p className="text-xl font-display font-bold text-white">{foxer.reviews}</p>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Reviews</p>
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
                  Inventory & Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {foxer.specialties.concat(foxer.provides).map(item => (
                    <span key={item} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/70 uppercase">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>

              <button 
                onClick={() => router.push(`/match/${foxer.id}`)}
                className="w-full btn-neon py-5 bg-accent text-black rounded-full font-bold text-lg shadow-glow-accent flex items-center justify-center gap-2 group"
              >
                Match with {foxer.name}
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">bolt</span>
              </button>
            </div>

            {/* Right Column: Deep Dive */}
            <div className="lg:col-span-8 space-y-12">
              <motion.section 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-display font-bold text-white">About the Pro</h2>
                <p className="text-lg text-text-muted leading-relaxed">
                  {foxer.bio}
                </p>
              </motion.section>

              <motion.section 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold text-white">Current Vibes</h2>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
                    <span className="text-[10px] text-success font-bold uppercase">Working Live</span>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {foxer.activeEvents.map(event => (
                    <div key={event.id} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/20 transition-all flex justify-between items-center group">
                      <div>
                        <h4 className="font-bold text-white group-hover:text-accent transition-colors">{event.title}</h4>
                        <p className="text-xs text-text-muted">{event.date}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-black/40 rounded-full text-accent border border-accent/20">
                        {event.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-display font-bold text-white">Recent Work</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {foxer.portfolio.map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-500 cursor-pointer border border-white/10 group">
                      <img src={img} alt="Portfolio" className="w-full h-full object-cover group-hover:brightness-110 transition-all" />
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default FoxerProfile;
