"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  InventoryCategory,
  TransportPolicy,
  createInvestment,
} from "@/shared/api/investments";
import InvestmentLocationPicker from "./InvestmentLocationPicker";
import api from "@/shared/lib/axios";
import {
  searchVenues,
  type VenueSearchResult,
} from "@/features/venue/api/venues";
import { formatCurrency } from "@/shared/lib/currency";

type InvestmentModality = "physical_inventory" | "venue_equity";

interface WizardFormState {
  title: string;
  description: string;
  inventoryCategory: InventoryCategory;
  quantityTotal: number;
  itemCondition: string;
  usageTerms: string;
  transportPolicy: TransportPolicy;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
    country: string;
    deliveryRadiusKm: number;
  };
  mediaUrls: string[];
  broadcastToFeed: boolean;
  // Revenue-share (venue_equity) fields — unused for physical_inventory
  targetVenue: VenueSearchResult | null;
  monetaryValue: number;
  revenueSharePercent: number;
}

const CATEGORY_OPTIONS: {
  id: InventoryCategory;
  label: string;
  icon: string;
}[] = [
  { id: "furniture_seating", label: "Chairs & Seating", icon: "chair" },
  { id: "tables_staging", label: "Tables & Staging", icon: "table_restaurant" },
  { id: "audio_visual", label: "Audio & AV Systems", icon: "speaker" },
  { id: "lighting_rigging", label: "Lighting & Rigging", icon: "light" },
  { id: "power_climate", label: "Generators & Power", icon: "bolt" },
  { id: "decor_props", label: "Decor & Props", icon: "celebration" },
  { id: "other", label: "General Equipment", icon: "construction" },
];

