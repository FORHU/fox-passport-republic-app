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
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-orange-400'
  }[foxer.status];

  return (
    <div className="group relative flex flex-col gap-5 rounded-3xl border border-gray-200 bg-white p-6 transition-all hover:border-pink-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative size-16 shrink-0">
            <img
              className="size-full rounded-full object-cover ring-2 ring-gray-100"
              src={foxer.avatar}
              alt={foxer.name}
            />
            <div className={`absolute bottom-0 right-0 size-4 rounded-full border-4 border-white ${statusColor}`}></div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-500 transition-colors">{foxer.name}</h3>
              {foxer.verified && (
                <CheckCircle2 className="w-5 h-5 text-pink-500 fill-pink-500" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-600">{foxer.role}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            <span className="text-base font-bold text-gray-900">{foxer.rating.toFixed(1)}</span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
          <span className="text-xs text-gray-500">{foxer.reviews} reviews</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed h-10">
        {foxer.bio}
      </p>

      <div className="flex flex-wrap gap-2">
        {foxer.tags.map(tag => (
          <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            #{tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {foxer.gallery.map((img, idx) => (
          <div
            key={idx}
            className="aspect-square rounded-xl bg-cover bg-center relative overflow-hidden"
            style={{ backgroundImage: `url(${img})` }}
          >
            {idx === 2 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-xs font-bold">+24</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-2 flex gap-3">
        <button className="flex-1 rounded-full bg-pink-500 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-pink-600 active:scale-95">
          Match Me
        </button>
        <button className="size-11 flex shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-300 transition-all active:scale-90">
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
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Who&apos;s vibe matches yours?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Browse Certified Foxers available for your event. These pros bring expertise and energy to make your experience unforgettable.
          </p>
        </div>

        {/* Action Panel */}
        <div className="mb-8 space-y-6">
          {/* Current Venue/Location Card */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pink-500" />
                <p className="text-base font-bold text-gray-900">Browse Foxers Nationwide</p>
              </div>
              <p className="text-sm text-gray-600 pl-7">Find certified professionals in your area</p>
            </div>
            <button className="flex items-center justify-center rounded-full h-10 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors">
              Filter Location
            </button>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-pink-500 hover:text-pink-500 transition-all">
                <LayoutGrid className="w-4 h-4" />
                Filters
              </button>
              {['Skills', 'Date', 'Price'].map(filter => (
                <button key={filter} className="flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  {filter}
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex h-11 items-center justify-center rounded-full bg-gray-100 p-1 border border-gray-200">
              <button
                onClick={() => setViewMode(ViewMode.GRID)}
                className={`flex items-center gap-2 rounded-full px-4 h-full text-sm font-bold transition-all ${viewMode === ViewMode.GRID ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <LayoutGrid className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode(ViewMode.SWIPE)}
                className={`flex items-center gap-2 rounded-full px-4 h-full text-sm font-bold transition-all ${viewMode === ViewMode.SWIPE ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-600 hover:text-gray-900'}`}
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
        <div className="flex justify-center mt-12">
          <button
            onClick={() => router.push('/foxers')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition-colors shadow-lg hover:shadow-xl"
          >
            {viewMode === ViewMode.GRID ? 'Load More Foxers' : 'View All Foxers'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FoxersSection;
