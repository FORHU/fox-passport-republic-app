'use client';

import React from 'react';
import { GalleryItem } from '@/data/eventBuilderData';

interface EventGalleryProps {
  gallery: GalleryItem[];
  onAddImage: () => void;
  onRemoveImage: (id: string) => void;
}

export function EventGallery({ gallery, onAddImage, onRemoveImage }: EventGalleryProps) {
  return (
    <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-[#0f111a] p-8">
      <div className="flex justify-between items-end mb-3">
        <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
          Event Gallery (Min 5)
        </label>
        <span
          className={`text-[10px] font-bold ${
            gallery.length < 5 ? 'text-red-400' : 'text-green-400'
          }`}
        >
          {gallery.length}/5
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 h-[240px]">
        {/* Cover Image (Large) */}
        <div
          className={`col-span-2 row-span-2 h-full relative group rounded-xl overflow-hidden border border-white/10 ${
            gallery.length === 0 ? 'border-dashed' : ''
          }`}
        >
          {gallery.length > 0 ? (
            <>
              <img
                src={gallery[0].url}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt=""
              />
              <div className="absolute top-3 left-3 bg-accent text-black text-[10px] font-bold px-2 py-1 rounded z-10">
                Cover
              </div>
              <button
                onClick={() => onRemoveImage(gallery[0].id)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 z-20"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </>
          ) : (
            <button
              onClick={onAddImage}
              className="w-full h-full flex flex-col items-center justify-center text-white/30 hover:text-white hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-4xl mb-2">add_a_photo</span>
              <span className="text-xs font-bold uppercase tracking-widest">Add Cover</span>
            </button>
          )}
        </div>

        {/* Additional Images */}
        <div className="col-span-2 row-span-2 grid grid-cols-2 gap-3">
          {gallery.slice(1).map((img) => (
            <div
              key={img.id}
              className="relative group rounded-xl overflow-hidden border border-white/10 h-full"
            >
              <img src={img.url} className="w-full h-full object-cover" alt="" />
              <button
                onClick={() => onRemoveImage(img.id)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 z-20"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ))}
          {gallery.length > 0 && gallery.length < 5 && (
            <button
              onClick={onAddImage}
              className="border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/20 hover:text-white hover:bg-white/5 h-full"
            >
              <span className="material-symbols-outlined text-2xl mb-1">add_photo_alternate</span>
              <span className="text-[9px] font-bold uppercase">Add Photo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
