'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface LockedSectionProps {
  title: string;
  icon: string;
  iconColor: string;
  requiredRole: string;
  applyHref: string;
  children: React.ReactNode;
}

export function LockedSection({
  title,
  icon,
  iconColor,
  requiredRole,
  applyHref,
  children,
}: LockedSectionProps) {
  const router = useRouter();

  return (
    <section className="relative">
      {/* Actual section content — blurred behind the overlay */}
      <div className="pointer-events-none select-none blur-[2px] opacity-40">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-2xl border border-white/5 z-10">
        <div className="flex flex-col items-center gap-4 text-center px-6 py-8 max-w-xs">
          <div className="relative">
            <span className={`material-symbols-outlined text-[40px] ${iconColor}`}>{icon}</span>
            <span className="absolute -top-1 -right-1 material-symbols-outlined text-[20px] text-white/50">lock</span>
          </div>
          <div>
            <p className="text-white font-bold text-base">{title}</p>
            <p className="text-white/40 text-sm mt-1">
              Apply as <span className="text-[#ccff00] font-semibold">{requiredRole}</span> to unlock this feature
            </p>
          </div>
          <button
            onClick={() => router.push(applyHref)}
            className="px-6 py-2 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-sm font-bold hover:bg-[#ccff00]/20 transition-all"
          >
            Apply as {requiredRole}
          </button>
        </div>
      </div>
    </section>
  );
}
