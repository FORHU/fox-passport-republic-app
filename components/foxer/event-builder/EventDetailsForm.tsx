'use client';

import React from 'react';
import { EVENT_CATEGORIES } from '@/data/eventBuilderData';

interface EventDetailsFormProps {
  eventTitle: string;
  description: string;
  category: string;
  date: string;
  location: string;
  showGuide: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (desc: string) => void;
  onCategoryChange: (cat: string) => void;
  onDateChange: (date: string) => void;
  onLocationChange: (loc: string) => void;
  onCloseGuide: () => void;
}

export function EventDetailsForm({
  eventTitle,
  description,
  category,
  date,
  location,
  showGuide,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onDateChange,
  onLocationChange,
  onCloseGuide,
}: EventDetailsFormProps) {
  return (
    <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#0f111a] p-8">
      {/* Guide Banner */}
      {showGuide && (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-start gap-4 relative mb-8">
          <div className="h-6 w-6 rounded-full bg-accent text-black flex items-center justify-center font-bold shrink-0 text-xs">
            i
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-1">Welcome to the Studio</h4>
            <p className="text-xs text-text-muted">
              Fill out your <strong>Event Header</strong>. Upload at least{' '}
              <strong>5 images</strong>. Select the category.
            </p>
          </div>
          <button
            onClick={onCloseGuide}
            className="absolute top-2 right-2 text-white/30 hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      <div className="space-y-8">
        {/* Title */}
        <div>
          <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block text-justify">
            Event Title
          </label>
          <input
            type="text"
            value={eventTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter your event title..."
            className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm text-white placeholder-white/30 resize-none h-10 focus:border-accent/30 outline-none transition-colors"
          />
        </div>

        {/* Category - Moved below Title */}
        <div>
          <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block text-justify">
            Landing Page Category
          </label>
          <div className="relative max-w-md">
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:border-accent/30 outline-none"
            >
              <option value="" className="bg-[#0f111a] text-gray-500">
                Select Category...
              </option>
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0f111a]">
                  {cat}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Date & Location */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
              When
            </label>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-xl border border-white/5 focus-within:border-accent/30 transition-colors">
              <span className="material-symbols-outlined text-white/50 text-[18px]">
                calendar_today
              </span>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent border-none p-0 text-sm text-white placeholder-white/30 focus:ring-0 w-full [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
              Where
            </label>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-xl border border-white/5 focus-within:border-accent/30 transition-colors">
              <span className="material-symbols-outlined text-white/50 text-[18px]">
                location_on
              </span>
              <input
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="e.g. BGC, Taguig"
                className="bg-transparent border-none p-0 text-sm text-white placeholder-white/30 focus:ring-0 w-full"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe the vibe, the music, the crowd..."
            className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm text-white placeholder-white/30 resize-none h-40 focus:border-accent/30 outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
