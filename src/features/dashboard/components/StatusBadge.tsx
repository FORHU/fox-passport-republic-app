'use client';

import React, { useState, useRef, useEffect } from 'react';
import { STATUS_OPTIONS, StatusType } from '@/features/dashboard/data/dashboardData';

interface StatusBadgeProps {
  currentStatus: string;
  type: StatusType;
  onStatusChange: (status: string) => void;
  className?: string;
}

export function StatusBadge({ currentStatus, type, onStatusChange, className = '' }: StatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = STATUS_OPTIONS[type];

  const getDotColor = (status: string) => {
    const lower = (status || "").toLowerCase().replace("_", " ");
    if (["published", "ongoing", "available", "active"].includes(lower)) return "bg-green-500";
    if (["draft", "pending review", "paused"].includes(lower)) return "bg-yellow-500";
    if (["rented", "maintenance"].includes(lower)) return "bg-blue-500";
    return "bg-red-500";
  };

  const getBadgeClasses = (status: string) => {
    const lower = (status || "").toLowerCase().replace("_", " ");
    if (["published", "ongoing", "available", "active"].includes(lower))
      return "bg-green-500/20 text-green-400 border-green-500/30 font-bold";
    if (["draft", "pending review"].includes(lower))
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-bold";
    if (["rented", "maintenance"].includes(lower))
      return "bg-blue-500/20 text-blue-400 border-blue-500/30 font-bold";
    return "bg-red-500/20 text-red-400 border-red-500/30 font-bold";
  };

  const formatStatus = (status: string) => {
    if (!status) return "Unknown";
    return status.replace("_", " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const lowerCurrent = (currentStatus || "").toLowerCase();
  const shouldPulse = ["published", "ongoing", "active", "available"].includes(lowerCurrent);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${getBadgeClasses(currentStatus)}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(currentStatus)} ${shouldPulse ? 'animate-pulse' : ''}`} />
        {formatStatus(currentStatus)}
        <span className="material-symbols-outlined text-[14px] opacity-70">expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-[#1a1d2d] border border-white/10 rounded-xl shadow-2xl z-[200]">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-white/5 flex items-center gap-2 ${lowerCurrent === option.toLowerCase().replace(" ", "_") ? 'text-white' : 'text-white/60'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(option)}`} />
                {option}
                {lowerCurrent === option.toLowerCase().replace(" ", "_") && (
                  <span className="material-symbols-outlined text-[14px] text-accent ml-auto">check</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
