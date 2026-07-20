"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchFoxers, type Foxer } from "@/features/user/api/foxers";
import { useRouter } from "next/navigation";

interface ProviderRow {
  foxerId: string;
  name: string;
  itemName: string;
  category: string;
  price: number;
  billingRate: string;
  img?: string;
}

function toRows(foxers: Foxer[]): ProviderRow[] {
  const rows: ProviderRow[] = [];
  foxers.forEach((f) => {
    f.services.forEach((s) => {
      rows.push({
        foxerId: f.id,
        name: f.name,
        itemName: s.name,
        category: s.category,
        price: s.price,
        billingRate: s.billingRate,
        img: s.images?.[0]?.url,
      });
    });
  });
  return rows;
}

function BentoColumn({
  title,
  icon,
  rows,
  loading,
}: {
  title: string;
  icon: string;
  rows: ProviderRow[];
  loading: boolean;
}) {
  const router = useRouter();
  return (
    <div className="bg-[#0f1018] border border-white/10 rounded-3xl p-5 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <span className="material-symbols-outlined text-[#ccff00] text-[20px]">{icon}</span>
        <h3 className="text-lg font-display font-bold tracking-tight text-white">{title}</h3>
        <span className="ml-auto text-xs text-white/40">{rows.length}</span>
      </div>

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
        ))
      ) : rows.length === 0 ? (
        <p className="text-white/40 text-sm py-6 text-center">No providers in this area yet.</p>
      ) : (
        rows.map((row, i) => (
          <div
            key={i}
            onClick={() => router.push(`/foxer/${row.foxerId}`)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#ccff00]/40 hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="h-12 w-12 rounded-xl bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
              {row.img ? (
                <img src={row.img} alt={row.itemName} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-white/30 text-[20px]">inventory_2</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate group-hover:text-[#ccff00] transition-colors">
                {row.itemName}
              </p>
              <p className="text-[11px] text-white/40 truncate">
                {row.name} · {row.category.replace(/_/g, " ")}
              </p>
            </div>
            <span className="text-xs font-bold text-[#ccff00] whitespace-nowrap">
              ₱{row.price.toLocaleString()}
              <span className="text-white/40 font-normal">/{row.billingRate}</span>
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export default function GearServiceBento() {
  const searchParams = useSearchParams();
  const city = searchParams?.get("city") || "";

  const { data: gear, isLoading: gearLoading } = useQuery({
    queryKey: ["gearFoxers", city],
    queryFn: () => fetchFoxers(20, 1, "gearFoxer"),
  });
  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ["serviceFoxers", city],
    queryFn: () => fetchFoxers(20, 1, "serviceFoxer"),
  });

  const gearRows = toRows(gear ?? []).filter(
    (r) => !city || r.name.toLowerCase().includes(city.toLowerCase())
  );
  const serviceRows = toRows(service ?? []).filter(
    (r) => !city || r.name.toLowerCase().includes(city.toLowerCase())
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <h2 className="text-3xl font-display font-bold tracking-tight text-white text-center">
          Gear & Service Foxers
        </h2>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <BentoColumn title="Gear Foxers" icon="audio_file" rows={gearRows} loading={gearLoading} />
        <BentoColumn title="Service Foxers" icon="design_services" rows={serviceRows} loading={serviceLoading} />
      </div>
    </section>
  );
}
