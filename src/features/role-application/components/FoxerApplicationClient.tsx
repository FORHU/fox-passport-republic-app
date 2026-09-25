"use client";

import React, { useState } from "react";
import { useApplyRole } from "@/features/role-application/hooks/useApplyRole";
import {
  Briefcase,
  Package,
  Tag,
  Hash,
  ArrowRight,
  UserCircle,
  Link as LinkIcon,
  BadgeCheck,
  Music2,
  ClipboardCheck,
  MapPin,
} from "lucide-react";
import RequireAuth from "@/shared/auth/RequireAuth";
import Link from "next/link";
import {
  KycDocumentSection,
  ORGANIZER_KYC_DOCUMENTS,
} from "./KycDocumentSection";
import SpecializationPicker from "./SpecializationPicker";
import { ApplicationFlowHeader } from "./ApplicationFlowHeader";

const SERVICE_CATEGORY_OPTIONS = [
  { value: "design", label: "Design" },
  { value: "catering", label: "Catering" },
  { value: "service_staff", label: "Service Staff" },
  { value: "other", label: "Other" },
];

const ASSET_CATEGORY_OPTIONS = [
  { value: "furnitures", label: "Furnitures" },
  { value: "sound_system", label: "Sound System" },
  { value: "decorations", label: "Decorations" },
  { value: "other", label: "Other" },
];

// entertainment stays a legacy value on ServiceCategory (existing rows are
// paused until reapproved as performerFoxer — see the 14 Sep migration) but
// isn't offered here; new performer listings use these granular categories.
const PERFORMER_CATEGORY_OPTIONS = [
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "dj", label: "DJ" },
  { value: "live_band", label: "Live Band" },
  { value: "mc", label: "MC / Host" },
];

// An Organizer's specializations are the kinds of events and venues they have
// helped run, so they draw on both the API's EventCategory and VenueCategory.
const ORGANIZER_CATEGORY_OPTIONS = [
  { value: "wedding", label: "Weddings" },
  { value: "birthday", label: "Birthdays" },
  { value: "corporate", label: "Corporate" },
  { value: "social", label: "Social" },
  { value: "indoor", label: "Indoor Venues" },
  { value: "outdoor", label: "Outdoor Venues" },
  { value: "hotel", label: "Hotels" },
  { value: "beach_resort", label: "Beach Resorts" },
  { value: "garden", label: "Gardens" },
];

type ProviderType = "asset" | "service" | "performer" | "organizer";

const ORGANIZER_ACCENT = "#e879f9";

