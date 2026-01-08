"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  Heart,
  LayoutGrid,
  Layers,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ChevronDown
} from "lucide-react";

// Types
interface Foxer {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  bio: string;
  tags: string[];
  avatar: string;
  status: 'online' | 'offline' | 'away';
  gallery: string[];
  verified: boolean;
}

enum ViewMode {
  GRID = 'Grid',
  SWIPE = 'Vibe Swipe'
}

// Hardcoded Foxers Data
const FOXERS_DATA: Foxer[] = [
  {
    id: '1',
    name: 'Jasmine L.',
    role: 'Event Stylist',
    rating: 4.9,
    reviews: 128,
    bio: 'I turn pine forests into fairy tales. Specializing in boho camping setups and intimate gatherings.',
    tags: ['Boho', 'Camping', 'Music'],
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    status: 'online',
    verified: true,
    gallery: [
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=400'
    ]
  },
  {
    id: '2',
    name: 'Marco D.',
    role: 'Adventure Guide',
    rating: 5.0,
    reviews: 84,
    bio: "Leading treks and organizing outdoor activities. Let's make your team building unforgettable.",
    tags: ['Trekking', 'TeamBuilding'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    status: 'online',
    verified: true,
    gallery: [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=400'
    ]
  },
  {
    id: '3',
    name: 'Sarah K.',
    role: 'Live Music & DJ',
    rating: 4.8,
    reviews: 56,
    bio: 'Acoustic vibes for sunset or electric beats for the after-party. I bring the sound system.',
    tags: ['LiveBand', 'DJ'],
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    status: 'offline',
    verified: true,
    gallery: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400'
    ]
  },
  {
    id: '4',
    name: 'Alex T.',
    role: 'Outdoor Chef',
    rating: 4.9,
    reviews: 203,
    bio: 'Gourmet meals under the stars. I provide the full catering experience for your camp.',
    tags: ['Foodie', 'Catering'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    status: 'online',
    verified: true,
    gallery: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400'
    ]
  },
  {
    id: '5',
    name: 'Elena R.',
    role: 'Yoga Instructor',
    rating: 5.0,
    reviews: 42,
    bio: 'Start your day with sunrise yoga sessions overlooking the mountains. Mats provided.',
    tags: ['Wellness', 'Yoga'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    status: 'away',
    verified: true,
    gallery: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&q=80&w=400'
    ]
  },
  {
    id: '6',
    name: 'Ben M.',
    role: 'Photographer',
    rating: 4.9,
    reviews: 195,
    bio: 'Capturing your best moments. I specialize in candid shots and drone photography.',
    tags: ['Photography', 'Drone'],
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    status: 'online',
    verified: true,
    gallery: [
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400'
    ]
  }
];

