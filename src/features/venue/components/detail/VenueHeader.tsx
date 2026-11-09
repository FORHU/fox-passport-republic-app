"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { joinPlace } from "@/shared/lib/place";
import { LOGO_SRC } from "@/shared/lib/assets";
import { BackButton } from "@/shared/components/ui/BackButton";
import { useFavorites } from "@/shared/hooks/useFavorites";
import { toast } from "sonner";

interface VenueNavHeaderProps {
  title: string;
  /** The venue's id, used to save it to the viewer's wishlist. */
  venueId: string;
  onBack: () => void;
  onProposePartnership?: () => void;
  /** Shown instead of "Propose Partnership" when the viewer owns this venue. */
  onEdit?: () => void;
}

export function VenueNavHeader({
  title,
  venueId,
  onBack,
  onProposePartnership,
  onEdit,
}: VenueNavHeaderProps) {
  const { isFavorited, toggleFavorite, isToggling } = useFavorites();
  const saved = isFavorited(venueId);

  // The native share sheet where the browser has one; otherwise copy the
  // link, so the click always does something visible.
  const handleShare = async () => {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link. Copy it manually: " + url);
    }
  };

  // useFavorites toasts on failure and for guests; say what happened on
  // success too. Saved state flips optimistically, so read it before the click.
  const handleSave = () => {
    const message = saved ? "Removed from wishlist" : "Saved to wishlist";
    toggleFavorite(venueId, { onSuccess: () => toast.success(message) });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 h-14 sm:h-20 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 h-full flex items-center justify-between">
        <BackButton variant="label" hideLabelOnMobile onClick={onBack} />
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 group cursor-pointer"
        >
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
            <Image
              src={LOGO_SRC}
              alt="FoxPassport Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-lg sm:text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">
            FoxPassport
          </h2>
        </Link>
        <div className="flex items-center gap-4">
          {onEdit ? (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-black hover:brightness-110 transition-all text-sm font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                edit
              </span>{" "}
              <span className="hidden sm:inline">Edit Venue</span>
            </button>
          ) : (
            onProposePartnership && (
              <button
                onClick={onProposePartnership}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-accent/10 hover:border-accent/30 transition-colors text-sm font-medium text-white hover:text-accent cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  handshake
                </span>{" "}
                Propose Partnership
              </button>
            )
          )}
          <button
            type="button"
            onClick={handleShare}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium text-white cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              aria-hidden="true"
            >
              share
            </span>{" "}
            Share
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isToggling}
            aria-pressed={saved}
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border transition-colors text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-wait ${
              saved
                ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "border-white/10 text-white hover:bg-white/5"
            }`}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              aria-hidden="true"
              style={saved ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {saved ? "favorite" : "favorite_border"}
            </span>{" "}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </header>
  );
}

interface VenueHeroProps {
  title: string;
  rating: number | null;
  /** Review count; `undefined` while it loads (no rating shown), 0 shows "New". */
  reviews?: number;
  location: string;
  province: string;
}

export function VenueHero({
  title,
  rating,
  reviews,
  location,
  province,
}: VenueHeroProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
        {title}
      </h1>
      <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
        {reviews !== undefined &&
          (reviews > 0 ? (
            <div className="flex items-center gap-1 font-bold text-white">
              <span className="material-symbols-outlined text-[18px] fill-current text-white">
                star
              </span>
              {rating ?? 0}
              <span className="text-text-muted font-normal underline decoration-dotted cursor-pointer ml-1">
                {reviews} {reviews === 1 ? "review" : "reviews"}
              </span>
            </div>
          ) : (
            <span className="font-bold text-white">New</span>
          ))}
        {reviews !== undefined && <span>·</span>}
        <span className="flex items-center gap-1 text-white underline decoration-dotted cursor-pointer">
          {joinPlace(location, province)}
        </span>
      </div>
    </div>
  );
}

interface VenueGalleryGridProps {
  images: string[];
  onOpenGallery: (index: number) => void;
}

// Cell spans in the 4×2 grid by photo count, so fewer than five photos still
// fill it: the first is the main photo, the rest share the right half.
const GALLERY_SPANS: Record<number, string[]> = {
  1: ["col-span-4 row-span-2"],
  2: ["col-span-2 row-span-2", "col-span-2 row-span-2"],
  3: ["col-span-2 row-span-2", "col-span-2", "col-span-2"],
  4: ["col-span-2 row-span-2", "col-span-2", "", ""],
  5: ["col-span-2 row-span-2", "", "", "", ""],
};

export function VenueGalleryGrid({
  images,
  onOpenGallery,
}: VenueGalleryGridProps) {
  const displayImages =
    images.length > 0
      ? images
      : [
          "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
        ];
  const gridImages = displayImages.slice(0, 5);
  const spans = GALLERY_SPANS[gridImages.length];

  return (
    <div className="relative mb-8 sm:mb-12">
      {/* Mobile Single Hero (hidden on md+) */}
      <div
        className="block md:hidden relative h-[260px] sm:h-[320px] rounded-2xl overflow-hidden cursor-pointer group"
        onClick={() => onOpenGallery(0)}
      >
        <img
          src={displayImages[0]}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt="Venue Main"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenGallery(0);
          }}
          className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">
            grid_view
          </span>
          {displayImages.length} Photos
        </button>
      </div>

      {/* Tablet & Desktop Bento Grid (hidden on <md) */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[380px] lg:h-[480px] rounded-3xl overflow-hidden relative">
        {gridImages.map((img, idx) => (
          <div
            key={idx}
            data-testid="gallery-cell"
            className={`${spans[idx]} relative cursor-pointer group overflow-hidden`}
            onClick={() => onOpenGallery(idx)}
          >
            <img
              src={img}
              className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-110 transition-all duration-500"
              alt={idx === 0 ? "Main" : `View ${idx}`}
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
        ))}
        <button
          onClick={() => onOpenGallery(0)}
          className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md border border-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-2xl hover:bg-white hover:text-black transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">
            grid_view
          </span>
          Show all photos
        </button>
      </div>
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
