import React, { useState } from "react";
import Link from "next/link";

export interface PropertyData {
  id: string;
  name: string;
  images: string[];
  rating: number;
  reviewCount?: number;
  category: string;
  location: string;
  details: string;
  dates?: string;
  price?: string;
  priceLabel?: string;
  isGuestFavorite?: boolean;
}

interface PropertyCardProps {
  data: PropertyData;
  variant?: 'vertical' | 'horizontal';
}

export default function PropertyCard({ data, variant = 'vertical' }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = data.images.length > 0 ? data.images : ["/placeholder.jpg"];
  const showNavigation = images.length > 1 && isHovered;

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Horizontal variant keeps original layout
  if (variant === 'horizontal') {
    return (
      <Link 
        href={`/venues/${data.id}`} 
        className="flex flex-row h-full group cursor-pointer bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* IMAGE SECTION */}
        <div className="relative w-[55%] h-full overflow-hidden bg-gray-200">
          {images.map((img, index) => (
            <img 
              key={index}
              src={img} 
              alt={`${data.name} ${index + 1}`} 
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          
          {showNavigation && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover:scale-105 z-10"
              >
                <svg className="w-3 h-3 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover:scale-105 z-10"
              >
                <svg className="w-3 h-3 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.slice(0, 5).map((_, index) => (
                <div 
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white w-2' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
          
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 transition-transform z-10 group/heart"
          >
            <svg viewBox="0 0 32 32" className="w-6 h-6 fill-black/30 stroke-white stroke-2 group-hover/heart:fill-pink-500 group-hover/heart:stroke-pink-500 transition-colors drop-shadow-md">
              <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path>
            </svg>
          </button>

          {data.isGuestFavorite && (
            <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 z-10 backdrop-blur-sm">
              <span className="text-xs font-bold text-gray-900">Guest favorite</span>
            </div>
          )}
        </div>

        {/* INFO SECTION - Original horizontal layout */}
        <div className="flex-1 flex flex-col justify-center p-5 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-semibold text-gray-700 leading-tight text-lg">
              {data.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <svg className="w-3.5 h-3.5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium text-gray-900 text-sm">
                {data.rating.toFixed(1)}
                {data.reviewCount && data.reviewCount > 0 && (
                  <span className="text-gray-500 font-normal"> ({data.reviewCount})</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <p className="text-gray-500 text-sm">{data.details}</p>
            <p className="text-gray-500 text-sm">
              {data.category} · {data.location}
            </p>
            {data.dates && <p className="text-gray-500 text-sm">{data.dates}</p>}
          </div>

          {data.price && (
            <div className="mt-4">
              <p className="text-gray-900 text-sm">
                <span className="font-semibold">{data.price}</span>
                {data.priceLabel && <span className="text-gray-500"> {data.priceLabel}</span>}
              </p>
            </div>
          )}
        </div>
      </Link>
    );
  }

  // VERTICAL VARIANT - Image fills card, info overlay inside
  return (
    <Link 
      href={`/venues/${data.id}`} 
      className="relative w-full h-full min-h-[300px] group cursor-pointer rounded-2xl overflow-hidden block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE - Fills entire card */}
      <div className="absolute inset-0 bg-gray-200 rounded-2xl overflow-hidden">
        {images.map((img, index) => (
          <img 
            key={index}
            src={img} 
            alt={`${data.name} ${index + 1}`} 
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>
      
      {/* Navigation Arrows */}
      {showNavigation && (
        <>
          <button 
            onClick={prevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover:scale-105 z-10"
          >
            <svg className="w-3 h-3 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={nextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover:scale-105 z-10"
          >
            <svg className="w-3 h-3 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Image Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-[140px] left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.slice(0, 5).map((_, index) => (
            <div 
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white w-2' : 'bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
      
      {/* Heart Icon */}
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 transition-transform z-10 group/heart"
      >
        <svg viewBox="0 0 32 32" className="w-6 h-6 fill-black/30 stroke-white stroke-2 group-hover/heart:fill-pink-500 group-hover/heart:stroke-pink-500 transition-colors drop-shadow-md">
          <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path>
        </svg>
      </button>

      {/* Guest Favorite Badge */}
      {data.isGuestFavorite && (
        <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 z-10 backdrop-blur-sm">
          <span className="text-xs font-bold text-gray-900">Guest favorite</span>
        </div>
      )}

      {/* INFO OVERLAY - Inside image at bottom */}
      <div className="absolute bottom-3 left-3 right-3 z-10">
        <div className="bg-pink-50/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-pink-200/50">
          {/* Title and Rating Row */}
          <div className="flex justify-between items-start gap-2 mb-0.5">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
              {data.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium text-gray-900 text-xs">
                {data.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Details */}
          <p className="text-gray-600 text-xs line-clamp-1">{data.details}</p>
          
          {/* Category and Location */}
          <p className="text-gray-500 text-xs line-clamp-1">
            {data.category} · {data.location}
          </p>
          
          {/* Dates */}
          {data.dates && <p className="text-gray-500 text-xs">{data.dates}</p>}

          {/* Price */}
          {data.price && (
            <p className="text-gray-900 text-sm mt-1">
              <span className="font-bold">{data.price}</span>
              {data.priceLabel && <span className="text-gray-500 text-xs"> {data.priceLabel}</span>}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}