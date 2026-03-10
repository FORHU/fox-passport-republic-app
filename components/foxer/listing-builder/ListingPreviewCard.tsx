'use client';

import React, { useRef } from 'react';
import { ListingType } from '@/data/listingBuilderData';

interface ListingPreviewCardProps {
  activeType: ListingType;
  title: string;
  description: string;
  price: number;
  unit: string;
  status: string;
  image: string;
  displayCategory: string;
  showGuide: boolean;
  onCloseGuide: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (desc: string) => void;
  onImageUpload: (url: string) => void;
}  


export function ListingPreviewCard({
  activeType,
  title,
  description,
  price,
  unit,
  status,
  image,
  displayCategory,
  showGuide,
  onCloseGuide,
  onTitleChange,
  onDescriptionChange,
  onImageUpload,
}: ListingPreviewCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // limit to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert("Image too large (max 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-8 bg-[#02040a] flex flex-col items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="w-full max-w-2xl space-y-8">
        {/* Guide */}
        {showGuide && (
          <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-start gap-4 relative">
            <div className="h-6 w-6 rounded-full bg-accent text-black flex items-center justify-center font-bold shrink-0 text-xs">
              i
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Listing Details</h4>
              <p className="text-xs text-text-muted">
                A clear title and description help find exactly what they need.
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

        {/* Title & Description Inputs */}
        <div className="space-y-6 w-full">
          <div className="text-center">
            <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-2 block">
              {activeType === 'inventory' ? 'Item Title' : 'Service Title'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={activeType === 'inventory' ? 'e.g. Pioneer CDJ-3000' : 'e.g. Event Photography'}
              className="w-full bg-transparent border-none p-0 text-center text-4xl md:text-5xl font-display font-bold text-white placeholder-white/50 focus:ring-0"
            />
          </div>
          <div className="text-center">
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe your item or service..."
              className="w-full bg-transparent border-none p-0 text-center text-lg text-text-muted placeholder-white/50 focus:ring-0 resize-none h-24"
            />
          </div>
        </div>

        {/* Preview Card */}
        <div className="relative group w-[320px] mx-auto perspective-1000">
          {image && (
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[2.2rem] blur opacity-25 group-hover:opacity-50 transition duration-500" />
          )}
          <div className="relative bg-[#161b26] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
            {/* Image Area */}
            <div
              className={`relative aspect-square overflow-hidden bg-black/50 group/img ${
                !image ? 'flex items-center justify-center border-b border-white/5' : ''
              }`}
            >
              {image ? (
                <>
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold hover:bg-white hover:text-black"
                    >
                      Change
                    </button>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                        status === 'available' || status === 'active'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-white/10 text-white/60 border-white/20'
                      } uppercase tracking-wider backdrop-blur-md`}
                    >
                      {status}
                    </span>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 text-white/30 hover:text-white transition-all group/upload w-full h-full hover:bg-white/5"
                >
                  <div className="h-16 w-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center group-hover/upload:border-accent group-hover/upload:text-accent">
                    <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Add Listing Photo</span>
                </button>
              )}
            </div>

            {/* Card Content */}
            <div className={`p-5 transition-opacity duration-300 ${!image ? 'opacity-50 grayscale' : 'opacity-100'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Untitled"
                    className="w-full bg-transparent border-none px-2 py-1 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-accent placeholder-white/50"
                  />
                </div>
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center ${
                    activeType === 'inventory' ? 'bg-primary/20 text-primary' : 'bg-warning/20 text-warning'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {activeType === 'inventory' ? 'inventory_2' : 'design_services'}
                  </span>
                </div>
              </div>
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="No description provided."
                className="w-full bg-transparent border-none p-0 text-xs text-text-muted placeholder-white/50 focus:ring-0 resize-none h-12"
              />
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">{unit}</p>
                  <p className="text-lg font-mono font-bold text-white">₱{price.toLocaleString()}</p>
                </div>
                <span className="text-xs font-bold text-white/50 bg-white/5 px-2 py-1 rounded capitalize">
                  {displayCategory}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
