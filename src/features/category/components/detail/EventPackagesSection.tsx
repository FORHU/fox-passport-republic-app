"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Heart } from "lucide-react";
import { checkFavorite, addFavorite, removeFavoriteByListing } from "@/features/user/api/favorites";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { toast } from "sonner";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&auto=format&fit=crop",
];

function FavoriteHeart({ templateId }: { templateId: string }) {
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkFavorite(templateId, "event")
      .then(r => setLiked(r.isFavorited))
      .catch(() => {});
  }, [templateId, user]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Sign in to save favorites."); return; }
    if (loading) return;
    setLoading(true);
    try {
      if (liked) {
        await removeFavoriteByListing(templateId, "event");
        setLiked(false);
      } else {
        await addFavorite(templateId, "event");
        setLiked(true);
      }
    } catch {
      toast.error("Could not update favorites.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={liked ? "Remove from favorites" : "Save to favorites"}
      className="absolute top-4 left-4 h-8 w-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
    >
      <Heart
        className={`w-4 h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-white/80"}`}
      />
    </button>
  );
}

interface EventPackagesSectionProps {
  category: any;
}

export const EventPackagesSection: React.FC<EventPackagesSectionProps> = ({ category }) => {
  const events: any[] = category?.events ?? [];

  if (events.length === 0) return null;

  return (
    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 mb-24">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight capitalize">
            {category.name} Packages
          </h2>
          <p className="text-gray-500 text-sm mt-1">Curated event plans ready to book</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((template: any, i: number) => {
          const img = template.images?.[0]?.url ?? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
          const location = [template.targetCity, template.targetState].filter(Boolean).join(", ");

          return (
            <Link
              href={`/event/${template.id}`}
              key={template.id}
              className="group bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#ccff00]/5 transition-all duration-300 block"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={img}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <FavoriteHeart templateId={String(template.id)} />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#ccff00] capitalize">
                  {template.category}
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-bold text-white text-lg mb-2 group-hover:text-[#ccff00] transition-colors line-clamp-1">
                  {template.name}
                </h4>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{template.description}</p>

                <div className="flex flex-col gap-1.5 mb-5 text-xs text-gray-500">
                  {location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 shrink-0" /> {location}
                    </span>
                  )}
                  {template.estimatedTotal > 0 && (
                    <span className="text-white/70 font-bold text-sm">
                      ₱{template.estimatedTotal.toLocaleString()} est.
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs text-gray-500">by {template.owner?.name ?? "Organizer"}</span>
                  <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-[#ccff00] group-hover:text-black transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
