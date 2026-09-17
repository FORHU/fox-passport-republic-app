"use client";

import React, { useEffect, useState } from "react";
import {
  Promotion,
  PromotionPayload,
  PromotionAnalytics,
  DiscountType,
  Voucher,
  fetchPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  generateVouchers,
  setVoucherActive,
  importVouchers,
  fetchPromotionAnalytics,
} from "@/shared/api/promotions";
import { formatCurrency } from "@/shared/lib/currency";
import { toast } from "sonner";
import { X, Plus, Ticket, Copy, Upload } from "lucide-react";

function Empty() {
  return (
    <div className="py-24 flex flex-col items-center gap-4 text-white/20">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
        <span className="material-symbols-outlined text-[40px]">sell</span>
      </div>
      <div className="text-center">
        <p className="text-sm text-white/30 font-medium">
          No promotions yet.
        </p>
        <p className="text-[11px] text-white/15 mt-1">
          Create one, then generate voucher codes for citizens to redeem.
        </p>
      </div>
    </div>
  );
}

function describeDiscount(promo: Promotion): string {
  return promo.discountType === "percentage"
    ? `${promo.discountValue}% off`
    : `${formatCurrency(promo.discountValue)} off`;
}

function describeConstraints(promo: Promotion): string {
  const parts: string[] = [];
  if (promo.minSubtotal) parts.push(`min ${formatCurrency(promo.minSubtotal)} spend`);
  if (promo.maxDiscount) parts.push(`capped at ${formatCurrency(promo.maxDiscount)}`);
  if (promo.usageLimit) parts.push(`${promo.usageLimit} total uses`);
  if (promo.perUserLimit) parts.push(`${promo.perUserLimit} per citizen`);
  if (promo.transactionType) parts.push(promo.transactionType);
  if (promo.category) parts.push(promo.category);
  return parts.join(" · ") || "No restrictions";
}

