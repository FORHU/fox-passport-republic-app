"use client";

import React, { useEffect, useState } from "react";
import {
  PlatformFeeConfig,
  FeeRulePayload,
  TransactionType,
  FeeCategory,
  TRANSACTION_TYPES,
  FEE_CATEGORIES,
  fetchPlatformFeeConfigs,
  createPlatformFeeConfig,
  updatePlatformFeeConfig,
  deletePlatformFeeConfig,
  previewPlatformFeeConfig,
} from "@/shared/api/platform-fee-configs";

import { toast } from "sonner";
import { X, Plus, Search } from "lucide-react";

function Empty() {
  return (
    <div className="py-24 flex flex-col items-center gap-4 text-white/20">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
        <span className="material-symbols-outlined text-[40px]">payments</span>
      </div>
      <div className="text-center">
        <p className="text-sm text-white/30 font-medium">
          No platform fee rules yet.
        </p>
        <p className="text-[11px] text-white/15 mt-1">
          Create a wildcard rule first, then add more specific ones on top of
          it.
        </p>
      </div>
    </div>
  );
}

function describeScope(rule: PlatformFeeConfig): string {
  const parts = [
    rule.transactionType ?? "any transaction",
    rule.category ?? "any category",
    rule.subcategory ?? null,
  ].filter(Boolean);
  return parts.join(" · ");
}

function describeFee(rule: PlatformFeeConfig): string {
  const parts: string[] = [];
  if (rule.percentage != null) parts.push(`${rule.percentage}%`);
  if (rule.fixedAmount != null)
    parts.push(`${rule.currency} ${rule.fixedAmount}`);
  return parts.join(" + ") || "—";
}

