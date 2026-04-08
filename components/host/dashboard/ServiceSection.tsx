import React from 'react';
import Link from 'next/link';
import { ServiceItem } from '@/data/dashboardData';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';

interface ServicesSectionProps {
  services: ServiceItem[];
  onStatusChange: (id: number | string, status: string) => void;
  showViewAllLink?: boolean;
  viewAllHref?: string;
  onEdit?: (id: number | string) => void;
}

export function ServicesSection({
  services,
  onStatusChange,
  showViewAllLink = true,
  viewAllHref = "/host/services",
  onEdit,
}: ServicesSectionProps) {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-400">handyman</span>
          Services
        </h2>
        {showViewAllLink && (
          <Link
            className="text-xs font-bold text-[#ccff00] border border-[#ccff00]/30 px-4 py-2 rounded-full hover:bg-[#ccff00] hover:text-black flex items-center gap-1"
            href={viewAllHref}
          >
            View All
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        )}
      </div>
      <div className="space-y-3">
        {services.length > 0 ? (
          services.map((sv) => (
            <div
              key={sv.id}
              className={`flex items-center justify-between p-4 rounded-2xl bg-[#0f111a]/60 border border-white/5 hover:bg-white/5 ${onEdit ? "cursor-pointer" : ""}`}
              onClick={() => onEdit?.(sv.id)}
              role={onEdit ? "button" : undefined}
              tabIndex={onEdit ? 0 : undefined}
              onKeyDown={(e) => {
                if (!onEdit) return;
                if (e.key === "Enter" || e.key === " ") onEdit(sv.id);
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${sv.color}`}>
                  <span className="material-symbols-outlined">{sv.icon}</span>
                </div>
                <div>
                  <h4 className={`font-bold ${sv.status === 'Active' ? 'text-white' : 'text-white/50'}`}>
                    {sv.name}
                  </h4>
                  <p className="text-xs text-white/40">{sv.price}</p>
                </div>
              </div>
              <StatusBadge
                currentStatus={sv.status}
                type="service"
                onStatusChange={(s) => onStatusChange(sv.id, s)}
              />
            </div>
          ))
        ) : (
          <EmptyState type="services" href="/foxer/create-listing?type=service" />
        )}
      </div>
    </section>
  );
}
