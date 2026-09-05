/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";

export interface EventGalleryProps {
  eventName: string;
  images: string[];
  isPreview?: boolean;
}

export function EventGallery({
  eventName,
  images,
  isPreview = false,
}: EventGalleryProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const hasImages = images.length > 0;

  return (
    <>
      {/* Fullscreen Lightbox Modal */}
      {galleryOpen && hasImages && (
        <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-black/50">
            <h3 className="font-display font-bold text-white">{eventName}</h3>
            <button
              onClick={() => setGalleryOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full text-white cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 relative flex items-center justify-center p-4">
            <img
              src={images[activeImageIndex]}
              alt="Gallery Preview"
              className="max-h-[80vh] max-w-full object-contain shadow-2xl rounded-lg"
            />
            <button
              onClick={() =>
                setActiveImageIndex(
                  (activeImageIndex - 1 + images.length) % images.length,
                )
              }
              className="absolute left-4 p-4 rounded-full bg-black/50 hover:bg-white/20 text-white border border-white/10 cursor-pointer"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={() =>
                setActiveImageIndex((activeImageIndex + 1) % images.length)
              }
              className="absolute right-4 p-4 rounded-full bg-black/50 hover:bg-white/20 text-white border border-white/10 cursor-pointer"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid Layout */}
      {hasImages ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 grid-rows-2 gap-2 sm:gap-3 h-52 sm:h-80 md:h-125 rounded-2xl overflow-hidden mb-8 sm:mb-12 relative">
          <div
            className="col-span-2 row-span-2 cursor-pointer group"
            onClick={() => {
              setActiveImageIndex(0);
              setGalleryOpen(true);
            }}
          >
            <img
              src={images[0]}
              className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-500"
              alt="Main Event"
            />
          </div>
          {images.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              className="relative hidden sm:block cursor-pointer group"
              onClick={() => {
                setActiveImageIndex(idx + 1);
                setGalleryOpen(true);
              }}
            >
              <img
                src={img}
                className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-500"
                alt={`View ${idx + 1}`}
              />
              {idx === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    +{images.length - 5}
                  </span>
                </div>
              )}
            </div>
          ))}
          {images.length > 1 && (
            <button
              onClick={() => {
                setActiveImageIndex(0);
                setGalleryOpen(true);
              }}
              className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-white hover:text-black transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                grid_view
              </span>{" "}
              Show all photos
            </button>
          )}
        </div>
      ) : (
        <div className="h-65 md:h-90 rounded-2xl mb-12 bg-white/3 border border-white/5 flex flex-col items-center justify-center gap-3 text-white/20">
          <span className="material-symbols-outlined text-5xl">
            photo_library
          </span>
          <p className="text-sm font-medium">No gallery images yet</p>
          {isPreview && (
            <p className="text-xs text-white/15">
              Add photos in the Event Gallery section of the builder
            </p>
          )}
        </div>
      )}
    </>
  );
}