function FeeRuleModal({
  rule,
  onClose,
  onSave,
  saving,
}: {
  rule?: PlatformFeeConfig | null;
  onClose: () => void;
  onSave: (data: FeeRulePayload) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(rule?.name ?? "");
  const [transactionType, setTransactionType] = useState<
    TransactionType | ""
  >(rule?.transactionType ?? "");
  const [category, setCategory] = useState<FeeCategory | "">(
    rule?.category ?? "",
  );
  const [subcategory, setSubcategory] = useState(rule?.subcategory ?? "");
  const [percentage, setPercentage] = useState(
    rule?.percentage != null ? String(rule.percentage) : "",
  );
  const [fixedAmount, setFixedAmount] = useState(
    rule?.fixedAmount != null ? String(rule.fixedAmount) : "",
  );
  const [priority, setPriority] = useState(String(rule?.priority ?? 0));
  const [effectiveUntil, setEffectiveUntil] = useState(
    rule?.effectiveUntil ? rule.effectiveUntil.slice(0, 10) : "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Rule name is required");
      return;
    }
    const pct = percentage.trim() === "" ? null : Number(percentage);
    const fixed = fixedAmount.trim() === "" ? null : Number(fixedAmount);
    if (pct == null && fixed == null) {
      toast.error("Set a percentage, a fixed amount, or both");
      return;
    }
    onSave({
      name: name.trim(),
      transactionType: transactionType || null,
      category: category || null,
      subcategory: subcategory.trim() || null,
      percentage: pct,
      fixedAmount: fixed,
      priority: Number(priority) || 0,
      effectiveUntil: effectiveUntil || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
            <span className="material-symbols-outlined text-accent text-[20px]">
              payments
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg leading-tight">
              {rule ? "Edit Fee Rule" : "Create Fee Rule"}
            </h2>
            <p className="text-white/40 text-xs leading-tight mt-0.5">
              Leave transaction type/category blank to match everything —
              more specific rules win automatically.
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
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
              Rule Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Global Default, Birthday Premium"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                Transaction Type
              </label>
              <select
                value={transactionType}
                onChange={(e) =>
                  setTransactionType(e.target.value as TransactionType | "")
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:border-accent/40 outline-none transition-all"
              >
                <option className="bg-[#0f111a] text-white" value="">
                  Any (wildcard)
                </option>
                {TRANSACTION_TYPES.map((t) => (
                  <option className="bg-[#0f111a] text-white" key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as FeeCategory | "")
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:border-accent/40 outline-none transition-all"
              >
                <option className="bg-[#0f111a] text-white" value="">
                  Any (wildcard)
                </option>
                {FEE_CATEGORIES.map((c) => (
                  <option className="bg-[#0f111a] text-white" key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
              Subcategory{" "}
              <span className="normal-case font-normal text-white/25">
                — not yet read by any pricing calculation, reserved for later
              </span>
            </label>
            <input
              type="text"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="Optional"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                Percentage
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="e.g. 5"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                Fixed Amount
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={fixedAmount}
                onChange={(e) => setFixedAmount(e.target.value)}
                placeholder="e.g. 15"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                Priority
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
              Effective Until{" "}
              <span className="normal-case font-normal text-white/25">
                — optional, leave blank for open-ended
              </span>
            </label>
            <input
              type="date"
              value={effectiveUntil}
              onChange={(e) => setEffectiveUntil(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent/40 outline-none transition-all"
            />
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
              ) : rule ? (
                "Update Rule"
              ) : (
                "Create Rule"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PreviewTool() {
  const [transactionType, setTransactionType] =
    useState<TransactionType>("event");
  const [category, setCategory] = useState<FeeCategory | "">("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<PlatformFeeConfig | null | undefined>(
    undefined,
  );

  const handleCheck = async () => {
    setChecking(true);
    setResult(undefined);
    try {
      const rule = await previewPlatformFeeConfig({
        transactionType,
        category: category || undefined,
      });
      setResult(rule);
    } catch {
      toast.error("Failed to preview the effective rule.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-white/5">
      <div className="flex items-center gap-2.5 mb-4">
        <Search size={16} className="text-accent" />
        <h3 className="font-bold text-white text-sm">
          Preview the effective rule
        </h3>
      </div>
      <p className="text-white/40 text-xs mb-4">
        Pick a context and see which rule the pricing engine would actually
        use right now — the same resolver Central Payment checkout runs.
      </p>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
            Transaction Type
          </label>
          <select
            value={transactionType}
            onChange={(e) =>
              setTransactionType(e.target.value as TransactionType)
            }
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-accent/40 outline-none"
          >
            {TRANSACTION_TYPES.map((t) => (
              <option className="bg-[#0f111a] text-white" key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FeeCategory | "")}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-accent/40 outline-none"
          >
            <option className="bg-[#0f111a] text-white" value="">
              Any
            </option>
            {FEE_CATEGORIES.map((c) => (
              <option className="bg-[#0f111a] text-white" key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCheck}
          disabled={checking}
          className="px-5 py-2.5 rounded-xl bg-accent text-black font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
        >
          {checking ? "Checking..." : "Check"}
        </button>
      </div>
      {result !== undefined && (
        <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          {result ? (
            <p className="text-sm text-white/70">
              <span className="font-bold text-white">{result.name}</span>{" "}
              would apply — {describeFee(result)} ({describeScope(result)})
            </p>
          ) : (
            <p className="text-sm text-white/40">
              No rule matches this context. Nothing would be charged.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPlatformFeeConfigs() {
  const [rules, setRules] = useState<PlatformFeeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRule, setEditRule] = useState<PlatformFeeConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchPlatformFeeConfigs(includeInactive);
      setRules(data);
    } catch {
      toast.error("Failed to load platform fee rules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
     
  }, [includeInactive]);

  const handleCreate = () => {
    setEditRule(null);
    setShowModal(true);
  };

  const handleEdit = (rule: PlatformFeeConfig) => {
    setEditRule(rule);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this fee rule?")) return;
    try {
      await deletePlatformFeeConfig(id);
      toast.success("Fee rule deactivated.");
      load();
    } catch {
      toast.error("Failed to deactivate fee rule.");
    }
  };

  const handleSave = async (data: FeeRulePayload) => {
    setSaving(true);
    try {
      if (editRule) {
        await updatePlatformFeeConfig(editRule.id, data);
        toast.success("Fee rule updated.");
      } else {
        await createPlatformFeeConfig(data);
        toast.success("Fee rule created.");
      }
      setShowModal(false);
      setEditRule(null);
      load();
    } catch {
      toast.error("Failed to save fee rule.");
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-display font-bold text-white">
            Platform Fees
          </h2>
          <p className="text-white/40 text-sm mt-0.5">
            Fee rules the Central Payment pricing engine resolves at
            checkout, most specific wins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-white/50">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="accent-accent"
            />
            Show deactivated
          </label>
          <button
            onClick={handleCreate}
            className="px-5 py-2.5 rounded-xl bg-accent text-black font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shrink-0 active:scale-[0.97]"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Rule</span>
          </button>
        </div>
      </div>

      <PreviewTool />

      {rules.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid gap-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all group/card ${
                !rule.active ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-white text-base truncate">
                      {rule.name}
                    </h3>
                    {!rule.active && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-white/5 text-white/40 border border-white/10">
                        Deactivated
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                      Priority {rule.priority}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm mt-1.5">
                    {describeScope(rule)}
                  </p>
                  <p className="text-white/70 text-sm font-mono mt-1">
                    {describeFee(rule)}
                  </p>
                  {rule.effectiveUntil && (
                    <p className="text-white/25 text-[11px] mt-1.5">
                      Effective until{" "}
                      {new Date(rule.effectiveUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleEdit(rule)}
                    className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover/card:opacity-100"
                    title="Edit rule"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      edit
                    </span>
                  </button>
                  {rule.active && (
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 rounded-xl bg-red-500/5 text-red-400/40 hover:text-red-400 hover:bg-red-500/15 transition-all opacity-0 group-hover/card:opacity-100"
                      title="Deactivate rule"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <FeeRuleModal
          rule={editRule}
          onClose={() => {
            setShowModal(false);
            setEditRule(null);
          }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
