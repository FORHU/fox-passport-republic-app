'use client';

import React from 'react';
import Link from 'next/navigation';

interface VenueNavHeaderProps {
  title: string;
  onBack: () => void;
}

export function VenueNavHeader({ title, onBack }: VenueNavHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 h-20 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 h-full flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:rotate-180 transition-transform duration-700">
            <span className="material-symbols-outlined text-[24px]">explore</span>
          </div>
          <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">
            FoxPassport
          </h2>
        </a>
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium text-white">
            <span className="material-symbols-outlined text-[18px]">share</span> Share
          </button>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium text-white">
            <span className="material-symbols-outlined text-[18px]">favorite_border</span> Save
          </button>
          <button
            onClick={onBack}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white hover:text-black transition-all text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    </header>
  );
}

interface VenueHeroProps {
  title: string;
  rating: number;
  reviews: number;
  location: string;
  province: string;
}

export function VenueHero({ title, rating, reviews, location, province }: VenueHeroProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">{title}</h1>
      <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
        <div className="flex items-center gap-1 font-bold text-white">
          <span className="material-symbols-outlined text-[18px] fill-current text-white">star</span>
          {rating}
          <span className="text-text-muted font-normal underline decoration-dotted cursor-pointer ml-1">
            {reviews} reviews
          </span>
        </div>
        <span>·</span>
        <span className="flex items-center gap-1 text-white underline decoration-dotted cursor-pointer">
          {location}, {province}
        </span>
      </div>
    </div>
  );
}

interface VenueGalleryGridProps {
  images: string[];
  onOpenGallery: (index: number) => void;
}

export function VenueGalleryGrid({ images, onOpenGallery }: VenueGalleryGridProps) {
  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[350px] md:h-[500px] rounded-2xl overflow-hidden mb-12 relative">
      <div
        className="col-span-2 row-span-2 relative cursor-pointer group"
        onClick={() => onOpenGallery(0)}
      >
        <img
          src={images[0]}
          className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-500"
          alt="Main"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
      </div>
      {images.slice(1, 5).map((img, idx) => (
        <div
          key={idx}
          className="relative cursor-pointer group"
          onClick={() => onOpenGallery(idx + 1)}
        >
          <img
            src={img}
            className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-500"
            alt={`View ${idx}`}
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>
      ))}
      <button
        onClick={() => onOpenGallery(0)}
        className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-white hover:text-black transition-all flex items-center gap-2 shadow-lg"
      >
        <span className="material-symbols-outlined text-[18px]">grid_view</span>
        Show all photos
      </button>
    </div>
  );
}

interface LightboxGalleryProps {
  isOpen: boolean;
  images: string[];
  title: string;
  activeIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function LightboxGallery({
  isOpen,
  images,
  title,
  activeIndex,
  onClose,
  onNext,
  onPrev,
}: LightboxGalleryProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-black/50">
        <h3 className="font-display font-bold text-white">{title}</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-white">close</span>
        </button>
      </div>
      <div className="flex-1 relative flex items-center justify-center p-4">
        <img
          src={images[activeIndex]}
          alt="Gallery"
          className="max-h-[80vh] max-w-full object-contain shadow-2xl rounded-lg"
        />
        <button
          onClick={onPrev}
          className="absolute left-4 p-4 rounded-full bg-black/50 hover:bg-white/20 text-white border border-white/10 transition-all"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button
          onClick={onNext}
          className="absolute right-4 p-4 rounded-full bg-black/50 hover:bg-white/20 text-white border border-white/10 transition-all"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
