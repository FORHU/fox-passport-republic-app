/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useCheckoutStore } from "@/shared/store/useCheckoutStore";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { createMatch } from "@/features/match/api/matches";
import { toast } from "sonner";
import { toastRequireLogin } from "@/shared/lib/toast";
import {
  fetchFoxerById,
  type FoxerVenue,
  type FoxerAsset,
} from "@/shared/api/foxers";
import DateRangePicker, {
  diffDays,
  formatDate,
} from "@/shared/components/ui/DateRangePicker";
import { smartBack } from "@/shared/lib/navigation";

interface Foxer {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  avatar: string;
  styles: string[];
  styleDescriptions: Record<string, string>;
  styleImages: Record<string, string>;
  styleCategories: Record<string, string>;
  styleTemplateIds: Record<string, string>;
  styleVenues: Record<string, FoxerVenue>;
  styleAssets: Record<string, FoxerAsset>;
  basePrice: number;
}

interface ResourceOwner {
  name: string;
  avatar: string;
}

function getRoleLabel(roleType: string[]): string {
  if (roleType.includes("eventFoxer")) return "Event Foxer";
  if (roleType.includes("gearFoxer")) return "Equipment Foxer";
  if (roleType.includes("serviceFoxer")) return "Talent Foxer";
  return "Foxer";
}

function foxerAvatarUrl(imgId: string | null | undefined, name: string) {
  return imgId
    ? `https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${imgId}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ccff00&color=000`;
}

interface MatchConfigProps {
  fetchTemplate: (id: string) => Promise<any>;
}

