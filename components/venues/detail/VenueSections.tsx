'use client';

import React from 'react';
import { DEFAULT_INCLUSIONS } from '@/data/venueDetailData';

interface CuratorSectionProps {
  host: {
    name: string;
    avatar: string;
    rating: number;
    description: string;
  };
}

export function CuratorSection({ host }: CuratorSectionProps) {
  return (
    <div className="bg-surface-highlight/30 border border-white/5 rounded-3xl p-6 mb-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
      <div className="flex items-start gap-4 relative z-10">
        <div className="relative shrink-0">
          <img
            src={host.avatar}
            className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
            alt={host.name}
          />
          <div className="absolute -bottom-1 -right-1 bg-accent text-black rounded-full p-1 border-4 border-[#0f111a] flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[14px]">verified</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-display font-bold text-white text-lg">Curated by {host.name}</h3>
              <p className="text-accent text-xs font-bold uppercase tracking-wider mb-2">
                Visual Director
              </p>
            </div>
            <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-black/40 px-2 py-1 rounded-lg">
              <span className="material-symbols-outlined text-[14px] fill-current">star</span>{' '}
              {host.rating}
            </div>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">"{host.description}"</p>
        </div>
      </div>
    </div>
  );
}

export function HighlightsSection() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-start">
        <span className="material-symbols-outlined text-white text-2xl mt-1">verified</span>
        <div>
          <h3 className="font-bold text-white text-base">Certified Foxer</h3>
          <p className="text-sm text-text-muted">
            Experienced host with verified identity and skills.
          </p>
        </div>
      </div>
      <div className="flex gap-4 items-start">
        <span className="material-symbols-outlined text-white text-2xl mt-1">location_on</span>
        <div>
          <h3 className="font-bold text-white text-base">Great Location</h3>
          <p className="text-sm text-text-muted">
            95% of recent guests gave the location a 5-star rating.
          </p>
        </div>
      </div>
      <div className="flex gap-4 items-start">
        <span className="material-symbols-outlined text-white text-2xl mt-1">calendar_today</span>
        <div>
          <h3 className="font-bold text-white text-base">Free cancellation for 48 hours</h3>
          <p className="text-sm text-text-muted">Get a full refund if you change your mind.</p>
        </div>
      </div>
    </div>
  );
}

interface DescriptionSectionProps {
  description: string;
}

export function DescriptionSection({ description }: DescriptionSectionProps) {
  return (
    <div>
      <h3 className="text-2xl font-display font-bold text-white mb-4">About this experience</h3>
      <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line mb-4">
        {description}
      </p>
      <button className="text-white font-bold underline decoration-accent underline-offset-4 flex items-center gap-1 hover:text-accent transition-colors">
        Show more <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </div>
  );
}

interface InclusionsSectionProps {
  onOpenCustomBuilder: () => void;
}

export function InclusionsSection({ onOpenCustomBuilder }: InclusionsSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-display font-bold text-white">Included in this Build</h3>
        <button
          onClick={onOpenCustomBuilder}
          className="text-xs font-bold text-accent hover:text-white transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span> Customize
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DEFAULT_INCLUSIONS.map((svc, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
          >
            <div className="h-10 w-10 rounded-xl bg-surface-highlight flex items-center justify-center text-white/80 shrink-0">
              <span className="material-symbols-outlined">{svc.icon}</span>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{svc.name}</h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{svc.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3 items-start">
        <span className="material-symbols-outlined text-accent shrink-0">info</span>
        <div>
          <p className="text-sm text-white font-bold mb-1">Not your vibe?</p>
          <p className="text-xs text-text-muted">
            You can swap the curator, upgrade the sound, or add crazy extras like a ramen bar in the
            <button
              onClick={onOpenCustomBuilder}
              className="text-white font-bold underline decoration-accent decoration-2 underline-offset-2 ml-1 hover:text-accent transition-colors"
            >
              Experience Builder
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

interface AmenitiesSectionProps {
  offers: string[];
}

export function AmenitiesSection({ offers }: AmenitiesSectionProps) {
  const getIcon = (offer: string) => {
    if (offer.includes('Wifi')) return 'wifi';
    if (offer.includes('Parking')) return 'local_parking';
    if (offer.includes('Kitchen')) return 'kitchen';
    if (offer.includes('Air')) return 'ac_unit';
    if (offer.includes('Pool')) return 'pool';
    return 'check_circle';
  };

  return (
    <div>
      <h3 className="text-2xl font-display font-bold text-white mb-6">What this place offers</h3>
      <div className="grid grid-cols-2 gap-4">
        {offers.map((offer, i) => (
          <div key={i} className="flex items-center gap-3 text-gray-300">
            <span className="material-symbols-outlined text-[24px] text-white/70">
              {getIcon(offer)}
            </span>
            {offer}
          </div>
        ))}
      </div>
      <button className="mt-8 px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors">
        Show all 15 amenities
      </button>
    </div>
  );
}