function PromotionModal({
  promo,
  onClose,
  onSave,
  saving,
}: {
  promo?: Promotion | null;
  onClose: () => void;
  onSave: (data: PromotionPayload) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(promo?.name ?? "");
  const [description, setDescription] = useState(promo?.description ?? "");
  const [transactionType, setTransactionType] = useState(
    promo?.transactionType ?? "",
  );
  const [category, setCategory] = useState(promo?.category ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(
    promo?.discountType ?? "percentage",
  );
  const [discountValue, setDiscountValue] = useState(
    promo?.discountValue != null ? String(promo.discountValue) : "",
  );
  const [minSubtotal, setMinSubtotal] = useState(
    promo?.minSubtotal != null ? String(promo.minSubtotal) : "",
  );
  const [maxDiscount, setMaxDiscount] = useState(
    promo?.maxDiscount != null ? String(promo.maxDiscount) : "",
  );
  const [usageLimit, setUsageLimit] = useState(
    promo?.usageLimit != null ? String(promo.usageLimit) : "",
  );
  const [perUserLimit, setPerUserLimit] = useState(
    promo?.perUserLimit != null ? String(promo.perUserLimit) : "1",
  );
  const [startDate, setStartDate] = useState(
    promo?.startDate ? promo.startDate.slice(0, 10) : "",
  );
  const [endDate, setEndDate] = useState(
    promo?.endDate ? promo.endDate.slice(0, 10) : "",
  );
  const [autoApply, setAutoApply] = useState(promo?.autoApply ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Promotion name is required");
      return;
    }
    const value = Number(discountValue);
    if (!value || value <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim() || null,
      transactionType: transactionType.trim() || null,
      category: category.trim() || null,
      discountType,
      discountValue: value,
      minSubtotal: minSubtotal.trim() === "" ? null : Number(minSubtotal),
      maxDiscount: maxDiscount.trim() === "" ? null : Number(maxDiscount),
      usageLimit: usageLimit.trim() === "" ? null : Number(usageLimit),
      perUserLimit: perUserLimit.trim() === "" ? null : Number(perUserLimit),
      startDate: startDate || null,
      endDate: endDate || null,
      autoApply,
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
              sell
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg leading-tight">
              {promo ? "Edit Promotion" : "Create Promotion"}
            </h2>
            <p className="text-white/40 text-xs leading-tight mt-0.5">
              Leave transaction type/category blank to allow it anywhere.
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
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Sale, New Citizen Welcome"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
              Description{" "}
              <span className="normal-case font-normal text-white/25">
                — internal note, not shown to citizens
              </span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:border-accent/40 outline-none transition-all"
              >
                <option className="bg-[#0f111a] text-white" value="">
                  Any
                </option>
                <option className="bg-[#0f111a] text-white" value="event">
                  event
                </option>
                <option className="bg-[#0f111a] text-white" value="sponsorship">
                  sponsorship
                </option>
                <option className="bg-[#0f111a] text-white" value="asset">
                  asset (gear)
                </option>
                <option className="bg-[#0f111a] text-white" value="service">
                  service (talent)
                </option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Optional"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:border-accent/40 outline-none transition-all"
              >
                <option className="bg-[#0f111a] text-white" value="percentage">
                  Percentage
                </option>
                <option className="bg-[#0f111a] text-white" value="fixed">
                  Fixed amount
                </option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                {discountType === "percentage" ? "Percent Off" : "Amount Off (₱)"}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "e.g. 10" : "e.g. 200"}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                Min Spend (₱)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={minSubtotal}
                onChange={(e) => setMinSubtotal(e.target.value)}
                placeholder="Optional"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                Max Discount (₱)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="Optional cap"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                Total Usage Limit
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Unlimited"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                Per-Citizen Limit
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder-white/20 focus:border-accent/40 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent/40 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent/40 outline-none transition-all"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoApply}
              onChange={(e) => setAutoApply(e.target.checked)}
              className="mt-0.5 accent-accent"
            />
            <span>
              <span className="block text-sm font-semibold text-white">
                Apply automatically — no code needed
              </span>
              <span className="block text-white/40 text-xs mt-0.5">
                Every eligible citizen gets this discount at checkout without
                typing anything.
              </span>
            </span>
          </label>

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
              ) : promo ? (
                "Update Promotion"
              ) : (
                "Create Promotion"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AnalyticsPanel({ promotionId }: { promotionId: string }) {
  const [analytics, setAnalytics] = useState<PromotionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPromotionAnalytics(promotionId)
      .then((data) => {
        if (!cancelled) setAnalytics(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [promotionId]);

  if (loading) {
    return <p className="text-white/20 text-xs">Loading analytics…</p>;
  }
  if (!analytics || analytics.redemptionCount === 0) {
    return <p className="text-white/20 text-xs">No redemptions yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="bg-white/5 rounded-lg px-3 py-2">
        <div className="text-white/40">Times redeemed</div>
        <div className="text-white font-bold text-sm">
          {analytics.redemptionCount}
        </div>
      </div>
      <div className="bg-white/5 rounded-lg px-3 py-2">
        <div className="text-white/40">Total discount given</div>
        <div className="text-white font-bold text-sm">
          {formatCurrency(analytics.totalDiscountGiven)}
        </div>
      </div>
    </div>
  );
}

function VoucherPanel({
  promo,
  onChanged,
}: {
  promo: Promotion;
  onChanged: () => void;
}) {
  const [count, setCount] = useState("10");
  const [prefix, setPrefix] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);

  const handleGenerate = async () => {
    const n = Number(count);
    if (!n || n < 1) {
      toast.error("Enter how many codes to generate");
      return;
    }
    setGenerating(true);
    try {
      const vouchers = await generateVouchers(promo.id, n, prefix.trim() || undefined);
      toast.success(`Generated ${vouchers.length} voucher code(s).`);
      onChanged();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to generate codes.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast.success(`Copied ${code}`);
  };

  const handleToggle = async (voucher: Voucher) => {
    try {
      await setVoucherActive(voucher.id, !voucher.active);
      onChanged();
    } catch {
      toast.error("Failed to update voucher.");
    }
  };

  const handleImport = async () => {
    const codes = importText
      .split(/[\n,]/)
      .map((c) => c.trim())
      .filter(Boolean);
    if (codes.length === 0) {
      toast.error("Paste at least one code.");
      return;
    }
    setImporting(true);
    try {
      const result = await importVouchers(promo.id, codes);
      toast.success(
        result.skipped.length > 0
          ? `Imported ${result.created.length} code(s), skipped ${result.skipped.length} duplicate(s).`
          : `Imported ${result.created.length} code(s).`,
      );
      setImportText("");
      setShowImport(false);
      onChanged();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to import codes.");
    } finally {
      setImporting(false);
    }
  };

  // The auto-apply voucher is a hidden system anchor, never shown or typed —
  // see PromotionSvc.ensureAutoApplyVoucher.
  const visibleVouchers = (promo.vouchers ?? []).filter(
    (v) => !v.code.startsWith("AUTO-"),
  );

  if (promo.autoApply) {
    return (
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-white/40 text-xs">
          This applies automatically — no codes to generate or manage.
        </p>
        <div className="mt-3">
          <AnalyticsPanel promotionId={promo.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <div className="flex flex-wrap items-end gap-2 mb-3">
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-white/30 tracking-widest">
            Count
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-accent/40"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-white/30 tracking-widest">
            Prefix (optional)
          </label>
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="e.g. SUMMER"
            className="w-32 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-accent/40"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-3 py-1.5 rounded-lg bg-accent text-black font-bold text-xs hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
        >
          <Ticket size={13} />
          {generating ? "Generating…" : "Generate Codes"}
        </button>
        <button
          onClick={() => setShowImport((s) => !s)}
          className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-bold text-xs hover:bg-white/20 flex items-center gap-1.5"
        >
          <Upload size={13} />
          Import Codes
        </button>
      </div>

      {showImport && (
        <div className="mb-3 space-y-2">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste codes — one per line, or comma-separated"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-accent/40 font-mono"
          />
          <button
            onClick={handleImport}
            disabled={importing || !importText.trim()}
            className="px-3 py-1.5 rounded-lg bg-accent text-black font-bold text-xs hover:opacity-90 disabled:opacity-50"
          >
            {importing ? "Importing…" : "Import"}
          </button>
        </div>
      )}

      <div className="mb-3">
        <AnalyticsPanel promotionId={promo.id} />
      </div>

      {visibleVouchers.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {visibleVouchers.map((v) => (
            <div
              key={v.id}
              className={`flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg border text-[11px] font-mono ${
                v.active
                  ? "bg-white/5 border-white/10 text-white/70"
                  : "bg-white/[0.02] border-white/5 text-white/25 line-through"
              }`}
            >
              <span>{v.code}</span>
              {v._count && v._count.redemptions > 0 && (
                <span className="text-accent/70 no-underline">
                  ×{v._count.redemptions}
                </span>
              )}
              <button
                onClick={() => handleCopy(v.code)}
                className="p-0.5 hover:text-white"
                title="Copy code"
              >
                <Copy size={10} />
              </button>
              <button
                onClick={() => handleToggle(v)}
                className="p-0.5 hover:text-red-400"
                title={v.active ? "Deactivate" : "Reactivate"}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {v.active ? "toggle_on" : "toggle_off"}
                </span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/20 text-xs">No codes generated yet.</p>
      )}
    </div>
  );
}

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPromo, setEditPromo] = useState<Promotion | null>(null);
  const [saving, setSaving] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchPromotions(includeInactive);
      setPromotions(data);
    } catch {
      toast.error("Failed to load promotions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

  }, [includeInactive]);

  const handleCreate = () => {
    setEditPromo(null);
    setShowModal(true);
  };

  const handleEdit = (promo: Promotion) => {
    setEditPromo(promo);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this promotion? Its vouchers will stop working.")) return;
    try {
      await deletePromotion(id);
      toast.success("Promotion deactivated.");
      load();
    } catch {
      toast.error("Failed to deactivate promotion.");
    }
  };

  const handleSave = async (data: PromotionPayload) => {
    setSaving(true);
    try {
      if (editPromo) {
        await updatePromotion(editPromo.id, data);
        toast.success("Promotion updated.");
      } else {
        await createPromotion(data);
        toast.success("Promotion created.");
      }
      setShowModal(false);
      setEditPromo(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save promotion.");
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
            Promotions
          </h2>
          <p className="text-white/40 text-sm mt-0.5">
            Discounts citizens redeem with a voucher code at checkout.
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
            <span className="hidden sm:inline">New Promotion</span>
          </button>
        </div>
      </div>

      {promotions.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid gap-3">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className={`glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all group/card ${
                !promo.active ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === promo.id ? null : promo.id)
                  }
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-white text-base truncate">
                      {promo.name}
                    </h3>
                    {!promo.active && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-white/5 text-white/40 border border-white/10">
                        Deactivated
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                      {describeDiscount(promo)}
                    </span>
                    {promo.autoApply ? (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        Auto-apply
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-white/5 text-white/40 border border-white/10">
                        {(promo.vouchers ?? []).filter((v) => !v.code.startsWith("AUTO-")).length}{" "}
                        codes
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-sm mt-1.5">
                    {describeConstraints(promo)}
                  </p>
                  {(promo.startDate || promo.endDate) && (
                    <p className="text-white/25 text-[11px] mt-1.5">
                      {promo.startDate &&
                        `From ${new Date(promo.startDate).toLocaleDateString()}`}
                      {promo.startDate && promo.endDate && " — "}
                      {promo.endDate &&
                        `Until ${new Date(promo.endDate).toLocaleDateString()}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleEdit(promo)}
                    className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover/card:opacity-100"
                    title="Edit promotion"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      edit
                    </span>
                  </button>
                  {promo.active && (
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="p-2 rounded-xl bg-red-500/5 text-red-400/40 hover:text-red-400 hover:bg-red-500/15 transition-all opacity-0 group-hover/card:opacity-100"
                      title="Deactivate promotion"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {expandedId === promo.id && (
                <VoucherPanel promo={promo} onChanged={load} />
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PromotionModal
          promo={editPromo}
          onClose={() => {
            setShowModal(false);
            setEditPromo(null);
          }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
