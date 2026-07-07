'use client';

import React, { useEffect, useState } from 'react';
import {
  CancellationPolicy,
  CancellationRule,
  fetchCancellationPolicies,
  createCancellationPolicy,
  updateCancellationPolicy,
  deleteCancellationPolicy,
} from '@/features/cancellation-policy/api/cancellation-policies';
import { toast } from 'sonner';
import { X, Plus, Trash2 } from 'lucide-react';

function Empty({ label }: { label: string }) {
  return (
    <div className="py-24 flex flex-col items-center gap-4 text-white/20">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
        <span className="material-symbols-outlined text-[40px]">policy</span>
      </div>
      <div className="text-center">
        <p className="text-sm text-white/30 font-medium">{label}</p>
        <p className="text-[11px] text-white/15 mt-1">Create your first policy to set refund rules for bookings.</p>
      </div>
    </div>
  );
}

function RuleRow({
  rule,
  index,
  onChange,
  onRemove,
}: {
  rule: Partial<CancellationRule>;
  index: number;
  onChange: (i: number, r: Partial<CancellationRule>) => void;
  onRemove: (i: number) => void;
}) {
  const refundColor =
    rule.refundPercent != null
      ? rule.refundPercent >= 100
        ? 'bg-green-500/20 text-green-400 border-green-500/30'
        : rule.refundPercent >= 50
          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
          : rule.refundPercent > 0
            ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
            : 'bg-red-500/20 text-red-400 border-red-500/30'
      : 'bg-white/5 text-white/30 border-white/10';

  return (
    <div className="group flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 hover:bg-white/5 transition-all">
      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider w-10">From</span>
          <input
            type="text"
            inputMode="numeric"
            value={rule.fromHours ?? ''}
            onChange={(e) => {
              const num = Number(e.target.value);
              onChange(index, { ...rule, fromHours: e.target.value === '' || isNaN(num) ? undefined : num });
            }}
            placeholder="0"
            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white placeholder-white/20 focus:border-accent/40 outline-none text-center font-mono"
          />
          <span className="text-[10px] text-white/20 font-mono">h</span>
        </div>
        <span className="text-white/15 text-xs">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider w-6">To</span>
          <input
            type="text"
            inputMode="numeric"
            value={rule.toHours ?? ''}
            onChange={(e) => {
              const num = Number(e.target.value);
              onChange(index, { ...rule, toHours: e.target.value === '' || isNaN(num) ? null : num });
            }}
            placeholder="∞"
            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white placeholder-white/20 focus:border-accent/40 outline-none text-center font-mono"
          />
          <span className="text-[10px] text-white/20 font-mono">h</span>
        </div>
        <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Refund</span>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={rule.refundPercent ?? ''}
              onChange={(e) => {
                const num = Number(e.target.value);
                onChange(index, { ...rule, refundPercent: e.target.value === '' || isNaN(num) ? undefined : num });
              }}
              placeholder="0"
              className="w-16 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white placeholder-white/20 focus:border-accent/40 outline-none text-center font-mono pr-5"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/30 font-mono">%</span>
          </div>
        </div>
        {rule.refundPercent != null && !isNaN(rule.refundPercent) && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${refundColor}`}>
            {rule.refundPercent}%
          </span>
        )}
      </div>
      <button
        onClick={() => onRemove(index)}
        className="p-1.5 rounded-lg text-red-400/30 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function PolicyModal({
  policy,
  onClose,
  onSave,
  saving,
}: {
  policy?: CancellationPolicy | null;
  onClose: () => void;
  onSave: (data: { name: string; description: string; rules: Partial<CancellationRule>[] }) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(policy?.name ?? '');
  const [description, setDescription] = useState(policy?.description ?? '');
  const [rules, setRules] = useState<Partial<CancellationRule>[]>(
    policy?.rules?.length
      ? policy.rules.map((r) => ({ fromHours: r.fromHours, toHours: r.toHours, refundPercent: r.refundPercent }))
      : [{ fromHours: 48, toHours: null, refundPercent: 100 }],
  );

  const handleRuleChange = (index: number, rule: Partial<CancellationRule>) => {
    setRules((prev) => prev.map((r, i) => (i === index ? rule : r)));
  };

  const handleRemoveRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRule = () => {
    setRules((prev) => [...prev, { fromHours: 0, toHours: null, refundPercent: 50 }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Policy name is required');
      return;
    }
    if (rules.length === 0) {
      toast.error('At least one rule is required');
      return;
    }
    for (const rule of rules) {
      if (rule.fromHours == null || rule.refundPercent == null) {
        toast.error('All rule fields must be filled');
        return;
      }
    }
    onSave({ name: name.trim(), description: description.trim(), rules });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
            <span className="material-symbols-outlined text-accent text-[20px]">policy</span>
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg leading-tight">
              {policy ? 'Edit Policy' : 'Create Policy'}
            </h2>
            <p className="text-white/40 text-xs leading-tight mt-0.5">
              {policy ? 'Update the cancellation policy details and refund rules.' : 'Set up a new cancellation policy with refund rules.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Policy Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Flexible, Moderate, Strict, Weekend Special"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Full refund within 48h. 75% refund up to 7 days before. 50% refund up to 3 days before. 25% refund up to 24h before. No refund within 24h."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none resize-none h-20 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Refund Rules</label>
              <button
                type="button"
                onClick={handleAddRule}
                className="text-[10px] font-bold text-accent hover:text-accent/80 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/15 transition-all"
              >
                <Plus size={12} />
                Add Rule
              </button>
            </div>
            <div className="space-y-2">
              {rules.map((rule, i) => (
                <RuleRow key={i} rule={rule} index={i} onChange={handleRuleChange} onRemove={handleRemoveRule} />
              ))}
              {rules.length === 0 && (
                <div className="p-6 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                  <p className="text-white/20 text-xs">No rules yet. Click &quot;Add Rule&quot; to create one.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 text-white/70 font-semibold text-sm hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-accent text-black font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black/80 animate-spin" />
                  Saving...
                </span>
              ) : policy ? (
                'Update Policy'
              ) : (
                'Create Policy'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCancellationPolicies() {
  const [policies, setPolicies] = useState<CancellationPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPolicy, setEditPolicy] = useState<CancellationPolicy | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCancellationPolicies();
      setPolicies(data);
    } catch {
      toast.error('Failed to load cancellation policies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = () => {
    setEditPolicy(null);
    setShowModal(true);
  };

  const handleEdit = (policy: CancellationPolicy) => {
    setEditPolicy(policy);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    try {
      await deleteCancellationPolicy(id);
      toast.success('Policy deleted.');
      load();
    } catch {
      toast.error('Failed to delete policy.');
    }
  };

  const handleSave = async (data: { name: string; description: string; rules: Partial<CancellationRule>[] }) => {
    setSaving(true);
    try {
      const rules = data.rules.map((r) => ({ fromHours: Number(r.fromHours), toHours: r.toHours ? Number(r.toHours) : null, refundPercent: Number(r.refundPercent) }));
      if (editPolicy) {
        await updateCancellationPolicy(editPolicy.id, { name: data.name, description: data.description, rules });
        toast.success('Policy updated.');
      } else {
        await createCancellationPolicy({ name: data.name, description: data.description, rules });
        toast.success('Policy created.');
      }
      setShowModal(false);
      setEditPolicy(null);
      load();
    } catch {
      toast.error('Failed to save policy.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="h-8 w-8 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white">Cancellation Policies</h2>
          <p className="text-white/40 text-sm mt-0.5">Define refund rules for bookings based on cancellation timing.</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-5 py-2.5 rounded-xl bg-accent text-black font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shrink-0 active:scale-[0.97]"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Policy</span>
        </button>
      </div>

      {policies.length === 0 ? (
        <Empty label="No cancellation policies yet. Create your first one." />
      ) : (
        <div className="grid gap-4">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="glass-card rounded-2xl p-5 sm:p-6 border border-white/5 hover:border-white/10 transition-all group/card"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-white text-base truncate">{policy.name}</h3>
                    {policy.isDefault && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                        Default
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-white/5 text-white/40 border border-white/10">
                      {policy.rules.length} {policy.rules.length === 1 ? 'Rule' : 'Rules'}
                    </span>
                  </div>
                  {policy.description && (
                    <p className="text-white/40 text-sm mt-1.5 leading-relaxed line-clamp-2">{policy.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 ml-4 shrink-0">
                  <button
                    onClick={() => handleEdit(policy)}
                    className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover/card:opacity-100"
                    title="Edit policy"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(policy.id)}
                    className="p-2 rounded-xl bg-red-500/5 text-red-400/40 hover:text-red-400 hover:bg-red-500/15 transition-all opacity-0 group-hover/card:opacity-100"
                    title="Delete policy"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              {policy.rules.length > 0 && (
                <div className="space-y-2">
                  {policy.rules
                    .sort((a, b) => (a.fromHours ?? 0) - (b.fromHours ?? 0))
                    .map((rule, i, arr) => {
                      const pct = rule.refundPercent ?? 0;
                      const barColor =
                        pct >= 100
                          ? 'bg-green-500'
                          : pct >= 75
                            ? 'bg-emerald-500'
                            : pct >= 50
                              ? 'bg-yellow-500'
                              : pct >= 25
                                ? 'bg-orange-500'
                                : 'bg-red-500';
                      const barLabelColor =
                        pct >= 100
                          ? 'text-green-400'
                          : pct >= 75
                            ? 'text-emerald-400'
                            : pct >= 50
                              ? 'text-yellow-400'
                              : pct >= 25
                                ? 'text-orange-400'
                                : 'text-red-400';

                      return (
                        <div key={rule.id || i}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-mono text-white/50 font-medium">
                                {rule.fromHours}h
                              </span>
                              <span className="text-white/20">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M4.5 2.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </span>
                              <span className="font-mono text-white/70 font-medium">
                                {rule.toHours != null ? `${rule.toHours}h` : '∞'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold font-mono ${barLabelColor}`}>
                                {pct}%
                              </span>
                              <span className="text-[10px] text-white/30 font-medium">refund</span>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor} transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {i < arr.length - 1 && (
                            <div className="h-3 border-l border-dashed border-white/5 ml-1" />
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
              {policy.rules.length === 0 && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/5 text-center">
                  <p className="text-white/20 text-xs">No refund rules defined.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PolicyModal
          policy={editPolicy}
          onClose={() => { setShowModal(false); setEditPolicy(null); }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
