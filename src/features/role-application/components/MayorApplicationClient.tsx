"use client";

import React, { useState } from "react";
import { useApplyRole } from "@/features/role-application/hooks/useApplyRole";
import { Building2, Phone, MapPin, Hash, AlignLeft } from "lucide-react";
import Link from "next/link";
import { KycDocumentSection, FOXER_KYC_DOCUMENTS } from "./KycDocumentSection";
import SpecializationPicker from "./SpecializationPicker";
import { ApplicationWizard, WizardStep } from "./ApplicationWizard";

const VENUE_CATEGORY_OPTIONS = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "mix", label: "Indoor/Outdoor Mix" },
  { value: "hotel", label: "Hotel" },
  { value: "beach_resort", label: "Beach Resort" },
  { value: "garden", label: "Garden" },
  { value: "other", label: "Other" },
];

const ACCENT = "#ccff00";

const LABEL = "text-sm font-bold text-white/80 uppercase tracking-wider";
const INPUT =
  "w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-colors";
const ICON =
  "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40";

export default function MayorApplicationClient() {
  const { mutate: applyRole, isPending } = useApplyRole();

  const [formData, setFormData] = useState({
    businessName: "",
    contactNumber: "",
    address: "",
    tinNumber: "",
    description: "",
    validId1FileId: "",
    nbiFileId: "",
    tinIdFileId: "",
    birPermitFileId: "",
    selfieFileId: "",
  });
  const [specializations, setSpecializations] = useState<string[]>([]);

  const handleFileUpload = (field: string, fileId: string) => {
    setFormData((prev) => ({ ...prev, [field]: fileId }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const uploaded = FOXER_KYC_DOCUMENTS.filter(
    (d) => formData[d.field as keyof typeof formData],
  ).length;

  const specializationLabels = specializations
    .map((v) => VENUE_CATEGORY_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .join(", ");

  return (
    <ApplicationWizard
      accent={ACCENT}
      icon={<Building2 size={32} />}
      title={
        <>
          Apply to be a <span style={{ color: ACCENT }}>Venue Foxer</span>
        </>
      }
      subtitle="Provide your details to start listing and managing venues in the FoxPassport ecosystem."
      // Every other role application is its own page too — this is the one
      // place a venueFoxer applicant would otherwise be stuck.
      intro={
        <p className="text-center text-xs text-white/40">
          Looking for a different role?{" "}
          <Link
            href="/foxer/apply"
            className="text-white/70 underline hover:text-white"
          >
            Talent, Gear, Performer, or Organizer
          </Link>
          ,{" "}
          <Link
            href="/creator-dashboard/apply"
            className="text-white/70 underline hover:text-white"
          >
            Event Foxer
          </Link>
          , or{" "}
          <Link
            href="/foxer/apply-investor"
            className="text-white/70 underline hover:text-white"
          >
            Investor
          </Link>
          .
        </p>
      }
      summary={[
        { label: "Business / venue name", value: formData.businessName },
        { label: "Contact number", value: formData.contactNumber },
        { label: "Address", value: formData.address },
        { label: "TIN number", value: formData.tinNumber },
        { label: "Description", value: formData.description },
        { label: "Specializations", value: specializationLabels },
        {
          label: "Identity documents",
          value: `${uploaded} of ${FOXER_KYC_DOCUMENTS.length} uploaded`,
        },
      ]}
      agreement="By submitting this application, you confirm the details are accurate and agree to FoxPassport's Venue Foxer policies. Your application will be reviewed by our team."
      isPending={isPending}
      onSubmit={() =>
        applyRole({
          roleType: "venueFoxer",
          data: { ...formData, specializations },
        })
      }
    >
      <WizardStep
        label="Your venue"
        title="Your business"
        description="Who you are and where your venues are."
      >
        <div className="space-y-2">
          <label className={LABEL}>Business / Venue Name *</label>
          <div className="relative">
            <div className={ICON}>
              <Building2 size={18} />
            </div>
            <input
              required
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className={INPUT}
              placeholder="The Neon Lounge"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={LABEL}>Contact Number *</label>
          <div className="relative">
            <div className={ICON}>
              <Phone size={18} />
            </div>
            <input
              required
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className={INPUT}
              placeholder="+63 900 000 0000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={LABEL}>Complete Address *</label>
          <div className="relative">
            <div className={ICON}>
              <MapPin size={18} />
            </div>
            <input
              required
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={INPUT}
              placeholder="123 Makati Ave, Metro Manila"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={LABEL}>TIN Number *</label>
          <div className="relative">
            <div className={ICON}>
              <Hash size={18} />
            </div>
            <input
              required
              type="text"
              name="tinNumber"
              value={formData.tinNumber}
              onChange={handleChange}
              className={INPUT}
              placeholder="000-000-000-000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className={LABEL}>Description (Optional)</label>
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-3 flex items-start pl-4 text-white/40">
              <AlignLeft size={18} />
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`${INPUT} resize-none`}
              placeholder="Tell us a bit about your spaces and what makes them unique..."
            />
          </div>
        </div>

        <SpecializationPicker
          options={VENUE_CATEGORY_OPTIONS}
          value={specializations}
          onChange={setSpecializations}
          accentColor={ACCENT}
        />
      </WizardStep>

      <WizardStep
        label="Documents"
        title="Verify your business"
        description="Upload each document marked with an asterisk. Your files are private."
        validate={() =>
          uploaded < FOXER_KYC_DOCUMENTS.length
            ? "Upload all the required documents before continuing."
            : null
        }
      >
        <KycDocumentSection onUpload={handleFileUpload} compact />
      </WizardStep>
    </ApplicationWizard>
  );
}
