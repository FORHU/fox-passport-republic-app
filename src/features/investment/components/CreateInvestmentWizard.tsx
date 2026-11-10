"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  InventoryCategory,
  TransportPolicy,
  createInvestment,
  fetchInvestmentById,
  updateInvestment,
} from "@/shared/api/investments";
import InvestmentLocationPicker from "./InvestmentLocationPicker";
import api from "@/shared/lib/axios";
import {
  searchVenues,
  type VenueSearchResult,
} from "@/shared/api/venues";
import { formatCurrency } from "@/shared/lib/currency";
import { StyledSelect } from "@/shared/components/ui/StyledSelect";
import { checkUploadFile, UPLOAD_ACCEPT } from "@/shared/lib/uploadRules";
import { BackButton } from "@/shared/components/ui/BackButton";
import { FieldControl, FieldError } from "@/shared/components/ui/FieldError";
import { getApiErrorMessage, uploadErrorMessage } from "@/shared/lib/apiError";
import { QUANTITY_MAX } from "@/shared/lib/limits";
import { cn } from "@/shared/lib/utils";
import { Skeleton, SkeletonGroup } from "@/shared/components/ui/skeleton";
import {
  FIELD_STEP,
  apiFieldErrors,
  firstInvalidStep,
  stepErrors,
  type InvestmentModality,
  type StepErrors,
  type WizardField,
} from "../utils/wizardValidation";

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

const DRAFT_STORAGE_KEY = "foxpassport_draft_investment_wizard";

// Input ids for the fields Step 2 can flag; each one's message is `<id>-error`.
const FIELD_ID: Partial<Record<WizardField, string>> = {
  title: "inv-title",
  inventoryCategory: "inv-category",
  quantityTotal: "inv-quantity",
  description: "inv-description",
  monetaryValue: "inv-capital",
  revenueSharePercent: "inv-revenue-share",
};

const INITIAL_FORM_STATE: WizardFormState = {
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
};

/**
 * With `editId`, the same steps edit an existing equipment hub: the modality
 * step is skipped, nothing is drafted to sessionStorage, and submit PATCHes.
 */
