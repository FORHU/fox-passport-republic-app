"use client";

import React, { useState } from "react";
import { useApplyRole } from "@/features/role-application/hooks/useApplyRole";
import { Globe, ShieldCheck, MapPin, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import FileUploader from "@/shared/components/layout/FileUploader";
import { KycDocumentSection, FOXER_KYC_DOCUMENTS } from "./KycDocumentSection";
import SpecializationPicker from "./SpecializationPicker";
import { ApplicationWizard, WizardStep } from "./ApplicationWizard";
import {
  CascadingLocationFields,
  type LocationValue,
} from "@/shared/components/ui/CascadingLocationFields";
import { FieldControl, FieldError } from "@/shared/components/ui/FieldError";
import { yearsOfExperienceError } from "../utils/yearsOfExperience";
import {
  portfolioUrlsError,
  splitPortfolioUrls,
} from "@/shared/lib/portfolioUrls";

const EVENT_CATEGORY_OPTIONS = [
  { value: "corporate", label: "Corporate" },
  { value: "birthday", label: "Birthday" },
  { value: "wedding", label: "Wedding" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
];

const ACCENT = "#5C62D6";

const LABEL = "text-sm font-bold text-white/80 uppercase tracking-wider";
const INPUT =
  "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#5C62D6]/50 focus:bg-white/10 transition-colors";

export default function HostApplicationClient() {
  const { mutate: applyRole, isPending } = useApplyRole();
  // Picked as country → state → city; saved as one "City, State, Country"
  // string in `formData.location`, which is what the application stores.
  const [place, setPlace] = useState<LocationValue>({
    country: "",
    state: "",
    city: "",
  });
  const [formData, setFormData] = useState({
    bio: "",
    experience: "",
    location: "",
    validId1FileId: "",
    nbiFileId: "",
    tinIdFileId: "",
    birPermitFileId: "",
    selfieFileId: "",
    portfolioFileId: "",
    portfolioUrls: "",
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

  // Kept as typed and checked instead: stripping non-digits turned "2.5" into
  // "25" (app#327).
  const experienceError = yearsOfExperienceError(formData.experience);
  const linksError = portfolioUrlsError(formData.portfolioUrls);

  const uploaded = FOXER_KYC_DOCUMENTS.filter(
    (d) => formData[d.field as keyof typeof formData],
  ).length;

  const specializationLabels = specializations
    .map((v) => EVENT_CATEGORY_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .join(", ");

  return (
    <ApplicationWizard
      accent={ACCENT}
      icon={<Globe size={32} />}
      title={
        <>
          Become an <span style={{ color: ACCENT }}>Event Foxer</span>
        </>
      }
      subtitle="Event Foxers use venues provided by Venue Foxers to create unforgettable experiences."
      // Every other role application is its own page too — this is the one
      // place an eventFoxer applicant would otherwise be stuck.
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
            href="/venue-foxer/apply"
            className="text-white/70 underline hover:text-white"
          >
            Venue Foxer
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
        { label: "About you", value: formData.bio },
        { label: "Base location", value: formData.location },
        {
          label: "Years of experience",
          value: formData.experience,
        },
        { label: "Specializations", value: specializationLabels },
        {
          label: "Identity documents",
          value: `${uploaded} of ${FOXER_KYC_DOCUMENTS.length} uploaded`,
        },
        {
          label: "Portfolio / resume",
          value: formData.portfolioFileId ? "Uploaded" : "",
        },
        {
          label: "Portfolio links",
          value: splitPortfolioUrls(formData.portfolioUrls).join(", "),
        },
      ]}
      agreement="By submitting this application, you agree to comply with FoxPassport's Event Foxer policies and quality standards. Your application will be reviewed by our team."
      isPending={isPending}
      onSubmit={() =>
        applyRole({
          roleType: "eventFoxer",
          data: {
            ...formData,
            experience: formData.experience.trim(),
            portfolioUrls: splitPortfolioUrls(formData.portfolioUrls),
            specializations,
          },
        })
      }
    >
      <WizardStep
        label="About you"
        title="About you"
        description="Your background in organizing events, and where you're based."
        validate={() =>
          experienceError ??
          (place.city
            ? null
            : "Choose your base location — country, state and city.")
        }
      >
        <div className="space-y-2">
          <label className={LABEL}>Bio / Experience *</label>
          <textarea
            required
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className={`${INPUT} resize-none`}
            placeholder="Tell us about your background in event organizing..."
          />
        </div>

        <div className="space-y-2">
          <label className={`${LABEL} flex items-center gap-2`}>
            <MapPin size={16} className="text-white/40" />
            Base Location *
          </label>
          <CascadingLocationFields
            value={place}
            onChange={(next) => {
              setPlace(next);
              setFormData((prev) => ({
                ...prev,
                location: [next.city, next.state, next.country]
                  .filter(Boolean)
                  .join(", "),
              }));
            }}
          />
        </div>

        <div className="space-y-2">
          <label className={LABEL}>Years of Experience</label>
          <FieldControl invalid={!!experienceError}>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
              <ShieldCheck size={18} />
            </div>
            <input
              type="text"
              inputMode="numeric"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              aria-invalid={experienceError ? true : undefined}
              aria-describedby={
                experienceError ? "experience-error" : undefined
              }
              className={`${INPUT} pl-12 ${experienceError ? "field-invalid pr-10" : ""}`}
              placeholder="e.g. 5"
            />
          </FieldControl>
          <FieldError id="experience-error" message={experienceError} />
        </div>

        <SpecializationPicker
          options={EVENT_CATEGORY_OPTIONS}
          value={specializations}
          onChange={setSpecializations}
          accentColor={ACCENT}
        />
      </WizardStep>

      <WizardStep
        label="Documents"
        title="Verify your identity"
        description="Upload each document marked with an asterisk. Your files are private."
        validate={() =>
          uploaded < FOXER_KYC_DOCUMENTS.length
            ? "Upload all the required documents before continuing."
            : linksError
        }
      >
        <KycDocumentSection onUpload={handleFileUpload} compact />

        <FileUploader
          label="Portfolio / Resume (Optional)"
          purpose="portfolio"
          onUploadComplete={(id) => handleFileUpload("portfolioFileId", id)}
          onFileCleared={() => handleFileUpload("portfolioFileId", "")}
        />

        <div className="space-y-2">
          <label htmlFor="portfolio-urls" className={LABEL}>
            Portfolio Links (Optional)
          </label>
          <p className="text-xs text-white/40">
            Already have your work online? Add up to 5 full web addresses,
            separated by commas.
          </p>
          <FieldControl invalid={!!linksError}>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
              <LinkIcon size={18} />
            </div>
            <input
              id="portfolio-urls"
              type="text"
              inputMode="url"
              name="portfolioUrls"
              value={formData.portfolioUrls}
              onChange={handleChange}
              aria-invalid={linksError ? true : undefined}
              aria-describedby={linksError ? "portfolio-urls-error" : undefined}
              className={`${INPUT} pl-12 ${linksError ? "field-invalid pr-10" : ""}`}
              placeholder="https://behance.net/you, https://yourportfolio.com"
            />
          </FieldControl>
          <FieldError id="portfolio-urls-error" message={linksError} />
        </div>
      </WizardStep>
    </ApplicationWizard>
  );
}