const MatchConfig: React.FC<MatchConfigProps> = ({ fetchTemplate }) => {
  const router = useRouter();
  const { foxerId } = useParams();
  const { isAuthenticated, openLogin } = useAuthStore();
  const [step, setStep] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [guests, setGuests] = useState(2);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [durationPreset, setDurationPreset] = useState<
    "weekend" | "week" | "custom"
  >("custom");
  const [requestContent, setRequestContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foxer, setFoxer] = useState<Foxer | null>(null);
  const [isLoadingFoxers, setIsLoadingFoxers] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [detailsStyle, setDetailsStyle] = useState<string | null>(null);
  // `any` deliberately — `fetchTemplate` is a prop precisely so this feature
  // doesn't import `event`'s API client or types directly (see the prop's
  // own `Promise<any>` signature).
  const [templateDetail, setTemplateDetail] = useState<any>(null);
  const [templateDetailLoading, setTemplateDetailLoading] = useState(false);
  const [resourceOwners, setResourceOwners] = useState<
    Record<string, ResourceOwner>
  >({});

  useEffect(() => {
    if (!foxerId) return;
    fetchFoxerById(foxerId as string)
      .then((u) => {
        const isEventFoxer = u.roleType?.includes("eventFoxer");
        const templates = (u.eventTemplates ?? []).slice(0, 3);
        const venues = (u.venues ?? []).slice(0, 3);
        const assets = (u.assets ?? []).slice(0, 3);
        const services = (u.services ?? []).slice(0, 3);
        const hasTemplates = isEventFoxer && templates.length > 0;
        const hasOwnResources =
          isEventFoxer &&
          !hasTemplates &&
          (venues.length > 0 || assets.length > 0);
        // Signature experiences: event template names for EventFoxers (falling
        // back to their own venues + gear when they haven't built a template
        // yet), service names otherwise
        const styles: string[] = hasTemplates
          ? templates.map((t) => t.name)
          : hasOwnResources
            ? [...venues.map((v) => v.name), ...assets.map((a) => a.name)]
            : services.map((s) => s.name);
        const styleDescriptions: Record<string, string> = {};
        const styleImages: Record<string, string> = {};
        const styleCategories: Record<string, string> = {};
        const styleTemplateIds: Record<string, string> = {};
        const styleVenues: Record<string, FoxerVenue> = {};
        const styleAssets: Record<string, FoxerAsset> = {};
        if (hasTemplates) {
          templates.forEach((t) => {
            styleDescriptions[t.name] = t.description ?? "";
            styleImages[t.name] = t.images?.[0]?.url ?? "";
            styleCategories[t.name] = t.category ?? "";
            styleTemplateIds[t.name] = t.id;
          });
        } else if (hasOwnResources) {
          venues.forEach((v) => {
            styleDescriptions[v.name] =
              v.description ?? `A venue ${u.name} hosts events at.`;
            styleImages[v.name] = v.images?.[0]?.url ?? "";
            styleCategories[v.name] = v.category ?? "";
            styleVenues[v.name] = v;
          });
          assets.forEach((a) => {
            styleDescriptions[a.name] =
              a.description ?? `Gear ${u.name} has available.`;
            styleImages[a.name] = a.images?.[0]?.url ?? "";
            styleCategories[a.name] = a.category ?? "";
            styleAssets[a.name] = a;
          });
        } else {
          services.forEach((s) => {
            styleDescriptions[s.name] = s.description ?? "";
            styleImages[s.name] = (s as any).images?.[0]?.url ?? "";
            styleCategories[s.name] = s.category ?? "";
          });
        }
        const prices = services
          .map((s) => s.price)
          .filter((p: number) => p > 0);
        const basePrice = prices.length > 0 ? Math.min(...prices) : 0;
        setFoxer({
          id: u.id,
          name: u.name,
          role: getRoleLabel(u.roleType ?? []),
          rating: 0,
          reviews: 0,
          avatar: foxerAvatarUrl(u.imgId, u.name),
          styles: styles.length > 0 ? styles : [u.name + "'s Package"],
          styleDescriptions,
          styleImages,
          styleCategories,
          styleTemplateIds,
          styleVenues,
          styleAssets,
          basePrice,
        });
      })
      .catch(() => toast.error("Could not load foxer profile"))
      .finally(() => setIsLoadingFoxers(false));
  }, [foxerId]);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const applyDurationPreset = (preset: "weekend" | "week" | "custom") => {
    setDurationPreset(preset);
    if (preset === "custom") return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const base = startDate ? new Date(startDate + "T00:00:00") : today;
    const start = base < today ? today : base;
    const nights = preset === "weekend" ? 2 : 7;
    const end = new Date(start);
    end.setDate(end.getDate() + nights);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const openPackageDetails = async (style: string) => {
    const templateId = foxer?.styleTemplateIds[style];
    const venue = foxer?.styleVenues[style];
    const asset = foxer?.styleAssets[style];
    if (!templateId && !venue && !asset) return;

    setDetailsStyle(style);
    setTemplateDetail(null);

    // No real event template exists yet — this foxer's own gear stands in
    // for one, so build the detail view straight from data we already have.
    if (!templateId && asset && foxer) {
      const images = asset.images.map((img, i) => ({
        id: `${asset.id}-${i}`,
        url: img.url,
        name: asset.name,
      }));
      setTemplateDetail({
        id: asset.id,
        name: asset.name,
        description: asset.description ?? "",
        category: asset.category,
        isPublic: true,
        createdAt: "",
        images,
        templateAssets: [
          {
            asset: {
              id: asset.id,
              name: asset.name,
              category: asset.category,
              price: asset.price,
              billingRate: asset.billingRate,
              images: asset.images,
              ownerId: foxer.id,
            },
          },
        ],
      });
      setResourceOwners((prev) => ({
        ...prev,
        [foxer.id]: { name: foxer.name, avatar: foxer.avatar },
      }));
      return;
    }

    // No real event template exists yet — this foxer's own venue stands in
    // for one, so build the detail view straight from data we already have.
    if (!templateId && venue && foxer) {
      const images = venue.images.map((img, i) => ({
        id: `${venue.id}-${i}`,
        url: img.url,
        name: venue.name,
      }));
      setTemplateDetail({
        id: venue.id,
        name: venue.name,
        description: venue.description ?? "",
        category: venue.category,
        isPublic: true,
        createdAt: "",
        images,
        templateVenues: [
          {
            venue: {
              id: venue.id,
              name: venue.name,
              category: venue.category,
              price: venue.price,
              billingRate: venue.billingRate,
              images: venue.images,
              ownerId: foxer.id,
              mayorId: foxer.id,
            },
          },
        ],
      });
      setResourceOwners((prev) => ({
        ...prev,
        [foxer.id]: { name: foxer.name, avatar: foxer.avatar },
      }));
      return;
    }

    if (!templateId) return;
    setTemplateDetailLoading(true);
    try {
      const detail = await fetchTemplate(templateId);
      setTemplateDetail(detail);

      const ownerIds = Array.from(
        new Set(
          [
            ...(detail.templateVenues ?? []).map(
              (tv: any) => tv.venue?.mayorId,
            ),
            ...(detail.templateAssets ?? []).map(
              (ta: any) => ta.asset?.ownerId,
            ),
            ...(detail.templateServices ?? []).map(
              (ts: any) => ts.service?.ownerId,
            ),
          ].filter((id): id is string => Boolean(id)),
        ),
      );
      const missing = ownerIds.filter((id) => !resourceOwners[id]);
      if (missing.length > 0) {
        const fetched = await Promise.all(
          missing.map((id) => fetchFoxerById(id).catch(() => null)),
        );
        setResourceOwners((prev) => {
          const next = { ...prev };
          fetched.forEach((f, i) => {
            if (f) {
              next[missing[i]] = {
                name: f.name,
                avatar: foxerAvatarUrl(f.imgId, f.name),
              };
            }
          });
          return next;
        });
      }
    } catch {
      toast.error("Could not load package details");
    } finally {
      setTemplateDetailLoading(false);
    }
  };

  if (isLoadingFoxers || !foxer) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white/40">
          <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-sm font-display tracking-widest uppercase">
            Loading Foxer...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background bg-gradient-dark min-h-screen text-text-main font-body flex flex-col">
      <header className="fixed top-6 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl">
            <button
              onClick={() =>
                step > 1
                  ? prevStep()
                  : smartBack(router, `/foxer/${foxerId as string}`)
              }
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              <span className="hidden sm:inline">Back</span>
            </button>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/foxonlylogo.png"
                  alt="FoxPassport Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <h2 className="text-2xl font-display font-bold text-white">
                FoxPassport
              </h2>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-black/40 px-4 py-2 rounded-full border border-white/10">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 w-8 rounded-full transition-all duration-500 ${s <= step ? "bg-accent" : "bg-white/10"}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="grow pt-32 pb-28 sm:pb-20 px-4">
        <div className="mx-auto max-w-5xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                <div className="relative inline-block">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="h-14 w-14 rounded-full border-2 border-accent shadow-glow-accent overflow-hidden mx-auto"
                  >
                    <img
                      src={foxer.avatar}
                      alt={foxer.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <div className="absolute -bottom-0.5 -right-0.5 bg-accent text-black rounded-full p-0.5 shadow-lg">
                    <span className="material-symbols-outlined font-bold text-[12px]">
                      verified
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-xl md:text-2xl font-display font-bold text-white">
                    Match with {foxer.name}
                  </h1>
                  <p className="text-sm text-text-muted max-w-2xl mx-auto">
                    These are events{" "}
                    <span className="text-white font-bold">{foxer.name}</span>{" "}
                    has brought to life. Browse what they offer — they&apos;ll
                    tailor it entirely to you.
                  </p>
                </div>

                <div
                  className={`grid gap-4 ${foxer.styles.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : foxer.styles.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}
                >
                  {foxer.styles.map((style) => {
                    const img = foxer.styleImages[style];
                    const category = foxer.styleCategories[style];
                    return (
                      <button
                        key={style}
                        onClick={() => openPackageDetails(style)}
                        className="rounded-[2rem] border border-white/5 hover:border-accent/40 transition-all duration-300 text-left flex flex-col overflow-hidden group"
                      >
                        {/* Image */}
                        <div className="relative h-64 w-full overflow-hidden bg-white/5">
                          {img ? (
                            <img
                              src={img}
                              alt={style}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-4xl text-white/20">
                                celebration
                              </span>
                            </div>
                          )}
                          {category && (
                            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-black/60 text-white/70 backdrop-blur-sm">
                              {category}
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                              <span className="material-symbols-outlined text-[16px]">
                                visibility
                              </span>
                              View Details
                            </span>
                          </div>
                        </div>
                        {/* Info */}
                        <div className="p-5 space-y-1.5 bg-surface-highlight/30">
                          <p className="font-bold text-white text-sm leading-snug">
                            {style}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-accent/70">
                            Past Creation
                          </p>
                          <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
                            {foxer.styleDescriptions[style] ||
                              "A proven event format successfully organized by this foxer."}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-8 space-y-4 flex flex-col items-center">
                  <button
                    onClick={() => {
                      if (!selectedStyle && foxer.styles.length > 0) {
                        setSelectedStyle(foxer.styles[0]);
                      }
                      nextStep();
                    }}
                    className="btn-neon px-12 py-4 rounded-full bg-accent text-black font-bold transition-all"
                  >
                    I want something like this
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStyle("");
                      nextStep();
                    }}
                    className="text-sm text-white/40 hover:text-white/70 underline underline-offset-4 transition-colors"
                  >
                    I have my own idea in mind →
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="text-center space-y-4">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-[10px] font-bold uppercase tracking-widest">
                    Custom Event Setup
                  </span>
                  <h2 className="text-4xl font-display font-bold text-white">
                    The Logistics
                  </h2>
                  <p className="text-text-muted">
                    When and how many characters are in this story?
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                  <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest">
                          Duration Preset
                        </label>
                        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-full border border-white/10">
                          {(["weekend", "week", "custom"] as const).map(
                            (preset) => (
                              <button
                                key={preset}
                                onClick={() => applyDurationPreset(preset)}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all cursor-pointer ${
                                  durationPreset === preset
                                    ? "bg-accent text-black"
                                    : "text-white/50 hover:text-white"
                                }`}
                              >
                                {preset === "weekend"
                                  ? "Weekend"
                                  : preset === "week"
                                    ? "1 Week"
                                    : "Custom"}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                      <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onStartChange={(d) => {
                          setStartDate(d);
                          setDurationPreset("custom");
                        }}
                        onEndChange={(d) => {
                          setEndDate(d);
                          setDurationPreset("custom");
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <label className="block text-sm font-bold text-text-muted uppercase tracking-widest">
                            Total Guests
                          </label>
                          <p className="text-xs text-white/30 mt-0.5">
                            Guests joining this event
                          </p>
                        </div>
                        {selectedStyle &&
                          foxer.styleCategories[selectedStyle] && (
                            <span className="shrink-0 text-[10px] font-bold text-white/40 uppercase tracking-wide bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                              Recommended for{" "}
                              {foxer.styleCategories[selectedStyle]}
                            </span>
                          )}
                      </div>
                      <div className="flex items-center justify-between bg-black/40 p-2 rounded-2xl border border-white/10">
                        <button
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10"
                        >
                          <span className="material-symbols-outlined text-white">
                            remove
                          </span>
                        </button>
                        <div className="flex flex-col items-center">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={guests}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, "");
                              setGuests(
                                digits === "" ? 0 : parseInt(digits, 10),
                              );
                            }}
                            onBlur={() => setGuests((g) => Math.max(1, g))}
                            className="w-16 bg-transparent text-center text-lg font-display font-bold text-white outline-none"
                          />
                          <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold -mt-1">
                            Guests
                          </span>
                        </div>
                        <button
                          onClick={() => setGuests(guests + 1)}
                          className="h-12 w-12 rounded-xl bg-accent text-black flex items-center justify-center hover:opacity-90"
                        >
                          <span className="material-symbols-outlined">add</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-white/30 mt-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-accent/70">
                          verified_user
                        </span>
                        Free modifications up to 72 hours before your event
                        date.
                      </p>
                    </div>
                  </div>

                  {selectedStyle ? (
                    <div className="glass-card p-8 rounded-[2.5rem] bg-accent/5 border border-accent/20 space-y-5 h-full flex flex-col justify-center">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-accent/70">
                            Your Starting Point
                          </p>
                          <span className="text-[9px] font-bold uppercase tracking-wide text-white/40 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                            {foxer.styleTemplateIds[selectedStyle]
                              ? "Event Template"
                              : foxer.styleVenues[selectedStyle]
                                ? "Venue Base"
                                : foxer.styleAssets[selectedStyle]
                                  ? "Gear Rental"
                                  : "Service"}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white leading-snug">
                          {selectedStyle}
                        </h3>
                        <p className="text-xs text-white/40 mt-1 uppercase tracking-wide">
                          {foxer.styleCategories[selectedStyle]}
                        </p>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {foxer.name} will use this as your baseline and tailor
                        every detail — venue, timing, vibe — entirely to you.
                      </p>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">
                          Included in this phase
                        </p>
                        <ul className="space-y-3">
                          {[
                            {
                              title: "Venue sourcing & coordination",
                              desc: "Matched to your date, guest count, and vibe",
                            },
                            {
                              title: "Services, talent & equipment",
                              desc: "Catering, entertainment, and gear arranged for you",
                            },
                            {
                              title: "On-the-day management",
                              desc: "A dedicated lead ensures everything runs smoothly",
                            },
                          ].map(({ title, desc }) => (
                            <li key={title} className="flex gap-3">
                              <span className="material-symbols-outlined text-accent text-[18px] shrink-0 mt-0.5">
                                check_circle
                              </span>
                              <div>
                                <p className="text-sm font-bold text-white leading-snug">
                                  {title}
                                </p>
                                <p className="text-xs text-white/40 mt-0.5">
                                  {desc}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card p-8 rounded-[2.5rem] bg-white/3 border border-white/10 space-y-5 h-full flex flex-col justify-center">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">
                          Your Path
                        </p>
                        <h3 className="text-xl font-bold text-white">
                          Your vision. Their expertise.
                        </h3>
                      </div>
                      <p className="text-sm text-white/50 leading-relaxed">
                        In the next step, describe exactly what you&apos;re
                        imagining — theme, vibe, scale. {foxer.name} will review
                        it and craft a custom proposal built around your idea.
                      </p>
                      <div className="flex items-center gap-3 pt-2 p-4 rounded-2xl bg-black/20 border border-white/5">
                        <span className="material-symbols-outlined text-white/30">
                          lightbulb
                        </span>
                        <p className="text-xs text-white/40">
                          The more detail you give, the better the match.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    disabled={!startDate || !endDate}
                    onClick={nextStep}
                    className="btn-neon px-10 py-3.5 rounded-full bg-accent text-black font-bold disabled:opacity-50 flex items-center gap-2"
                  >
                    Check Availability
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-display font-bold text-white">
                    {selectedStyle ? "Make it yours" : "Paint the picture"}
                  </h2>
                  <p className="text-text-muted">
                    {selectedStyle ? (
                      <>
                        Tell {foxer.name} how you&apos;d like to put your own
                        spin on{" "}
                        <span className="text-white font-semibold">
                          {selectedStyle}
                        </span>
                        .
                      </>
                    ) : (
                      <>
                        Describe the event you have in mind — {foxer.name} will
                        take it from there.
                      </>
                    )}
                  </p>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem]">
                  <textarea
                    value={requestContent}
                    onChange={(e) => setRequestContent(e.target.value)}
                    placeholder={
                      selectedStyle
                        ? `e.g. I love the ${selectedStyle} concept — I'd like something similar but for a 50-person birthday, outdoors if possible, with a live band...`
                        : "e.g. I'm thinking a rooftop gathering for 60 people, Boho theme, sunset ceremony, live acoustic music, and a grazing table for food..."
                    }
                    className="w-full bg-black/20 border border-white/10 rounded-3xl p-6 text-white min-h-[200px] outline-none focus:border-accent transition-all leading-relaxed"
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={nextStep}
                    className="btn-neon px-12 py-4 rounded-full bg-accent text-black font-bold"
                  >
                    Review Match
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-display font-bold text-white">
                    Ready to Match?
                  </h2>
                  <p className="text-text-muted">
                    Review your custom experience request.
                  </p>
                </div>

                <div className="glass-card overflow-hidden rounded-[2.5rem] border-white/20">
                  <div className="p-8 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-6">
                      <img
                        src={foxer.avatar}
                        className="h-20 w-20 rounded-2xl object-cover"
                        alt=""
                      />
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {foxer.name}
                        </h3>
                        <p className="text-accent font-bold uppercase tracking-widest text-xs">
                          {foxer.role}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Based on</span>
                        <span className="text-white font-bold text-right max-w-[60%]">
                          {selectedStyle || "Own idea"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Date</span>
                        <span className="text-white font-bold text-right">
                          {startDate === endDate
                            ? formatDate(startDate)
                            : `${formatDate(startDate)} → ${formatDate(endDate)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Citizens</span>
                        <span className="text-white font-bold">
                          {guests} Guests
                        </span>
                      </div>
                      <div className="h-px bg-white/10"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold">
                          Estimated Cost
                        </span>
                        {foxer.basePrice > 0 ? (
                          <span className="text-2xl font-display font-bold text-accent">
                            ₱{(foxer.basePrice * guests).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-white/50 italic">
                            To be quoted
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5 overflow-hidden">
                      <label className="text-xs font-bold text-text-muted uppercase mb-4 block">
                        Your Note
                      </label>
                      <p className="text-sm italic text-gray-400 break-words whitespace-pre-wrap">
                        &quot;{requestContent || "No special requests added."}
                        &quot;
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 rounded-full border border-white/10 text-white"
                  >
                    Edit info
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={async () => {
                      if (!isAuthenticated) {
                        toastRequireLogin(
                          "Please log in to send this request.",
                        );
                        openLogin();
                        return;
                      }
                      try {
                        setIsSubmitting(true);
                        // 1. Create the match request on backend
                        const response = await createMatch({
                          foxerId: foxer.id,
                          style: selectedStyle || "Own idea",
                          date: startDate,
                          endDate: endDate,
                          guestCount: guests,
                          requestContent: requestContent,
                          totalAmount: foxer.basePrice * guests,
                        });

                        if (response.clientSecret) {
                          // Known price — go straight to payment
                          useCheckoutStore.getState().setConfig({
                            venueId: foxer.id.toString(),
                            venueName: `${foxer.name} - ${selectedStyle || "Own idea"}`,
                            venueImage: foxer.avatar,
                            checkInDate: startDate || null,
                            checkInTime: "09:00 PM",
                            nights: diffDays(startDate, endDate),
                            totalAmount: foxer.basePrice * guests,
                            guestCount: guests,
                          });
                          useCheckoutStore
                            .getState()
                            .setDraftIds(
                              response.bookingId,
                              response.bookingId,
                            );
                          useCheckoutStore
                            .getState()
                            .setClientSecret(response.clientSecret);
                          toast.success(
                            "Match request created! Proceeding to payment...",
                          );
                          router.push("/checkout");
                        } else {
                          // Price TBD — match request sent, foxer will follow up
                          setShowSuccessModal(true);
                        }
                      } catch (error: any) {
                        toast.error(
                          error.response?.data?.message ||
                            "Failed to create match request",
                        );
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="btn-neon px-12 py-4 rounded-full bg-accent text-black font-bold shadow-glow-accent disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Creating Request..."
                      : foxer.basePrice > 0
                        ? "Send Match Request & Pay"
                        : "Send Match Request"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {detailsStyle && foxer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-999 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setDetailsStyle(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f111a] border border-white/10 rounded-[2rem] max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4 p-8 pb-0">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent/70 mb-1">
                    Past Creation
                  </p>
                  <h3 className="text-2xl font-display font-bold text-white leading-snug">
                    {detailsStyle}
                  </h3>
                </div>
                <button
                  onClick={() => setDetailsStyle(null)}
                  className="shrink-0 h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-8 py-5 space-y-5">
                {templateDetailLoading && (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                  </div>
                )}

                {!templateDetailLoading && templateDetail && (
                  <div className="space-y-5">
                    {templateDetail.images?.[0]?.url && (
                      <div className="h-72 w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                        <img
                          src={templateDetail.images[0].url}
                          alt={detailsStyle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                      {templateDetail.description ||
                        `The venue, services, and equipment ${foxer.name} lined up for this package — each supplied by the Foxer who owns it.`}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {templateDetail.category && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/5 text-white/60 border border-white/10">
                          {templateDetail.category}
                        </span>
                      )}
                      {(templateDetail.targetCity ||
                        templateDetail.targetState) && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/5 text-white/60 border border-white/10">
                          {[
                            templateDetail.targetCity,
                            templateDetail.targetState,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                      {templateDetail.maxAttendees && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/5 text-white/60 border border-white/10">
                          Up to {templateDetail.maxAttendees} guests
                        </span>
                      )}
                      {!!templateDetail.estimatedTotal && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-accent/10 text-accent border border-accent/20">
                          ~₱{templateDetail.estimatedTotal.toLocaleString()}{" "}
                          estimated
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {!templateDetailLoading && templateDetail && (
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                    What&apos;s Included
                  </p>
                )}

                {!templateDetailLoading &&
                  templateDetail &&
                  [
                    {
                      label: "Venue",
                      items: (templateDetail.templateVenues ?? [])
                        .map((tv: any) => tv.venue)
                        .filter(Boolean)
                        .map((v: any) => ({ ...v, ownerId: v.mayorId })),
                    },
                    {
                      label: "Services",
                      items: (templateDetail.templateServices ?? [])
                        .map((ts: any) => ts.service)
                        .filter(Boolean),
                    },
                    {
                      label: "Equipment",
                      items: (templateDetail.templateAssets ?? [])
                        .map((ta: any) => ta.asset)
                        .filter(Boolean),
                    },
                  ].map(({ label, items }) =>
                    items.length > 0 ? (
                      <div key={label} className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">
                          {label}
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {items.map((item: any) => {
                            const owner = resourceOwners[item.ownerId];
                            return (
                              <div
                                key={item.id}
                                className="flex gap-3 p-3 rounded-2xl bg-white/3 border border-white/5"
                              >
                                <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-white/5">
                                  {item.images?.[0]?.url ? (
                                    <img
                                      src={item.images[0].url}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="material-symbols-outlined text-white/20 text-xl">
                                        category
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-white truncate">
                                    {item.name}
                                  </p>
                                  <p className="text-[10px] uppercase tracking-wide text-accent/70">
                                    {item.category}
                                  </p>
                                  {item.price > 0 && (
                                    <p className="text-xs text-white/50 mt-0.5">
                                      ₱{item.price.toLocaleString()}
                                      {item.billingRate
                                        ? ` / ${item.billingRate}`
                                        : ""}
                                    </p>
                                  )}
                                  <p className="text-[10px] text-white/30 mt-1 truncate">
                                    Supplied by {owner?.name ?? "another Foxer"}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null,
                  )}

                {!templateDetailLoading &&
                  templateDetail &&
                  (templateDetail.templateVenues ?? []).length === 0 &&
                  (templateDetail.templateServices ?? []).length === 0 &&
                  (templateDetail.templateAssets ?? []).length === 0 && (
                    <p className="text-sm text-white/40 text-center py-4">
                      This package doesn&apos;t have any venue, service, or
                      equipment connections attached yet.
                    </p>
                  )}
              </div>

              <div className="flex justify-center gap-3 p-6 border-t border-white/10 shrink-0">
                <button
                  onClick={() => setDetailsStyle(null)}
                  className="px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white text-sm font-bold"
                >
                  Keep Browsing
                </button>
                <button
                  onClick={() => {
                    if (detailsStyle) setSelectedStyle(detailsStyle);
                    setDetailsStyle(null);
                    nextStep();
                  }}
                  className="btn-neon px-6 py-2.5 rounded-full bg-accent text-black font-bold text-sm"
                >
                  I want something like this
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-999 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => {
              setShowSuccessModal(false);
              router.push("/");
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f111a] border border-white/10 rounded-[2rem] p-8 max-w-md w-full space-y-6 text-center"
            >
              <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-accent text-4xl">
                  check_circle
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-bold text-white">
                  Match Request Sent!
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {foxer.name} will review your request and reach out with a
                  custom quote.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/");
                }}
                className="btn-neon w-full py-4 rounded-full bg-accent text-black font-bold hover:opacity-90 active:scale-95 transition-all"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchConfig;
