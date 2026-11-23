"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CancellationPolicy,
  fetchCancellationPolicies,
} from "@/shared/api/cancellation-policies";
import { Check, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const NO_POLICIES: CancellationPolicy[] = [];

interface Props {
  value: string | null;
  onChange: (policyId: string | null) => void;
  label?: string;
  cancellationType?: "Flexible" | "Non-Refundable" | "";
  onTypeChange?: (type: "Flexible" | "Non-Refundable" | "") => void;
  flexibleRefundPercent?: number;
  onRefundPercentChange?: (percent: number) => void;
  flexibleRefundHours?: number;
  onRefundHoursChange?: (hours: number) => void;
}

export default function CancellationPolicyPicker({
  value,
  onChange,
  label = "Cancellation Policy",
  cancellationType,
  onTypeChange,
  flexibleRefundPercent = 100,
  onRefundPercentChange,
  flexibleRefundHours = 24,
  onRefundHoursChange,
}: Props) {
  // Platform reference data that rarely changes — cached for 10 minutes so
  // every listing form reuses one fetch.
  const { data: rawPolicies = NO_POLICIES, isPending: loading } = useQuery({
    queryKey: ["cancellation-policies"],
    queryFn: fetchCancellationPolicies,
    staleTime: 10 * 60_000,
  });

  // Simplified policy options: ONLY Flexible and Non-Refundable (api#436, app#400)
  const policies = rawPolicies.filter(
    (p) =>
      p.name.toLowerCase() !== "moderate" && p.name.toLowerCase() !== "strict",
  );
  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    // Close on any scroll (button position changes, portal can't track it)
    const handleScroll = () => setOpen(false);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  const handleToggle = () => {
    if (loading) return;
    if (!open && triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    setOpen((o) => !o);
  };

  const selected = policies.find((p) => p.id === value);

  const dropdownEl =
    open && triggerRect ? (
      <div
        ref={dropdownRef}
        style={{
          position: "fixed",
          top: triggerRect.bottom + 4,
          left: triggerRect.left,
          width: triggerRect.width,
          zIndex: 9999,
          maxHeight: "60vh",
          overflowY: "auto",
        }}
        className="bg-surface border border-white/10 rounded-xl shadow-2xl shadow-black/50"
      >
        {policies.length === 0 ? (
          <div className="p-4 text-center text-white/20 text-xs">
            No policies available
          </div>
        ) : (
          policies.map((policy) => {
            const isSelected = policy.id === value;
            return (
              <button
                key={policy.id}
                type="button"
                onClick={() => {
                  onChange(policy.id);
                  if (policy.name === "Non-Refundable") {
                    onTypeChange?.("Non-Refundable");
                  } else {
                    onTypeChange?.("Flexible");
                  }
                  setOpen(false);
                }}
                className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-all border-b border-white/5 last:border-0
                ${isSelected ? "bg-accent/10" : "hover:bg-white/3"}`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center transition-all
                ${isSelected ? "border-accent bg-accent/20" : "border-white/20"}`}
                >
                  {isSelected && <Check size={10} className="text-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-sm font-semibold ${isSelected ? "text-white" : "text-white/80"}`}
                    >
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
                      {policy.rules.map((rule, i) => (
                        <div
                          key={rule.id || i}
                          className="flex items-center gap-2"
                        >
                          <span className="text-[10px] text-white/40 w-28 shrink-0">
                            {rule.toHours === null
                              ? `${rule.fromHours}h+ before`
                              : rule.fromHours === 0
                                ? `Within ${rule.toHours}h`
                                : `${rule.fromHours}–${rule.toHours}h before`}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              rule.refundPercent === 100
                                ? "text-accent"
                                : rule.refundPercent > 0
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }`}
                          >
                            {rule.refundPercent === 100
                              ? "Full refund"
                              : rule.refundPercent > 0
                                ? `${rule.refundPercent}% refund`
                                : "No refund"}
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
            <span className="text-white font-medium truncate">
              {selected.name}
            </span>
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
          className={`ml-auto shrink-0 text-white/30 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {mounted && createPortal(dropdownEl, document.body)}

      {/* Simplified Custom Flexible Conditions (api#436, app#400) */}
      {(selected?.name === "Flexible" ||
        cancellationType === "Flexible" ||
        (!selected && !cancellationType)) && (
        <div className="mt-3 p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
              Flexible Refund Conditions
            </span>
            <span className="text-[10px] text-white/40">Customizable</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="flexible-refund-percent" className="text-[9px] uppercase font-bold text-white/40 block mb-1">
                Refund Percent (%)
              </label>
              <input
                id="flexible-refund-percent"
                type="number"
                min={0}
                max={100}
                value={flexibleRefundPercent}
                onChange={(e) => {
                  const val = Math.min(
                    100,
                    Math.max(0, parseInt(e.target.value) || 0),
                  );
                  onRefundPercentChange?.(val);
                }}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-accent outline-none font-mono"
              />
            </div>
            <div>
              <label htmlFor="flexible-refund-hours" className="text-[9px] uppercase font-bold text-white/40 block mb-1">
                Deadline (Hours Before)
              </label>
              <input
                id="flexible-refund-hours"
                type="number"
                min={0}
                value={flexibleRefundHours}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  onRefundHoursChange?.(val);
                }}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-accent outline-none font-mono"
              />
            </div>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Guests receive a{" "}
            <strong className="text-white">{flexibleRefundPercent}%</strong>{" "}
            refund if cancelled at least{" "}
            <strong className="text-white">{flexibleRefundHours} hours</strong>{" "}
            before event start.
          </p>
        </div>
      )}

      {(selected?.name === "Non-Refundable" ||
        cancellationType === "Non-Refundable") && (
        <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-xs text-red-300 font-medium">
            Bookings are strictly non-refundable once confirmed (0% refund).
          </p>
        </div>
      )}
    </div>
  );
}
