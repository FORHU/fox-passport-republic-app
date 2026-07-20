"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import Link from "next/link";

function extractList(body: any, key: string): any[] {
  const list = body?.[key] ?? body?.data ?? [];
  return Array.isArray(list) ? list : [];
}

function TemplateCard({ item }: { item: any }) {
  return (
    <Link
      href={`/event/${item.id}`}
      className="group bg-[#11121a] border border-white/10 rounded-2xl overflow-hidden hover:border-[#ccff00]/50 transition-colors"
    >
      <div className="h-44 bg-white/5 relative overflow-hidden">
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
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#ccff00] capitalize">
            {String(item.category).replace(/_/g, " ")}
          </div>
        )}
        {item.rating != null && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] text-[#ccff00]">star</span>
            {item.rating}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-white truncate">{item.name || item.title || "Untitled"}</h3>
        {item.description && (
          <p className="text-white/60 text-sm line-clamp-2 mt-1">{item.description}</p>
        )}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10">
          <span className="text-xs text-white/50 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {item.targetCity || item.city || "Location TBD"}
          </span>
          {item.price && (
            <span className="font-bold text-[#ccff00] text-sm">
              ₱{item.price}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function EventTemplatesSection() {
  const searchParams = useSearchParams();
  const category = searchParams?.get("category") || "";
  const city = searchParams?.get("city") || "";
  const maxPrice = searchParams?.get("maxPrice") || "";

  const { data, isLoading } = useQuery({
    queryKey: ["searchTemplates", category, city, maxPrice],
    queryFn: async () => {
      const res = await api.get("/event-templates");
      let results = extractList(res.data, "templates");
      results = results.filter((item: any) => {
        const itemCity = item.targetCity || item.city || "";
        if (city && !itemCity.toLowerCase().includes(city.trim().toLowerCase())) return false;
        const itemCategory = item.category || "";
        if (category && itemCategory.toLowerCase().trim() !== category.toLowerCase().trim()) return false;
        if (maxPrice && Number(item.price) > Number(maxPrice)) return false;
        return true;
      });
      return results;
    },
  });

  const items = data ?? [];

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <h2 className="text-3xl font-display font-bold tracking-tight text-white text-center">
          Custom Event Templates
        </h2>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#11121a] border border-white/10 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <span className="material-symbols-outlined text-[56px] text-white/20">auto_awesome</span>
          <h3 className="text-xl font-bold text-white mt-2">No templates match your criteria</h3>
          <p className="text-white/60 text-sm max-w-sm mx-auto">
            Try expanding your search radius or increasing your budget to discover more themed experiences.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {items.map((item: any) => (
            <TemplateCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
