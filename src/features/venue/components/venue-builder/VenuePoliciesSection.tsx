"use client";

import React, { useState } from "react";
import { ResourceItem } from "@/features/venue/data/venueBuilderData";

interface VenuePoliciesSectionProps {
  policies: ResourceItem[];
  onAddPolicy: (name: string) => void;
  onUpdatePolicy: (id: string, updates: Partial<ResourceItem>) => void;
  onRemovePolicy: (id: string) => void;
}

export function VenuePoliciesSection({
  policies,
  onAddPolicy,
  onUpdatePolicy,
  onRemovePolicy,
}: VenuePoliciesSectionProps) {
  const [newPolicyText, setNewPolicyText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const handleAdd = () => {
    if (!newPolicyText.trim()) return;
    onAddPolicy(newPolicyText.trim());
    setNewPolicyText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-surface/30 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">gavel</span>
            Venue Policies
          </h3>
          <p className="text-xs text-text-muted">
            Establish house rules, guidelines, and expectations for guests.
          </p>
        </div>
        <span className="bg-white/5 text-white/70 px-3 py-1 rounded-full text-xs font-bold border border-white/5">
          {policies.length}
        </span>
      </div>

      {/* Add Policy Input */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 focus-within:border-accent/40 transition-colors">
          <span className="material-symbols-outlined text-white/40 text-[18px]">
            add_task
          </span>
          <input
            type="text"
            value={newPolicyText}
            onChange={(e) => setNewPolicyText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. No outside catering without approval, Quiet hours after 10 PM..."
            className="bg-transparent border-none p-0 text-xs text-white placeholder-white/30 focus:ring-0 w-full outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newPolicyText.trim()}
          className="px-4 py-2.5 bg-accent text-black font-bold text-xs rounded-xl hover:bg-accent/80 disabled:opacity-30 disabled:grayscale transition-all shrink-0 cursor-pointer"
        >
          Add Policy
        </button>
      </div>

      {/* Policies List */}
      {policies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-text-muted">
          <span className="material-symbols-outlined text-3xl mb-2 opacity-30">
            policy
          </span>
          <p className="text-sm opacity-50">
            No venue policies added yet. Add one above or select from the
            Policies palette tab.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-surface-raised border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3 group"
            >
              {editingId === policy.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white focus:border-accent outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] text-white/70"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingText.trim()) {
                        onUpdatePolicy(policy.id, { name: editingText.trim() });
                      }
                      setEditingId(null);
                    }}
                    className="px-2.5 py-1 rounded bg-accent text-black font-bold text-[11px]"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="material-symbols-outlined text-white/40 text-[18px] shrink-0">
                      check_circle
                    </span>
                    <span className="text-xs text-white/90 leading-relaxed truncate">
                      {policy.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(policy.id);
                        setEditingText(policy.name);
                      }}
                      className="text-white/20 hover:text-accent p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      title="Edit policy"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemovePolicy(policy.id)}
                      className="text-white/20 hover:text-red-400 p-1.5 rounded-full transition-all"
                      title="Remove policy"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        delete
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