export default function CreateInvestmentWizard() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [modality, setModality] =
    useState<InvestmentModality>("physical_inventory");
  const [venueQuery, setVenueQuery] = useState("");
  const [venueResults, setVenueResults] = useState<VenueSearchResult[]>([]);
  const [venueSearchLoading, setVenueSearchLoading] = useState(false);

  const [form, setForm] = useState<WizardFormState>({
    title: "",
    description: "",
    inventoryCategory: "furniture_seating",
    quantityTotal: 100,
    itemCondition: "good",
    usageTerms: "Free for partner venues",
    transportPolicy: "self_pickup",
    location: {
      lat: 14.5995,
      lng: 120.9842,
      address: "",
      city: "",
      state: "",
      country: "Philippines",
      deliveryRadiusKm: 25,
    },
    mediaUrls: [],
    broadcastToFeed: true,
    targetVenue: null,
    monetaryValue: 0,
    revenueSharePercent: 10,
  });

  // Debounced venue name search for the revenue-share target picker.
  useEffect(() => {
    if (modality !== "venue_equity" || !venueQuery.trim()) {
      setVenueResults([]);
      return;
    }
    setVenueSearchLoading(true);
    const handle = setTimeout(() => {
      searchVenues(venueQuery)
        .then(setVenueResults)
        .catch(() => setVenueResults([]))
        .finally(() => setVenueSearchLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [venueQuery, modality]);

  // Direct S3 file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/files/upload-direct", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = res.data?.data?.url;
      if (url) {
        setForm((prev) => ({
          ...prev,
          mediaUrls: [...prev.mediaUrls, url],
        }));
        toast.success("Image uploaded successfully!");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error(
        modality === "venue_equity"
          ? "Please provide a title for this revenue-share agreement."
          : "Please provide an equipment name (e.g. 500 Chiavari Chairs).",
      );
      return;
    }
    if (!form.description.trim() || form.description.length < 10) {
      toast.error(
        "Please provide a description with specifications (at least 10 characters).",
      );
      return;
    }
    if (modality === "venue_equity") {
      if (!form.targetVenue) {
        toast.error("Please search for and select the venue you're backing.");
        return;
      }
      if (form.revenueSharePercent <= 0 || form.revenueSharePercent > 100) {
        toast.error("Revenue share must be between 1% and 100%.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (modality === "venue_equity") {
        await createInvestment({
          type: "venue_equity",
          title: form.title,
          description: form.description,
          monetaryValue: form.monetaryValue,
          revenueSharePercent: form.revenueSharePercent,
          usageTerms: "rev_share",
          targetVenueId: form.targetVenue!.id,
          mediaUrls: form.mediaUrls,
          broadcastToFeed: form.broadcastToFeed,
        });

        toast.success(
          `Revenue-share investment registered — ${form.revenueSharePercent}% of ${form.targetVenue!.name}'s venue payouts.`,
        );
      } else {
        await createInvestment({
          type: "physical_inventory",
          title: form.title,
          description: form.description,
          inventoryCategory: form.inventoryCategory,
          quantityTotal: form.quantityTotal,
          itemCondition: form.itemCondition,
          monetaryValue: 0,
          usageTerms: form.usageTerms,
          address: form.location.address || undefined,
          city: form.location.city || undefined,
          state: form.location.state || undefined,
          country: form.location.country || undefined,
          lat: form.location.lat,
          lng: form.location.lng,
          deliveryRadiusKm: form.location.deliveryRadiusKm,
          transportPolicy: form.transportPolicy,
          mediaUrls: form.mediaUrls,
          broadcastToFeed: form.broadcastToFeed,
        });

        toast.success(
          "Equipment Inventory Hub registered & published on map!",
        );
      }

      router.push("/republic?tab=partners");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to register investment",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-28 selection:bg-amber-400 selection:text-black">
      {/* Sticky flow header — same structure as the Venue Studio header used
          in /mayor/create-venue (back button, tool name + role badge, draft
          status), so the Mayor and Partner creation flows read as the same
          tool instead of one having a header and the other just blank
          padding at the top. */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-[#0f111a] sticky top-0 z-20">
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
          </button>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-lg flex items-center gap-2 truncate">
              Investment Studio
              <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 text-[9px] font-bold uppercase shrink-0">
                Partner Foxer
              </span>
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              {form.title ||
                (modality === "venue_equity"
                  ? "New Revenue Share"
                  : "New Equipment Hub")}{" "}
              (Draft)
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto space-y-8 pt-8 px-4 sm:px-6">
        {/* Page intro */}
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
            <span className="material-symbols-outlined text-[16px]">
              inventory_2
            </span>
            Partner Resource Pooling
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Register Partner Investment
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Deploy physical tools and supplies stored at your depot to power
            venues and events across the Republic.
          </p>
        </div>

        {/* 4 Step Indicator */}
        <div className="grid grid-cols-4 gap-2 border-b border-zinc-800 pb-4">
          {(modality === "venue_equity"
            ? [
                { num: 1, label: "Modality" },
                { num: 2, label: "Revenue Share Terms" },
                { num: 3, label: "Target Venue" },
                { num: 4, label: "Photos & Deploy" },
              ]
            : [
                { num: 1, label: "Modality" },
                { num: 2, label: "Equipment Details" },
                { num: 3, label: "Depot Location" },
                { num: 4, label: "Photos & Deploy" },
              ]
          ).map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => s.num < step && setStep(s.num)}
              className={`text-left pb-1 border-b-2 transition-all ${
                step === s.num
                  ? "border-amber-400 text-amber-400 font-bold"
                  : step > s.num
                    ? "border-lime-400 text-lime-400"
                    : "border-transparent text-zinc-600"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider font-extrabold">
                Step {s.num}
              </div>
              <div className="text-xs truncate">{s.label}</div>
            </button>
          ))}
        </div>

        {/* ── STEP 1: MODALITY PICKER ────────────────────────────────── */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Choose Investment Stream
              </h2>
              <span className="text-[11px] text-zinc-400">
                Both modalities are live
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Physical Equipment Inventory Hub */}
              <div
                onClick={() => setModality("physical_inventory")}
                className={`relative rounded-3xl p-6 border transition-all flex flex-col justify-between cursor-pointer ${
                  modality === "physical_inventory"
                    ? "bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-950 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-400"
                    : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 opacity-85 hover:opacity-100"
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-4">
                    <span className="material-symbols-outlined text-2xl">
                      chair
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mb-2">
                    Physical Equipment & Inventory Hub
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Store and pool physical tools (chairs, tables, staging,
                    sound, generators, LED walls) at your local depot. Nearby
                    partner venues can discover and request dispatch on the
                    interactive map.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-bold">
                  {modality === "physical_inventory" ? (
                    <>
                      <span className="text-amber-300">Selected Modality</span>
                      <span className="material-symbols-outlined text-amber-400">
                        check_circle
                      </span>
                    </>
                  ) : (
                    <span className="text-zinc-500">Tap to select</span>
                  )}
                </div>
              </div>

              {/* Option B: Financial Capital & Venue Equity (revenue share) */}
              <div
                onClick={() => setModality("venue_equity")}
                className={`relative rounded-3xl p-6 border transition-all flex flex-col justify-between cursor-pointer ${
                  modality === "venue_equity"
                    ? "bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-950 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-400"
                    : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 opacity-85 hover:opacity-100"
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-4">
                    <span className="material-symbols-outlined text-2xl">
                      payments
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mb-2">
                    Financial Capital & Venue Equity
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Pledge capital against a specific venue and set your own
                    revenue-share percentage — you&apos;re paid automatically
                    out of that venue&apos;s own payout whenever it earns
                    through the Republic, alongside the venue owner.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-bold">
                  {modality === "venue_equity" ? (
                    <>
                      <span className="text-amber-300">Selected Modality</span>
                      <span className="material-symbols-outlined text-amber-400">
                        check_circle
                      </span>
                    </>
                  ) : (
                    <span className="text-zinc-500">Tap to select</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
              >
                {modality === "venue_equity"
                  ? "Continue to Revenue Share Terms"
                  : "Continue to Equipment Details"}
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2 (venue_equity): REVENUE SHARE TERMS ──────────────── */}
        {step === 2 && modality === "venue_equity" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Agreement Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Renovation Capital for Grand Ballroom"
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Capital Pledged
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.monetaryValue}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      monetaryValue: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Your Revenue Share (%) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={form.revenueSharePercent}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        revenueSharePercent: Number(e.target.value),
                      })
                    }
                    className="flex-1 accent-amber-400"
                  />
                  <span className="w-14 text-right text-amber-300 font-black text-sm">
                    {form.revenueSharePercent}%
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  This percentage of the venue&apos;s own payout comes to you
                  automatically each time it earns — the venue owner keeps
                  the rest.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Description & Terms *
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe what the capital covers and any conditions of the revenue-share agreement..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
              >
                Choose Target Venue
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3 (venue_equity): TARGET VENUE SEARCH ──────────────── */}
        {step === 3 && modality === "venue_equity" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold text-white">
                Which venue are you backing?
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Search by venue name. Your revenue share is carved out of
                that venue&apos;s own payout — this doesn&apos;t change what
                the citizen pays or the platform&apos;s fee.
              </p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={
                  form.targetVenue
                    ? form.targetVenue.name
                    : venueQuery
                }
                onChange={(e) => {
                  setForm({ ...form, targetVenue: null });
                  setVenueQuery(e.target.value);
                }}
                placeholder="Search venues by name..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 text-sm font-semibold"
              />
              {!form.targetVenue && venueQuery.trim() && (
                <div className="absolute z-10 mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                  {venueSearchLoading ? (
                    <div className="p-3 text-xs text-zinc-500">
                      Searching...
                    </div>
                  ) : venueResults.length === 0 ? (
                    <div className="p-3 text-xs text-zinc-500">
                      No venues found.
                    </div>
                  ) : (
                    venueResults.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, targetVenue: v });
                          setVenueQuery("");
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-amber-400/10 text-sm text-white flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{v.name}</span>
                        {v.city && (
                          <span className="text-xs text-zinc-500 shrink-0">
                            {v.city}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {form.targetVenue && (
              <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white font-bold">
                  <span className="material-symbols-outlined text-amber-400 text-[18px]">
                    location_city
                  </span>
                  {form.targetVenue.name}
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, targetVenue: null })}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Change
                </button>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!form.targetVenue}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Review & Photos
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2 (physical_inventory): EQUIPMENT DETAILS & ATTRIBUTES ─ */}
        {step === 2 && modality === "physical_inventory" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Equipment / Tool Name *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 500 White Padded Banquet Chairs"
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 text-sm font-semibold"
              />
            </div>

            {/* Category Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Tool / Inventory Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, inventoryCategory: cat.id })
                    }
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all text-xs font-bold ${
                      form.inventoryCategory === cat.id
                        ? "bg-amber-400/15 border-amber-400 text-amber-300 shadow-sm"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {cat.icon}
                    </span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Quantity Available in Depot *
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.quantityTotal}
                  onChange={(e) =>
                    setForm({ ...form, quantityTotal: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Item Condition
                </label>
                <select
                  value={form.itemCondition}
                  onChange={(e) =>
                    setForm({ ...form, itemCondition: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-400 text-sm"
                >
                  <option value="mint">Brand New / Mint Condition</option>
                  <option value="good">Good / Event-Ready</option>
                  <option value="heavy_duty">Heavy-Duty / Industrial</option>
                </select>
              </div>
            </div>

            {/* Terms & Transport Policy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Usage / Resource Terms
                </label>
                <input
                  type="text"
                  value={form.usageTerms}
                  onChange={(e) =>
                    setForm({ ...form, usageTerms: e.target.value })
                  }
                  placeholder="e.g. Free for verified partner venues"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Dispatch & Delivery Policy
                </label>
                <select
                  value={form.transportPolicy}
                  onChange={(e) =>
                    setForm({ ...form, transportPolicy: e.target.value as any })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-400 text-sm"
                >
                  <option value="self_pickup">
                    Self-Pickup by Venue / Organizer
                  </option>
                  <option value="partner_delivers_free">
                    Partner Delivers (Free within radius)
                  </option>
                  <option value="partner_delivers_fee">
                    Partner Delivers (Flat Logistics Fee)
                  </option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Description & Specifications *
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Include dimensions, stackability, power specs, or handling notes..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
              >
                Set Location on Map
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3 (physical_inventory): DEPOT LOCATION ON MAP ────── */}
        {step === 3 && modality === "physical_inventory" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold text-white">
                Depot / Warehouse Location
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                The map automatically centers on your territory. Drag the gold
                pin to where your inventory is stored so nearby venues can find
                it when they lack tools.
              </p>
            </div>

            <InvestmentLocationPicker
              value={form.location}
              onChange={(loc) => setForm({ ...form, location: loc })}
              isPhysical={true}
            />

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
              >
                Review & Photos
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: PHOTOS & BROADCAST ────────────────────────────── */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold text-white">
                Photos & Feed Broadcast
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {modality === "venue_equity"
                  ? "Upload any supporting documents or photos for this agreement."
                  : "Upload real photos of your equipment depot or tools to build trust with organizers."}
              </p>
            </div>

            {/* Photo Upload Area */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                {form.mediaUrls.map((url, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 rounded-2xl overflow-hidden border border-zinc-800 group"
                  >
                    <img
                      src={url}
                      alt="Upload"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          mediaUrls: form.mediaUrls.filter(
                            (_, idx) => idx !== i,
                          ),
                        })
                      }
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        close
                      </span>
                    </button>
                  </div>
                ))}

                <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-amber-400/60 bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 hover:text-amber-300 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  <span className="material-symbols-outlined text-2xl">
                    {uploadingImage ? "hourglass_top" : "add_photo_alternate"}
                  </span>
                  <span className="text-[10px] font-bold mt-1">
                    {uploadingImage ? "Uploading..." : "Add Photo"}
                  </span>
                </label>
              </div>
            </div>

            {/* Feed Broadcast Switch */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <span className="material-symbols-outlined text-amber-400 text-[16px]">
                    campaign
                  </span>
                  Broadcast to Republic Foxer Partners Feed
                </div>
                <p className="text-[11px] text-zinc-400">
                  Instantly publish an announcement card in the Partners feed
                  and earn +50 Partner XP.
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.broadcastToFeed}
                onChange={(e) =>
                  setForm({ ...form, broadcastToFeed: e.target.checked })
                }
                className="w-5 h-5 accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Review Summary Card */}
            {modality === "venue_equity" ? (
              <div className="rounded-2xl bg-zinc-950 border border-zinc-800/80 p-5 space-y-3 text-xs">
                <div className="text-zinc-400 uppercase font-black text-[10px] tracking-wider">
                  Revenue Share Summary
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-white">
                  <span>{form.title}</span>
                  <span className="text-amber-400 font-black">
                    {form.revenueSharePercent}% share
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-zinc-400 pt-2 border-t border-zinc-900">
                  <div>
                    Target Venue:{" "}
                    <span className="text-white">
                      {form.targetVenue?.name ?? "—"}
                    </span>
                  </div>
                  <div>
                    Capital Pledged:{" "}
                    <span className="text-white">
                      {formatCurrency(form.monetaryValue)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-zinc-950 border border-zinc-800/80 p-5 space-y-3 text-xs">
                <div className="text-zinc-400 uppercase font-black text-[10px] tracking-wider">
                  Equipment Hub Summary
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-white">
                  <span>{form.title}</span>
                  <span className="text-amber-400 font-black">
                    {form.quantityTotal} units available
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-zinc-400 pt-2 border-t border-zinc-900">
                  <div>
                    Category:{" "}
                    <span className="text-white capitalize">
                      {form.inventoryCategory.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    Condition:{" "}
                    <span className="text-white capitalize">
                      {form.itemCondition}
                    </span>
                  </div>
                  <div>
                    Territory:{" "}
                    <span className="text-white">
                      {form.location.country}
                    </span>
                  </div>
                  {form.location.city && (
                    <div>
                      City:{" "}
                      <span className="text-white">
                        {form.location.city}
                      </span>
                    </div>
                  )}
                  <div>
                    Coverage:{" "}
                    <span className="text-amber-300 font-bold">
                      {form.location.deliveryRadiusKm} km radius
                    </span>
                  </div>
                  <div>
                    Dispatch:{" "}
                    <span className="text-white capitalize">
                      {form.transportPolicy.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting
                  ? "Submitting..."
                  : modality === "venue_equity"
                    ? "Register Revenue Share"
                    : "Deploy Equipment to Map"}
                <span className="material-symbols-outlined text-[18px]">
                  rocket_launch
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
