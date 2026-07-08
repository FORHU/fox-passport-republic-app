'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CancellationPolicy, fetchCancellationPolicies } from '@/features/cancellation-policy/api/cancellation-policies';
import { Check, ChevronDown } from 'lucide-react';

interface Props {
  value: string | null;
  onChange: (policyId: string | null) => void;
  label?: string;
}

export default function CancellationPolicyPicker({ value, onChange, label = 'Cancellation Policy' }: Props) {
  const [policies, setPolicies] = useState<CancellationPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCancellationPolicies()
      .then(setPolicies)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = policies.find((p) => p.id === value);

  return (
    <div ref={ref} className="relative">
      <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
        {label}
      </label>
      <button
        type="button"
        onClick={() => !loading && setOpen(!open)}
        disabled={loading}
        className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 hover:border-white/20 focus:border-accent/40 outline-none transition-all disabled:opacity-40 text-left"
      >
        {loading ? (
          <span className="flex items-center gap-2 text-white/30">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-white/10 border-t-white/30 animate-spin" />
            Loading...
          </span>
        ) : selected ? (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-white font-medium truncate">{selected.name}</span>
            {selected.isDefault && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 shrink-0">
                Default
              </span>
            )}
          </div>
        ) : (
          <span className="text-white/30">No policy (default)</span>
        )}
        <ChevronDown
          size={14}
          className={`ml-auto shrink-0 text-white/30 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-[#0f111a] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
          {policies.length === 0 ? (
            <div className="p-4 text-center text-white/20 text-xs">No policies available</div>
          ) : (
            policies.map((policy) => {
              const isSelected = policy.id === value;
              return (
                <button
                  key={policy.id}
                  type="button"
                  onClick={() => {
                    onChange(policy.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all border-b border-white/5 last:border-0
                    ${isSelected
                      ? 'bg-accent/10'
                      : 'hover:bg-white/[0.03]'
                    }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all
                    ${isSelected ? 'border-accent bg-accent/20' : 'border-white/20'}`}
                  >
                    {isSelected && <Check size={10} className="text-accent" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                        {policy.name}
                      </span>
                      {policy.isDefault && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                          Default
                        </span>
                      )}
                    </div>
                    {policy.description && (
                      <p className="text-[11px] text-white/30 mt-0.5 line-clamp-1">{policy.description}</p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
