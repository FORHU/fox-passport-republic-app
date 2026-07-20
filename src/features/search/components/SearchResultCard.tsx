"use client";

import { useRouter } from "next/navigation";

interface SearchResultCardProps {
  item: any;
  type: string;
}

const DETAIL_PATH: Record<string, (id: string) => string> = {
  venue: (id) => `/venues/${id}`,
  service: (id) => `/booking/service/${id}`,
  asset: (id) => `/booking/asset/${id}`,
  event_template: (id) => `/event/${id}`,
};

export default function SearchResultCard({ item, type }: SearchResultCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(DETAIL_PATH[item._type ?? type]?.(item.id) ?? "#")}
      className="bg-[#11121a] border border-white/10 rounded-2xl overflow-hidden hover:border-[#ccff00]/50 transition-colors group cursor-pointer"
    >
      <div className="h-48 bg-white/5 relative overflow-hidden">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0].url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/20">
            <span className="material-symbols-outlined text-[48px]">image</span>
          </div>
        )}
        {item.category && (
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#ccff00] capitalize">
            {String(item.category).replace(/_/g, " ")}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 truncate">{item.name || item.title || "Untitled"}</h3>
        {item.description && (
          <p className="text-white/60 text-sm line-clamp-2 mb-4">{item.description}</p>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-1 text-sm text-white/60">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span className="truncate max-w-[120px]">{item.city || item.targetCity || "Location TBD"}</span>
          </div>
          {item.price && (
            <div className="font-bold text-[#ccff00]">
              {item.currency || "₱"} {item.price}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