// Foxer Card Component
const FoxerCard: React.FC<{ foxer: Foxer }> = ({ foxer }) => {
  const statusColor = {
    online: 'bg-success',
    offline: 'bg-text-muted',
    away: 'bg-warning'
  }[foxer.status];

  return (
    <div className="group glass-card rounded-3xl p-6 card-hover-effect border border-white/5">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="relative size-16 shrink-0">
            <img
              className="size-full rounded-full object-cover ring-2 ring-primary/30"
              src={foxer.avatar}
              alt={foxer.name}
            />
            <div className={`absolute bottom-0 right-0 size-4 rounded-full border-4 border-surface ${statusColor} shadow-[0_0_10px_currentColor]`}></div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-xl font-display font-bold text-white group-hover:text-accent transition-colors">{foxer.name}</h3>
              {foxer.verified && (
                <span className="material-symbols-outlined text-accent fill-current text-[20px]">verified</span>
              )}
            </div>
            <p className="text-sm font-medium text-text-muted">{foxer.role}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            <span className="text-base font-bold text-white">{foxer.rating.toFixed(1)}</span>
            <span className="material-symbols-outlined text-accent fill-current text-[18px]">star</span>
          </div>
          <span className="text-xs text-text-muted">{foxer.reviews} reviews</span>
        </div>
      </div>

      <p className="text-sm text-text-muted line-clamp-2 leading-relaxed mb-5 h-10">
        {foxer.bio}
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {foxer.tags.map(tag => (
          <span key={tag} className="rounded-full bg-accent/10 border border-accent/30 px-3 py-1 text-xs font-bold text-accent">
            #{tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        {foxer.gallery.map((img, idx) => (
          <div
            key={idx}
            className="aspect-square rounded-xl bg-cover bg-center relative overflow-hidden group/img"
            style={{ backgroundImage: `url(${img})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
            {idx === 2 && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center hover:bg-black/50 transition-colors cursor-pointer">
                <span className="text-white text-xs font-bold">+24</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="flex-1 btn-neon rounded-full bg-accent py-3 text-sm font-bold text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:scale-105 transition-transform">
          Match Me
        </button>
        <button className="size-11 flex shrink-0 items-center justify-center rounded-full border border-white/10 text-text-muted hover:bg-secondary/20 hover:text-secondary hover:border-secondary/50 transition-all hover:scale-110">
          <Heart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Main Foxers Section Component
const FoxersSection: React.FC = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Featured Foxers</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Who's <span className="text-gradient">vibe</span> matches yours?
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Browse Certified Foxers available for your event. These pros bring expertise and energy to make your experience unforgettable.
          </p>
        </div>

        {/* Action Panel */}
        <div className="mb-8 space-y-6 reveal-on-scroll">
          {/* Current Venue/Location Card */}
          <div className="glass-panel flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-3xl p-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent">location_on</span>
                <p className="text-base font-bold text-white">Browse Foxers Nationwide</p>
              </div>
              <p className="text-sm text-text-muted pl-7">Find certified professionals in your area</p>
            </div>
            <button className="flex items-center justify-center rounded-full h-10 px-6 bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/10 transition-all">
              Filter Location
            </button>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-full border border-white/10 glass-panel px-4 py-2 text-sm font-bold text-white hover:border-accent/50 hover:text-accent transition-all">
                <LayoutGrid className="w-4 h-4" />
                Filters
              </button>
              {['Skills', 'Date', 'Price'].map(filter => (
                <button key={filter} className="flex items-center gap-2 rounded-full glass-panel border border-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all">
                  {filter}
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex h-11 items-center justify-center rounded-full glass-panel p-1 border border-white/10">
              <button
                onClick={() => setViewMode(ViewMode.GRID)}
                className={`flex items-center gap-2 rounded-full px-4 h-full text-sm font-bold transition-all ${viewMode === ViewMode.GRID ? 'bg-accent text-black shadow-glow-accent' : 'text-white/70 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode(ViewMode.SWIPE)}
                className={`flex items-center gap-2 rounded-full px-4 h-full text-sm font-bold transition-all ${viewMode === ViewMode.SWIPE ? 'bg-accent text-black shadow-glow-accent' : 'text-white/70 hover:text-white'}`}
              >
                <Layers className="w-4 h-4" />
                Vibe Swipe
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {viewMode === ViewMode.GRID ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FOXERS_DATA.map(foxer => (
              <FoxerCard key={foxer.id} foxer={foxer} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-[3rem] bg-white border-4 border-pink-500/50 overflow-hidden shadow-2xl group cursor-grab active:cursor-grabbing">
              <img
                src={FOXERS_DATA[0].avatar}
                className="w-full h-full object-cover absolute inset-0"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-3xl font-black text-white">{FOXERS_DATA[0].name}</h3>
                    <CheckCircle2 className="w-6 h-6 text-pink-500 fill-pink-500" />
                  </div>
                  <p className="text-pink-400 font-bold text-lg">{FOXERS_DATA[0].role}</p>
                </div>
                <div className="flex gap-4 mb-6">
                  <button className="size-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-red-400 border border-white/20 hover:scale-110 transition-transform">
                    <span className="text-4xl">×</span>
                  </button>
                  <button className="size-16 flex-1 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform">
                    <Heart className="w-8 h-8 fill-white" />
                  </button>
                </div>
              </div>
              <div className="absolute top-8 left-8 right-8 flex gap-2">
                <div className="h-1 flex-1 bg-white rounded-full"></div>
                <div className="h-1 flex-1 bg-white/20 rounded-full"></div>
                <div className="h-1 flex-1 bg-white/20 rounded-full"></div>
              </div>
            </div>
            <p className="mt-8 text-gray-500 text-sm">Swipe right to match, left to skip</p>
          </div>
        )}

        {/* Load More / View All */}
        <div className="flex justify-center mt-12 reveal-on-scroll">
          <button
            onClick={() => router.push('/foxers')}
            className="btn-neon inline-flex items-center gap-2 px-8 py-4 bg-accent text-black font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(204,255,0,0.3)]"
          >
            {viewMode === ViewMode.GRID ? 'Load More Foxers' : 'View All Foxers'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FoxersSection;
