'use client';

import React from 'react';
import { EVENT_CATEGORIES } from '@/features/event/data/eventBuilderData';
import CancellationPolicyPicker from '@/features/cancellation-policy/components/CancellationPolicyPicker';
import { MapboxLocationInput, MapboxContextItem } from '@/shared/components/ui/MapboxLocationInput';
import DateTimePicker from './DateTimePicker';

interface EventDetailsFormProps {
  eventTitle: string;
  description: string;
  category: string;
  date: string;
  location: string;
  maxAttendees: number;
  showGuide: boolean;
  cancellationPolicyId: string | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (desc: string) => void;
  onCategoryChange: (cat: string) => void;
  onDateChange: (date: string) => void;
  onLocationChange: (loc: string) => void;
  onTargetCityChange?: (city: string) => void;
  onTargetStateChange?: (state: string) => void;
  onTargetCountryChange?: (country: string) => void;
  onLatLngChange?: (lat: number, lng: number) => void;
  onMaxAttendeesChange: (count: number) => void;
  onCancellationPolicyChange: (policyId: string | null) => void;
  onCloseGuide: () => void;
}

export function EventDetailsForm({
  eventTitle,
  description,
  category,
  date,
  location,
  maxAttendees,
  showGuide,
  cancellationPolicyId,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onDateChange,
  onLocationChange,
  onTargetCityChange,
  onTargetStateChange,
  onTargetCountryChange,
  onLatLngChange,
  onMaxAttendeesChange,
  onCancellationPolicyChange,
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
            <DateTimePicker value={date} onChange={onDateChange} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
              Where
            </label>
            <MapboxLocationInput
              value={location}
              onChange={onLocationChange}
              type="place"
              placeholder="e.g. BGC, Taguig"
              onSelect={(val: string, context?: MapboxContextItem[], center?: [number, number]) => {
                onLocationChange(val);
                if (onTargetCityChange) onTargetCityChange(val);
                const region = context?.find((c) => c.id.startsWith('region'))?.text;
                const countryName = context?.find((c) => c.id.startsWith('country'))?.text;
                if (region && onTargetStateChange) onTargetStateChange(region);
                if (countryName && onTargetCountryChange) onTargetCountryChange(countryName);
                if (center && onLatLngChange) onLatLngChange(center[1], center[0]);
              }}
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
              Max Attendees
            </label>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-xl border border-white/5 focus-within:border-accent/30 transition-colors">
              <span className="material-symbols-outlined text-white/50 text-[18px]">
                groups
              </span>
              <input
                type="number"
                value={maxAttendees}
                onChange={(e) => onMaxAttendeesChange(parseInt(e.target.value) || 0)}
                placeholder="100"
                min="1"
                className="bg-transparent border-none p-0 text-sm text-white placeholder-white/30 focus:ring-0 w-full"
              />
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="max-w-xs">
          <CancellationPolicyPicker
            value={cancellationPolicyId}
            onChange={onCancellationPolicyChange}
          />
        </div>

        {/* Description */}
        <div>
          {(() => {
            const wordCount = description.trim() === '' ? 0 : description.trim().split(/\s+/).length;
            const tooShort = wordCount < 100;
            const atLimit = wordCount >= 500;
            const borderColor = atLimit ? 'border-red-500/60' : tooShort && wordCount > 0 ? 'border-yellow-500/40' : 'border-white/5';
            const countColor = atLimit ? 'text-red-400' : wordCount >= 450 ? 'text-yellow-400' : wordCount >= 100 ? 'text-accent' : 'text-white/30';

            const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
              const val = e.target.value;
              const words = val.trim() === '' ? [] : val.trim().split(/\s+/);
              if (words.length > 500) return;
              onDescriptionChange(val);
            };

            return (
              <>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                    Description
                  </label>
                  <span className={`text-[10px] font-bold tabular-nums ${countColor}`}>
                    {wordCount} / 500 words {tooShort && wordCount > 0 ? `· ${100 - wordCount} more to go` : ''}
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={handleChange}
                  placeholder="Describe the vibe, the music, the crowd... (100–500 words)"
                  className={`w-full bg-white/5 border ${borderColor} rounded-xl p-4 text-sm text-white placeholder-white/30 resize-none h-52 focus:border-accent/30 outline-none transition-colors`}
                />
                {tooShort && wordCount > 0 && (
                  <p className="mt-1.5 text-[10px] text-yellow-400/80">Minimum 100 words required to publish.</p>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
