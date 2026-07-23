'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchCancellationPolicies()
      .then(setPolicies)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    // Close on any scroll (button position changes, portal can't track it)
    const handleScroll = () => setOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  const handleToggle = () => {
    if (loading) return;
    if (!open && triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    setOpen(o => !o);
  };

  const selected = policies.find((p) => p.id === value);

  const dropdownEl = open && triggerRect ? (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: triggerRect.bottom + 4,
        left: triggerRect.left,
        width: triggerRect.width,
        zIndex: 9999,
        maxHeight: '60vh',
        overflowY: 'auto',
      }}
      className="bg-[#0f111a] border border-white/10 rounded-xl shadow-2xl shadow-black/50"
    >
      {policies.length === 0 ? (
        <div className="p-4 text-center text-white/20 text-xs">No policies available</div>
      ) : (
        policies.map((policy) => {
          const isSelected = policy.id === value;
          return (
            <button
              key={policy.id}
              type="button"
              onClick={() => { onChange(policy.id); setOpen(false); }}
              className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-all border-b border-white/5 last:border-0
                ${isSelected ? 'bg-accent/10' : 'hover:bg-white/3'}`}
            >
              <div className={`w-4 h-4 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center transition-all
                ${isSelected ? 'border-accent bg-accent/20' : 'border-white/20'}`}
              >
                {isSelected && <Check size={10} className="text-accent" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-white/80'}`}>
                    {policy.name}
                  </span>
                  {policy.isDefault && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                      Default
                    </span>
                  )}
                </div>
                {policy.rules && policy.rules.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1">
                    {policy.rules.map((rule) => (
                      <div key={rule.id} className="flex items-center gap-2">
                        <span className="text-[10px] text-white/40 w-28 shrink-0">
                          {rule.toHours === null
                            ? `${rule.fromHours}h+ before`
                            : rule.fromHours === 0
                            ? `Within ${rule.toHours}h`
                            : `${rule.fromHours}–${rule.toHours}h before`}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          rule.refundPercent === 100 ? 'text-[#ccff00]'
                          : rule.refundPercent > 0 ? 'text-yellow-400'
                          : 'text-red-400'
                        }`}>
                          {rule.refundPercent === 100 ? 'Full refund'
                          : rule.refundPercent > 0 ? `${rule.refundPercent}% refund`
                          : 'No refund'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })
      )}
    </div>
  ) : null;

  return (
    <div className="relative">
      <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
        {label}
      </label>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
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

      {mounted && createPortal(dropdownEl, document.body)}
    </div>
  );
}