export default function FoxerApplicationClient({
  initialType = "service",
}: {
  initialType?: ProviderType;
}) {
  const { mutate: applyRole, isPending } = useApplyRole();
  const [providerType, setProviderType] = useState<ProviderType>(initialType);

  // Asset Form State
  const [assetData, setAssetData] = useState({
    businessName: "",
    assetTypes: "",
    tinNumber: "",
    validId1FileId: "",
    nbiFileId: "",
    tinIdFileId: "",
    birPermitFileId: "",
    selfieFileId: "",
  });
  const [assetSpecializations, setAssetSpecializations] = useState<string[]>(
    [],
  );

  // Service Form State
  const [serviceData, setServiceData] = useState({
    serviceTypes: "",
    portfolioUrls: "",
    experience: "",
    nbiClearanceIdNumber: "",
    tinNumber: "",
    validId1FileId: "",
    nbiFileId: "",
    tinIdFileId: "",
    birPermitFileId: "",
    selfieFileId: "",
  });
  const [serviceSpecializations, setServiceSpecializations] = useState<
    string[]
  >([]);

  // Performer Form State — same shape as PerformerFoxerApplication, which
  // mirrors ServiceFoxerApplication (performerTypes instead of serviceTypes)
  const [performerData, setPerformerData] = useState({
    performerTypes: "",
    portfolioUrls: "",
    experience: "",
    nbiClearanceIdNumber: "",
    tinNumber: "",
    validId1FileId: "",
    nbiFileId: "",
    tinIdFileId: "",
    birPermitFileId: "",
    selfieFileId: "",
  });
  const [performerSpecializations, setPerformerSpecializations] = useState<
    string[]
  >([]);

  // Organizer Form State — mirrors the API's OrganizerApplication
  const [organizerData, setOrganizerData] = useState({
    bio: "",
    experience: "",
    location: "",
    validId1FileId: "",
    backgroundClearanceFileId: "",
    selfieFileId: "",
  });
  const [organizerSpecializations, setOrganizerSpecializations] = useState<
    string[]
  >([]);

  const handleFileUpload = (field: string, fileId: string) => {
    if (providerType === "organizer") {
      setOrganizerData((prev) => ({ ...prev, [field]: fileId }));
    } else if (providerType === "asset") {
      setAssetData((prev) => ({ ...prev, [field]: fileId }));
    } else if (providerType === "performer") {
      setPerformerData((prev) => ({ ...prev, [field]: fileId }));
    } else {
      setServiceData((prev) => ({ ...prev, [field]: fileId }));
    }
  };

  const handleAssetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssetData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServiceData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePerformerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerformerData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const DIGIT_FIELD_MAX_LENGTH: Record<string, number> = {
    nbiClearanceIdNumber: 18,
    tinNumber: 9,
  };

  const handleServiceDigitsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const digits = value
      .replace(/\D/g, "")
      .slice(0, DIGIT_FIELD_MAX_LENGTH[name]);
    setServiceData((prev) => ({ ...prev, [name]: digits }));
  };

  const handlePerformerDigitsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const digits = value
      .replace(/\D/g, "")
      .slice(0, DIGIT_FIELD_MAX_LENGTH[name]);
    setPerformerData((prev) => ({ ...prev, [name]: digits }));
  };

  const handleAssetTinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
    setAssetData((prev) => ({ ...prev, tinNumber: digits }));
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (digits === "") {
      setServiceData((prev) => ({ ...prev, experience: "" }));
      return;
    }
    const clamped = Math.min(100, Math.max(0, Number(digits)));
    setServiceData((prev) => ({ ...prev, experience: String(clamped) }));
  };

  const handlePerformerExperienceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (digits === "") {
      setPerformerData((prev) => ({ ...prev, experience: "" }));
      return;
    }
    const clamped = Math.min(100, Math.max(0, Number(digits)));
    setPerformerData((prev) => ({ ...prev, experience: String(clamped) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (providerType === "organizer") {
      applyRole({
        roleType: "organizer",
        data: {
          ...organizerData,
          experience: parseInt(organizerData.experience, 10),
          specializations: organizerSpecializations,
        },
      });
    } else if (providerType === "asset") {
      applyRole({
        roleType: "gearFoxer",
        data: {
          ...assetData,
          assetTypes: assetData.assetTypes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          specializations: assetSpecializations,
        },
      });
    } else if (providerType === "performer") {
      applyRole({
        roleType: "performerFoxer",
        data: {
          ...performerData,
          experience: parseInt(performerData.experience, 10),
          performerTypes: performerData.performerTypes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          portfolioUrls: performerData.portfolioUrls
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          specializations: performerSpecializations,
        },
      });
    } else {
      applyRole({
        roleType: "serviceFoxer",
        data: {
          ...serviceData,
          experience: parseInt(serviceData.experience, 10),
          serviceTypes: serviceData.serviceTypes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          portfolioUrls: serviceData.portfolioUrls
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          specializations: serviceSpecializations,
        },
      });
    }
  };

  const accent =
    providerType === "organizer"
      ? ORGANIZER_ACCENT
      : providerType === "asset"
      ? "#a78bfa"
      : providerType === "performer"
        ? "#f59e0b"
        : "#00d2ff";

  return (
    <RequireAuth>
      <ApplicationFlowHeader />
      <div className="min-h-screen bg-[#0f111a] flex flex-col items-center justify-center p-4 pt-24 pb-12 font-body">
        <div className="w-full max-w-2xl bg-[#1a1a24] rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Background Glow */}
          <div
            className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 blur-[100px] rounded-full pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: `${accent}1a` }}
          />

          <div className="mb-10 text-center relative z-10">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300"
              style={{
                backgroundColor: `${accent}33`,
                color: accent,
              }}
            >
              {providerType === "organizer" ? (
                <ClipboardCheck size={32} />
              ) : providerType === "asset" ? (
                <Package size={32} />
              ) : providerType === "performer" ? (
                <Music2 size={32} />
              ) : (
                <Briefcase size={32} />
              )}
            </div>
            {providerType === "organizer" ? (
              <>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                  Apply to be an{" "}
                  <span style={{ color: accent }}>Organizer</span>
                </h1>
                <p className="text-white/60">
                  Once approved, Mayors and Event Owners can invite you to help
                  run their venues and events.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                  Apply to be a{" "}
                  <span style={{ color: accent }}>Foxer</span>
                </h1>
                <p className="text-white/60">
                  Provide your professional details to start offering services,
                  equipment, or performances in FoxPassport.
                </p>
              </>
            )}
          </div>

          {/* Provider Type Toggle */}
          <div className="flex bg-white/5 p-1 rounded-xl mb-8 relative z-10">
            <button
              onClick={() => setProviderType("service")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                providerType === "service"
                  ? "bg-[#00d2ff] text-black shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Talent Foxer
            </button>
            <button
              onClick={() => setProviderType("performer")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                providerType === "performer"
                  ? "bg-[#f59e0b] text-black shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Performer
            </button>
            <button
              onClick={() => setProviderType("asset")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                providerType === "asset"
                  ? "bg-[#a78bfa] text-black shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Gear Provider
            </button>
            <button
              onClick={() => setProviderType("organizer")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                providerType === "organizer"
                  ? "bg-[#e879f9] text-black shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Organizer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {providerType === "organizer" ? (
              // --- ORGANIZER FORM ---
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    About You *
                  </label>
                  <textarea
                    required
                    name="bio"
                    rows={4}
                    value={organizerData.bio}
                    onChange={(e) =>
                      setOrganizerData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#e879f9]/50 focus:bg-white/10 transition-colors resize-none"
                    placeholder="The events and venues you've helped run, and what you did there."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    Years of Experience *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <UserCircle size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="experience"
                      value={organizerData.experience}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        setOrganizerData((prev) => ({
                          ...prev,
                          experience:
                            digits === ""
                              ? ""
                              : String(Math.min(100, Number(digits))),
                        }));
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#e879f9]/50 focus:bg-white/10 transition-colors"
                      placeholder="e.g. 3"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    Location *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <MapPin size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      name="location"
                      value={organizerData.location}
                      onChange={(e) =>
                        setOrganizerData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#e879f9]/50 focus:bg-white/10 transition-colors"
                      placeholder="City where you usually work"
                    />
                  </div>
                </div>

                <SpecializationPicker
                  options={ORGANIZER_CATEGORY_OPTIONS}
                  value={organizerSpecializations}
                  onChange={setOrganizerSpecializations}
                  accentColor={ORGANIZER_ACCENT}
                />

                <KycDocumentSection
                  onUpload={handleFileUpload}
                  documents={ORGANIZER_KYC_DOCUMENTS}
                  title="Identity Verification"
                  description="Organizers see guest lists and help run other people's venues and events, so we verify who you are before anyone can invite you."
                />
              </>
            ) : providerType === "service" ? (
              // --- SERVICE PROVIDER FORM ---
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    Service Types *
                  </label>
                  <p className="text-xs text-white/40 mb-1">
                    Comma-separated (e.g. Photography, DJ, Catering)
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <Tag size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      name="serviceTypes"
                      value={serviceData.serviceTypes}
                      onChange={handleServiceChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="Photography, Event Styling, DJ..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    Years of Experience *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <UserCircle size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="experience"
                      value={serviceData.experience}
                      onChange={handleExperienceChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="e.g. 3"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    Portfolio Links *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <LinkIcon size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      name="portfolioUrls"
                      value={serviceData.portfolioUrls}
                      onChange={handleServiceChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="https://instagram.com/..., https://myportfolio.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    NBI Clearance ID *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <BadgeCheck size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      name="nbiClearanceIdNumber"
                      maxLength={18}
                      value={serviceData.nbiClearanceIdNumber}
                      onChange={handleServiceDigitsChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="XXXX-XXXX-XXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    TIN Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <Hash size={18} />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="tinNumber"
                      maxLength={9}
                      value={serviceData.tinNumber}
                      onChange={handleServiceDigitsChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="000-000-000-000"
                    />
                  </div>
                </div>

                <SpecializationPicker
                  options={SERVICE_CATEGORY_OPTIONS}
                  value={serviceSpecializations}
                  onChange={setServiceSpecializations}
                  accentColor="#00d2ff"
                />

                <KycDocumentSection
                  onUpload={handleFileUpload}
                  title="Professional Verification"
                  description="As a Talent Foxer, we require a full background check including NBI clearance."
                />
              </>
            ) : providerType === "performer" ? (
              // --- PERFORMER PROVIDER FORM ---
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    Performer Types *
                  </label>
                  <p className="text-xs text-white/40 mb-1">
                    Comma-separated (e.g. DJ, Live Band, MC)
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <Tag size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      name="performerTypes"
                      value={performerData.performerTypes}
                      onChange={handlePerformerChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#f59e0b]/50 focus:bg-white/10 transition-colors"
                      placeholder="DJ, Live Band, Photography..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    Years of Experience *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <UserCircle size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="experience"
                      value={performerData.experience}
                      onChange={handlePerformerExperienceChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#f59e0b]/50 focus:bg-white/10 transition-colors"
                      placeholder="e.g. 3"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    Portfolio / Demo Reel Links *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <LinkIcon size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      name="portfolioUrls"
                      value={performerData.portfolioUrls}
                      onChange={handlePerformerChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#f59e0b]/50 focus:bg-white/10 transition-colors"
                      placeholder="https://youtube.com/..., https://soundcloud.com/..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    NBI Clearance ID *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <BadgeCheck size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      name="nbiClearanceIdNumber"
                      maxLength={18}
                      value={performerData.nbiClearanceIdNumber}
                      onChange={handlePerformerDigitsChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#f59e0b]/50 focus:bg-white/10 transition-colors"
                      placeholder="XXXX-XXXX-XXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    TIN Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <Hash size={18} />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="tinNumber"
                      maxLength={9}
                      value={performerData.tinNumber}
                      onChange={handlePerformerDigitsChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#f59e0b]/50 focus:bg-white/10 transition-colors"
                      placeholder="000-000-000-000"
                    />
                  </div>
                </div>

                <SpecializationPicker
                  options={PERFORMER_CATEGORY_OPTIONS}
                  value={performerSpecializations}
                  onChange={setPerformerSpecializations}
                  accentColor="#f59e0b"
                />

                <KycDocumentSection
                  onUpload={handleFileUpload}
                  title="Performer Verification"
                  description="As a performer, we require a full background check including NBI clearance."
                />
              </>
            ) : (
              // --- ASSET PROVIDER FORM ---
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    Business Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <Briefcase size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      name="businessName"
                      value={assetData.businessName}
                      onChange={handleAssetChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="Super Sounds Audio"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    Equipment Types *
                  </label>
                  <p className="text-xs text-white/40 mb-1">
                    Comma-separated (e.g. Speakers, Microphones, Lights)
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <Package size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      name="assetTypes"
                      value={assetData.assetTypes}
                      onChange={handleAssetChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="Sound Systems, Lighting Rigs..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    TIN Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                      <Hash size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      name="tinNumber"
                      maxLength={9}
                      value={assetData.tinNumber}
                      onChange={handleAssetTinChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d2ff]/50 focus:bg-white/10 transition-colors"
                      placeholder="000-000-000-000"
                    />
                  </div>
                </div>

                <SpecializationPicker
                  options={ASSET_CATEGORY_OPTIONS}
                  value={assetSpecializations}
                  onChange={setAssetSpecializations}
                  accentColor="#a78bfa"
                />

                <KycDocumentSection
                  onUpload={handleFileUpload}
                  title="Equipment Provider Verification"
                  description="Verify your identity to start listing assets on FoxPassport."
                />
              </>
            )}

            {/* Actions */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 items-center">
              <Link
                href="/onboarding"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-center font-medium"
              >
                Back
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex-1 flex items-center justify-center gap-2 text-black font-bold py-3 px-6 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: accent }}
              >
                {isPending ? "Submitting..." : "Submit Application"}
                {!isPending && <ArrowRight size={18} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </RequireAuth>
  );
}