export default function CreateInvestmentWizard({
  editId,
}: { editId?: string } = {}) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  // Edit mode: the steps wait for the saved hub, so nothing typed into an
  // empty form is overwritten when it arrives.
  const [editLoading, setEditLoading] = useState<boolean>(!!editId);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [modality, setModality] =
    useState<InvestmentModality>("physical_inventory");
  const [venueQuery, setVenueQuery] = useState("");
  const [venueResults, setVenueResults] = useState<VenueSearchResult[]>([]);
  const [venueSearchLoading, setVenueSearchLoading] = useState(false);

  const [form, setForm] = useState<WizardFormState>(INITIAL_FORM_STATE);
  // The step whose Continue was refused: its errors show, and clear as they are fixed.
  const [blockedStep, setBlockedStep] = useState<number | null>(null);
  // The API's field errors from the last submit, with the values it rejected.
  const [serverErrors, setServerErrors] = useState<{
    errors: StepErrors;
    form: WizardFormState;
  } | null>(null);

  // Load saved draft from sessionStorage on initial client mount
  useEffect(() => {
    if (editId) return;
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.form) {
          setForm((prev) => ({ ...prev, ...parsed.form }));
        }
        if (parsed.modality) {
          setModality(parsed.modality);
        }
        if (typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= 4) {
          // A draft never reopens past a step that isn't complete.
          setStep(
            firstInvalidStep(
              { ...INITIAL_FORM_STATE, ...parsed.form },
              parsed.modality ?? "physical_inventory",
              parsed.step,
            ),
          );
        }
      }
    } catch {
      // Storage unavailable or disabled
    }
  }, [editId]);

  // Autosave current draft to sessionStorage
  useEffect(() => {
    if (editId) return;
    try {
      sessionStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ form, modality, step }),
      );
    } catch {
      // Quota exceeded or private browsing restrictions
    }
  }, [editId, form, modality, step]);

  // Edit mode: prefill from the saved hub and start at Equipment Details.
  useEffect(() => {
    if (!editId) return;
    fetchInvestmentById(editId)
      .then((inv) => {
        setModality("physical_inventory");
        setForm((prev) => ({
          ...prev,
          title: inv.title,
          description: inv.description,
          inventoryCategory: inv.inventoryCategory ?? prev.inventoryCategory,
          quantityTotal: inv.quantityTotal ?? prev.quantityTotal,
          itemCondition: inv.itemCondition ?? prev.itemCondition,
          usageTerms: inv.usageTerms ?? prev.usageTerms,
          transportPolicy: inv.transportPolicy ?? prev.transportPolicy,
          location: {
            lat: inv.lat ?? prev.location.lat,
            lng: inv.lng ?? prev.location.lng,
            address: inv.address ?? "",
            city: inv.city ?? "",
            state: inv.state ?? "",
            country: inv.country ?? prev.location.country,
            deliveryRadiusKm:
              inv.deliveryRadiusKm ?? prev.location.deliveryRadiusKm,
          },
          mediaUrls: inv.mediaUrls ?? [],
        }));
      })
      .catch(() => {
        toast.error("Could not load this hub.");
        router.push("/republic/investments");
      })
      .finally(() => setEditLoading(false));
  }, [editId, router]);

  // The modality can't change after creation, so step 1 is off-limits while
  // editing — this also catches the stepper and step 2's Back button.
  useEffect(() => {
    if (editId && step < 2) setStep(2);
  }, [editId, step]);

  const handleResetDraft = () => {
    if (window.confirm("Discard your current draft and reset all fields?")) {
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}
      setForm(INITIAL_FORM_STATE);
      setModality("physical_inventory");
      setStep(1);
      toast.info("Draft reset to defaults.");
    }
  };

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

  // Direct S3 file upload with MIME type and size guards
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const problem = checkUploadFile(file, "image");
    if (problem) {
      toast.error(problem);
      e.target.value = "";
      return;
    }

    setUploadingImage(true);
    try {
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
    } catch (err) {
      toast.error(uploadErrorMessage(err));
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // What to flag on screen: the refused step's own rules (live, so each message
  // clears once fixed), and the API's errors while the field keeps the value it
  // rejected.
  const shownErrors: StepErrors = {
    ...Object.fromEntries(
      Object.entries(serverErrors?.errors ?? {}).filter(
        ([f]) =>
          form[f as keyof WizardFormState] ===
          serverErrors?.form[f as keyof WizardFormState],
      ),
    ),
    ...(blockedStep === step ? stepErrors(form, modality, step) : {}),
  };

  // id, aria-invalid and aria-describedby for a field's input.
  const fieldProps = (field: WizardField) => ({
    id: FIELD_ID[field],
    "aria-invalid": shownErrors[field] ? true : undefined,
    "aria-describedby": shownErrors[field] ? `${FIELD_ID[field]}-error` : undefined,
  });

  const fieldMessage = (field: WizardField) => (
    <FieldError id={`${FIELD_ID[field]}-error`} message={shownErrors[field]} />
  );

  const focusField = (field: WizardField) => {
    window.setTimeout(() => {
      const el = document.getElementById(FIELD_ID[field] ?? "");
      el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
    }, 0);
  };

  // Whether `currentStep` can be left. If not, the wizard shows that step with
  // every problem flagged; what was typed stays as it is.
  const validateStep = (currentStep: number): boolean => {
    const errors = stepErrors(form, modality, currentStep);
    const fields = Object.keys(errors) as WizardField[];
    if (fields.length === 0) return true;

    setStep(currentStep);
    setBlockedStep(currentStep);
    toast.error(
      fields.length > 1
        ? "Fix the highlighted fields to continue."
        : errors[fields[0]]!,
    );
    focusField(fields[0]);
    return false;
  };

  const goToStep = (nextStep: number) => {
    if (nextStep > step) {
      for (let s = step; s < nextStep; s++) {
        if (!validateStep(s)) return;
      }
    }
    setStep(nextStep);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    if (!validateStep(3)) return;

    // Optional text left blank is not sent.
    const itemCondition = form.itemCondition.trim() || undefined;
    const usageTerms = form.usageTerms.trim() || undefined;

    setIsSubmitting(true);
    try {
      if (editId) {
        await updateInvestment(editId, {
          title: form.title,
          description: form.description,
          inventoryCategory: form.inventoryCategory,
          quantityTotal: form.quantityTotal,
          itemCondition,
          usageTerms,
          address: form.location.address || undefined,
          city: form.location.city || undefined,
          state: form.location.state || undefined,
          country: form.location.country || undefined,
          lat: form.location.lat,
          lng: form.location.lng,
          deliveryRadiusKm: form.location.deliveryRadiusKm,
          transportPolicy: form.transportPolicy,
          mediaUrls: form.mediaUrls,
        });
        toast.success("Hub updated.");
        router.push("/republic/investments");
        return;
      }

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
          itemCondition,
          monetaryValue: 0,
          usageTerms,
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

        toast.success("Equipment Inventory Hub registered & published on map!");
      }

      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}

      router.push("/republic?tab=partners");
    } catch (err) {
      // A field the API rejected is flagged on its step, which the wizard returns to.
      const rejected = apiFieldErrors(err);
      const fields = Object.keys(rejected) as WizardField[];
      if (fields.length > 0) {
        const back = Math.min(...fields.map((f) => FIELD_STEP[f]));
        setServerErrors({ errors: rejected, form });
        setStep(back);
        focusField(fields.find((f) => FIELD_STEP[f] === back)!);
      }
      toast.error(
        getApiErrorMessage(err, "Couldn't save your investment. Try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-white pb-28 selection:bg-amber-400 selection:text-black">
      {/* Sticky flow header — same structure as the Venue Studio header used
          in /venue-foxer/create-venue (back button, tool name + role badge, draft
          status), so the Mayor and Partner creation flows read as the same
          tool instead of one having a header and the other just blank
          padding at the top. */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-surface sticky top-0 z-20">
        <div className="flex items-center gap-4 min-w-0">
          <BackButton onClick={() => router.back()} />
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
              {editId ? "(Editing)" : "(Draft)"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!editId && (Boolean(form.title) || Boolean(form.description) || step > 1 || form.mediaUrls.length > 0) && (
            <button
              type="button"
              onClick={handleResetDraft}
              className="text-xs px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
            >
              Reset Draft
            </button>
          )}
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
            {editId ? "Edit Equipment Hub" : "Register Partner Investment"}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Deploy physical tools and supplies stored at your depot to power
            venues and events across the Republic.
          </p>
        </div>

        {editLoading && (
          <SkeletonGroup label="Loading equipment hub" className="space-y-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
            <Skeleton className="h-28 w-full rounded-xl" />
          </SkeletonGroup>
        )}

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
              onClick={() => (s.num <= step ? setStep(s.num) : goToStep(s.num))}
              className={`text-left pb-1 border-b-2 transition-all cursor-pointer ${
                step === s.num
                  ? "border-amber-400 text-amber-400 font-bold"
                  : step > s.num
                    ? "border-lime-400 text-lime-400"
                    : "border-transparent text-zinc-600 hover:text-zinc-400"
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
        {!editLoading && step === 1 && (
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
                    ? "bg-white/5 border-amber-400/80 ring-1 ring-amber-400"
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
                    ? "bg-white/5 border-amber-400/80 ring-1 ring-amber-400"
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
                    through the Republic, alongside the Venue Foxer.
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
                onClick={() => goToStep(2)}
                className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-black font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
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
        {!editLoading && step === 2 && modality === "venue_equity" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label
                htmlFor={FIELD_ID.title}
                className="text-xs font-bold text-zinc-300 uppercase tracking-wider block"
              >
                Agreement Title *
              </label>
              <FieldControl invalid={!!shownErrors.title}>
                <input
                  type="text"
                  {...fieldProps("title")}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Renovation Capital for Grand Ballroom"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 text-sm font-semibold",
                    shownErrors.title && "field-invalid",
                  )}
                />
              </FieldControl>
              {fieldMessage("title")}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor={FIELD_ID.monetaryValue}
                  className="text-xs font-bold text-zinc-300 uppercase tracking-wider block"
                >
                  Capital Pledged
                </label>
                <FieldControl invalid={!!shownErrors.monetaryValue}>
                  <input
                    type="number"
                    min="0"
                    {...fieldProps("monetaryValue")}
                    value={form.monetaryValue || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        monetaryValue: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-400 text-sm",
                      shownErrors.monetaryValue && "field-invalid",
                    )}
                  />
                </FieldControl>
                {fieldMessage("monetaryValue")}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={FIELD_ID.revenueSharePercent}
                  className="text-xs font-bold text-zinc-300 uppercase tracking-wider block"
                >
                  Your Revenue Share (%) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    {...fieldProps("revenueSharePercent")}
                    min={1}
                    max={100}
                    value={form.revenueSharePercent}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        revenueSharePercent: Math.min(100, Math.max(1, Number(e.target.value) || 1)),
                      })
                    }
                    className="flex-1 accent-amber-400"
                  />
                  <span className="w-14 text-right text-amber-300 font-black text-sm">
                    {form.revenueSharePercent}%
                  </span>
                </div>
                {fieldMessage("revenueSharePercent")}
                <p className="text-[11px] text-zinc-500">
                  This percentage of the venue&apos;s own payout comes to you
                  automatically each time it earns — the Venue Foxer keeps the
                  rest.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor={FIELD_ID.description}
                className="text-xs font-bold text-zinc-300 uppercase tracking-wider block"
              >
                Description & Terms *
              </label>
              <textarea
                rows={4}
                {...fieldProps("description")}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe what the capital covers and any conditions of the revenue-share agreement..."
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 text-sm",
                  shownErrors.description && "field-invalid",
                )}
              />
              {fieldMessage("description")}
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
                onClick={() => goToStep(3)}
                className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-black font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
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
        {!editLoading && step === 3 && modality === "venue_equity" && (
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
                Search by venue name. Your revenue share is carved out of that
                venue&apos;s own payout — this doesn&apos;t change what the
                citizen pays or the platform&apos;s fee.
              </p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={form.targetVenue ? form.targetVenue.name : venueQuery}
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
                onClick={() => goToStep(4)}
                disabled={!form.targetVenue}
                className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-black font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
        {!editLoading && step === 2 && modality === "physical_inventory" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor={FIELD_ID.title}
                className="text-xs font-bold text-zinc-300 uppercase tracking-wider block"
              >
                Equipment / Tool Name *
              </label>
              <FieldControl invalid={!!shownErrors.title}>
                <input
                  type="text"
                  {...fieldProps("title")}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 500 White Padded Banquet Chairs"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 text-sm font-semibold",
                    shownErrors.title && "field-invalid",
                  )}
                />
              </FieldControl>
              {fieldMessage("title")}
            </div>

            {/* Category Picker */}
            <div className="space-y-2">
              <label
                id="inv-category-label"
                className="text-xs font-bold text-zinc-300 uppercase tracking-wider block"
              >
                Tool / Inventory Category *
              </label>
              <div
                role="radiogroup"
                aria-labelledby="inv-category-label"
                tabIndex={-1}
                {...fieldProps("inventoryCategory")}
                className={cn(
                  "grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl focus:outline-none",
                  shownErrors.inventoryCategory && "ring-1 ring-red-400/70 p-1",
                )}
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    role="radio"
                    aria-checked={form.inventoryCategory === cat.id}
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
              {fieldMessage("inventoryCategory")}
            </div>

            {/* Quantity and Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor={FIELD_ID.quantityTotal}
                  className="text-xs font-bold text-zinc-300 uppercase tracking-wider block"
                >
                  Quantity Available in Depot *
                </label>
                <FieldControl invalid={!!shownErrors.quantityTotal}>
                  <input
                    type="number"
                    min="1"
                    max={QUANTITY_MAX}
                    {...fieldProps("quantityTotal")}
                    value={form.quantityTotal || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantityTotal: Math.max(1, parseInt(e.target.value, 10) || 1),
                      })
                    }
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-400 text-sm",
                      shownErrors.quantityTotal && "field-invalid",
                    )}
                  />
                </FieldControl>
                {fieldMessage("quantityTotal")}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Item Condition
                </label>
                <StyledSelect
                  value={form.itemCondition}
                  onChange={(v) => setForm({ ...form, itemCondition: v })}
                  options={[
                    { value: "mint", label: "Brand New / Mint Condition" },
                    { value: "good", label: "Good / Event-Ready" },
                    { value: "heavy_duty", label: "Heavy-Duty / Industrial" },
                  ]}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
            </div>

            {/* Terms & Transport Policy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="inv-usage-terms"
                  className="text-xs font-bold text-zinc-300 uppercase tracking-wider block"
                >
                  Usage / Resource Terms
                </label>
                <input
                  id="inv-usage-terms"
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
                <StyledSelect
                  value={form.transportPolicy}
                  onChange={(v) =>
                    setForm({ ...form, transportPolicy: v as any })
                  }
                  options={[
                    {
                      value: "self_pickup",
                      label: "Self-Pickup by Venue Foxer / Event Foxer",
                    },
                    {
                      value: "partner_delivers_free",
                      label: "Partner Delivers (Free within radius)",
                    },
                    {
                      value: "partner_delivers_fee",
                      label: "Partner Delivers (Flat Logistics Fee)",
                    },
                  ]}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor={FIELD_ID.description}
                className="text-xs font-bold text-zinc-300 uppercase tracking-wider block"
              >
                Description & Specifications *
              </label>
              <textarea
                rows={4}
                {...fieldProps("description")}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Include dimensions, stackability, power specs, or handling notes..."
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 text-sm",
                  shownErrors.description && "field-invalid",
                )}
              />
              {fieldMessage("description")}
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
                onClick={() => goToStep(3)}
                className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-black font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
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
        {!editLoading && step === 3 && modality === "physical_inventory" && (
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
              onChange={(loc) => setForm((f) => ({ ...f, location: loc }))}
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
                onClick={() => goToStep(4)}
                className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-black font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
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
        {!editLoading && step === 4 && (
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
                    accept={UPLOAD_ACCEPT.image}
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
            {!editId && (
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
            )}

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
                    <span className="text-white">{form.location.country}</span>
                  </div>
                  {form.location.city && (
                    <div>
                      City:{" "}
                      <span className="text-white">{form.location.city}</span>
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
                className="px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-black font-black text-sm flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting
                  ? "Submitting..."
                  : editId
                    ? "Save Changes"
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
