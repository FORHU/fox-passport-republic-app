"use client";

import React, { useCallback, useId, useState } from "react";
import { useApplyRole } from "@/features/role-application/hooks/useApplyRole";
import {
  Briefcase,
  Package,
  Tag,
  Hash,
  UserCircle,
  Link as LinkIcon,
  BadgeCheck,
  ClipboardCheck,
  MapPin,
  Store,
} from "lucide-react";
import Link from "next/link";
import {
  KycDocumentSection,
  FOXER_KYC_DOCUMENTS,
  ORGANIZER_KYC_DOCUMENTS,
} from "./KycDocumentSection";
import SpecializationPicker from "./SpecializationPicker";
import { useProviderSpecialties } from "@/shared/api/providerSpecialties";
import { ApplicationWizard, WizardStep } from "./ApplicationWizard";
import {
  CascadingLocationFields,
  type LocationValue,
} from "@/shared/components/ui/CascadingLocationFields";
import { TinField } from "@/shared/components/ui/TinField";
import {
  CountryField,
  useCountryName,
} from "@/shared/components/ui/CountryField";
import { FieldControl, FieldError } from "@/shared/components/ui/FieldError";
import {
  portfolioUrlsError,
  splitPortfolioUrls,
} from "@/shared/lib/portfolioUrls";
import {
  WHOLE_YEARS_MESSAGE,
  toYearsOfExperience,
  yearsOfExperienceError,
} from "../utils/yearsOfExperience";

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

type ProviderType = "provider" | "organizer";

const PROVIDER_TABS: { type: ProviderType; label: string; color: string }[] = [
  { type: "provider", label: "Provider", color: "var(--periwinkle)" },
  { type: "organizer", label: "Organizer", color: "var(--periwinkle)" },
];

const LABEL = "text-sm font-bold text-white/80 uppercase tracking-wider";
const INPUT_BASE =
  "w-full bg-white/5 border border-white/10 rounded-xl py-3 text-white placeholder:text-white/30 focus:outline-none focus:bg-white/10 transition-colors";

/** A labelled text field with a leading icon, tinted to the role's colour. */
function IconField({
  label,
  hint,
  icon,
  accent,
  error,
  ...input
}: {
  label: string;
  hint?: string;
  icon: React.ReactNode;
  accent: string;
  /** Shown under the field, which is then marked invalid. */
  error?: string | null;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const errorId = `${useId()}-error`;
  return (
    <div className="space-y-2">
      <label className={LABEL}>{label}</label>
      {hint && <p className="mb-1 text-xs text-white/40">{hint}</p>}
      <FieldControl invalid={!!error}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
          {icon}
        </div>
        <input
          {...input}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${INPUT_BASE} pl-12 ${error ? "field-invalid pr-10" : "pr-4"}`}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = `color-mix(in srgb, ${accent} 50%, transparent)`)
          }
          onBlur={(e) => (e.currentTarget.style.borderColor = "")}
        />
      </FieldControl>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

const splitList = (value: string) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const labelsFor = (
  options: { value: string; label: string }[],
  values: string[],
) =>
  values.map((v) => options.find((o) => o.value === v)?.label ?? v).join(", ");

export default function FoxerApplicationClient({
  initialType = "provider",
}: {
  initialType?: ProviderType;
}) {
  const { mutate: applyRole, isPending } = useApplyRole();
  const [providerType, setProviderType] = useState<ProviderType>(initialType);

  // Provider Form State — unified equipment, services & live talent
  const [providerData, setProviderData] = useState({
    businessName: "",
    assetTypes: "",
    serviceTypes: "",
    portfolioUrls: "",
    experience: "",
    nbiClearanceIdNumber: "",
    tinNumber: "",
    // ISO code of the country that issued the TIN (CountryField).
    tinCountry: "",
    validId1FileId: "",
    nbiFileId: "",
    tinIdFileId: "",
    birPermitFileId: "",
    selfieFileId: "",
  });
  // The TIN was masked for the old country, so a new country clears it.
  const setTinCountry = useCallback(
    (tinCountry: string) =>
      setProviderData((prev) => ({
        ...prev,
        tinCountry,
        tinNumber: prev.tinCountry ? "" : prev.tinNumber,
      })),
    [],
  );
  const tinCountryName = useCountryName(providerData.tinCountry);
  const setTinNumber = useCallback(
    (tinNumber: string) => setProviderData((prev) => ({ ...prev, tinNumber })),
    [],
  );
  const [providerSpecializations, setProviderSpecializations] = useState<
    string[]
  >([]);
  // A Provider's specialties come from the API's catalog, the list it checks
  // the application against (RR-3).
  const { data: providerSpecialties = [] } = useProviderSpecialties();
  const providerCategoryOptions = providerSpecialties.map((s) => ({
    value: s.slug,
    label: s.name,
  }));

  // Organizer Form State — mirrors the API's OrganizerApplication
  // Picked as country → state → city; saved as one string in
  // `organizerData.location`, which is what the application stores.
  const [organizerPlace, setOrganizerPlace] = useState<LocationValue>({
    country: "",
    state: "",
    city: "",
  });
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
    } else {
      setProviderData((prev) => ({ ...prev, [field]: fileId }));
    }
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProviderData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const DIGIT_FIELD_MAX_LENGTH: Record<string, number> = {
    nbiClearanceIdNumber: 18,
  };

  const handleProviderDigitsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const digits = value
      .replace(/\D/g, "")
      .slice(0, DIGIT_FIELD_MAX_LENGTH[name]);
    setProviderData((prev) => ({ ...prev, [name]: digits }));
  };

  // Kept as typed and checked instead: stripping non-digits turned "2.5" into
  // "25" (app#327).
  const providerExperienceError = yearsOfExperienceError(
    providerData.experience,
  );
  const providerLinksError = portfolioUrlsError(providerData.portfolioUrls);
  const organizerExperienceError = yearsOfExperienceError(
    organizerData.experience,
  );

  const submit = () => {
    if (providerType === "provider") {
      applyRole({
        roleType: "providerFoxer",
        data: {
          businessName: providerData.businessName.trim() || undefined,
          assetTypes: splitList(providerData.assetTypes),
          serviceTypes: splitList(providerData.serviceTypes),
          portfolioUrls: splitPortfolioUrls(providerData.portfolioUrls),
          experience: toYearsOfExperience(providerData.experience),
          nbiClearanceIdNumber: providerData.nbiClearanceIdNumber || undefined,
          tinNumber: providerData.tinNumber || undefined,
          tinCountry: providerData.tinNumber
            ? providerData.tinCountry
            : undefined,
          validId1FileId: providerData.validId1FileId || undefined,
          nbiFileId: providerData.nbiFileId || undefined,
          tinIdFileId: providerData.tinIdFileId || undefined,
          birPermitFileId: providerData.birPermitFileId || undefined,
          selfieFileId: providerData.selfieFileId || undefined,
          specializations: providerSpecializations,
        },
      });
    } else if (providerType === "organizer") {
      applyRole({
        roleType: "organizer",
        data: {
          ...organizerData,
          experience: toYearsOfExperience(organizerData.experience),
          specializations: organizerSpecializations,
        },
      });
    }
  };

  const accent =
    PROVIDER_TABS.find((t) => t.type === providerType)?.color ?? "#A3A8F5";

  const countUploaded = (
    docs: { field: string }[],
    data: Record<string, string>,
  ) => docs.filter((d) => data[d.field]).length;

  const docsMessage = (done: number, total: number) =>
    done < total
      ? "Upload all the required documents before continuing."
      : null;

  const providerDocs = countUploaded(FOXER_KYC_DOCUMENTS, providerData);
  const orgDocs = countUploaded(ORGANIZER_KYC_DOCUMENTS, organizerData);

  const docsRow = (done: number, total: number) => ({
    label: "Identity documents",
    value: `${done} of ${total} uploaded`,
  });

  const icon =
    providerType === "organizer" ? (
      <ClipboardCheck size={32} />
    ) : (
      <Store size={32} />
    );

  const summary =
    providerType === "organizer"
      ? [
          { label: "About you", value: organizerData.bio },
          {
            label: "Years of experience",
            value: organizerData.experience,
          },
          { label: "Where you work", value: organizerData.location },
          {
            label: "Specializations",
            value: labelsFor(
              ORGANIZER_CATEGORY_OPTIONS,
              organizerSpecializations,
            ),
          },
          docsRow(orgDocs, ORGANIZER_KYC_DOCUMENTS.length),
        ]
      : [
          {
            label: "Business / Brand name",
            value: providerData.businessName || "Independent",
          },
          {
            label: "Equipment types",
            value: providerData.assetTypes || "None",
          },
          {
            label: "Service & talent types",
            value: providerData.serviceTypes || "None",
          },
          {
            label: "Years of experience",
            value: providerData.experience || "Not specified",
          },
          {
            label: "Portfolio links",
            value: providerData.portfolioUrls || "None",
          },
          {
            label: "NBI clearance ID",
            value: providerData.nbiClearanceIdNumber || "None",
          },
          {
            label: "TIN number",
            value: providerData.tinNumber
              ? `${providerData.tinNumber} (${tinCountryName})`
              : "None",
          },
          {
            label: "Specializations",
            value: labelsFor(providerCategoryOptions, providerSpecializations),
          },
          docsRow(providerDocs, FOXER_KYC_DOCUMENTS.length),
        ];

  const intro = (
    <div className="space-y-5">
      {/* Provider Type Toggle */}
      <div className="flex rounded-xl bg-white/5 p-1">
        {PROVIDER_TABS.map((tab) => {
          const active = providerType === tab.type;
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => setProviderType(tab.type)}
              aria-pressed={active}
              className={`flex-1 cursor-pointer rounded-lg px-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all sm:text-sm ${
                active
                  ? "text-black shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
              style={active ? { backgroundColor: tab.color } : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Event Foxer, Venue Foxer, and Investor have their own applications
          with their own fields, so they link out rather than sit in the tab
          bar. */}
      <p className="text-center text-xs text-white/40">
        Want to host events, list a venue, or invest instead?{" "}
        <Link
          href="/creator-dashboard/apply"
          className="text-white/70 underline hover:text-white"
        >
          Apply as an Event Foxer
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
    </div>
  );

  return (
    // Keyed by role so changing it starts that role's form fresh, rather than
    // reusing the previous role's inputs and uploads.
    <ApplicationWizard
      key={providerType}
      accent={accent}
      icon={icon}
      title={
        providerType === "organizer" ? (
          <>
            Apply to be an <span style={{ color: accent }}>Organizer</span>
          </>
        ) : (
          <>
            Apply to be a <span style={{ color: accent }}>Provider</span>
          </>
        )
      }
      subtitle={
        providerType === "organizer"
          ? "Once approved, Mayors and Event Owners can invite you to help run their venues and events."
          : "Provide your details to start supplying equipment, professional talent, or live entertainment in FoxPassport."
      }
      intro={intro}
      summary={summary}
      agreement="By submitting this application, you confirm the details are accurate and agree to FoxPassport's provider policies and quality standards. Your application will be reviewed by our team."
      isPending={isPending}
      onSubmit={submit}
    >
      {providerType === "provider" ? (
        <>
          <WizardStep
            label="Offerings"
            title="Your offerings"
            description="What you supply — equipment rentals, professional services, or live performances."
            validate={() =>
              providerExperienceError ??
              providerLinksError ??
              (providerSpecializations.length > 0
                ? null
                : "Pick at least one specialty.")
            }
          >
            <IconField
              label="Business or Brand Name (Optional)"
              accent={accent}
              icon={<Briefcase size={18} />}
              type="text"
              name="businessName"
              value={providerData.businessName}
              onChange={handleProviderChange}
              placeholder="e.g. Acme Sound & Lighting, DJ Apex, etc."
            />
            <IconField
              label="Equipment & Gear (Optional)"
              hint="Comma-separated (e.g. Sound Systems, Stage Lighting, Furniture)"
              accent={accent}
              icon={<Package size={18} />}
              type="text"
              name="assetTypes"
              value={providerData.assetTypes}
              onChange={handleProviderChange}
              placeholder="Sound Systems, Lighting, Props, Furniture..."
            />
            <IconField
              label="Services & Live Acts (Optional)"
              hint="Comma-separated (e.g. Photography, Catering, DJ, Band, Staffing)"
              accent={accent}
              icon={<Tag size={18} />}
              type="text"
              name="serviceTypes"
              value={providerData.serviceTypes}
              onChange={handleProviderChange}
              placeholder="Photography, Catering, DJ, Live Band..."
            />
            <IconField
              label="Years of Experience (Optional)"
              accent={accent}
              icon={<UserCircle size={18} />}
              type="text"
              inputMode="numeric"
              name="experience"
              value={providerData.experience}
              onChange={handleProviderChange}
              error={providerExperienceError}
              placeholder="e.g. 3"
            />
            <IconField
              label="Portfolio / Website Links (Optional)"
              accent={accent}
              icon={<LinkIcon size={18} />}
              type="text"
              name="portfolioUrls"
              value={providerData.portfolioUrls}
              onChange={handleProviderChange}
              error={providerLinksError}
              hint="Up to 5 full web addresses, separated by commas."
              placeholder="https://instagram.com/..., https://portfolio.com"
            />
            <SpecializationPicker
              options={providerCategoryOptions}
              value={providerSpecializations}
              onChange={setProviderSpecializations}
              accentColor={accent}
              max={Infinity}
              required
            />
          </WizardStep>

          <WizardStep
            label="Verification"
            title="Provider verification"
            description="Provide your verification details to start offering on FoxPassport."
            validate={() =>
              docsMessage(providerDocs, FOXER_KYC_DOCUMENTS.length)
            }
          >
            <CountryField
              value={providerData.tinCountry}
              onChange={setTinCountry}
              labelClassName={LABEL}
              hint="Sets the format of your TIN."
            />
            <TinField
              country={providerData.tinCountry}
              countryName={tinCountryName}
              value={providerData.tinNumber}
              onChange={setTinNumber}
              icon={<Hash size={18} />}
              labelClassName={LABEL}
              inputClassName={`${INPUT_BASE} pl-12 pr-4`}
              accent={accent}
            />
            <IconField
              label="NBI Clearance ID (Optional)"
              accent={accent}
              icon={<BadgeCheck size={18} />}
              type="text"
              inputMode="numeric"
              name="nbiClearanceIdNumber"
              maxLength={18}
              value={providerData.nbiClearanceIdNumber}
              onChange={handleProviderDigitsChange}
              placeholder="XXXX-XXXX-XXXX"
            />
            <KycDocumentSection onUpload={handleFileUpload} compact />
          </WizardStep>
        </>
      ) : providerType === "organizer" ? (
        <>
          <WizardStep
            label="About you"
            title="About you"
            description="The events and venues you've helped run, and where."
            validate={() =>
              // Required: `required` catches "", this also catches "  ".
              (toYearsOfExperience(organizerData.experience) === undefined
                ? WHOLE_YEARS_MESSAGE
                : null) ??
              (organizerPlace.city
                ? null
                : "Choose where you usually work — country, state and city.")
            }
          >
            <div className="space-y-2">
              <label className={LABEL}>About You *</label>
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
                className={`${INPUT_BASE} resize-none px-4`}
                placeholder="The events and venues you've helped run, and what you did there."
              />
            </div>

            <IconField
              label="Years of Experience *"
              accent={accent}
              icon={<UserCircle size={18} />}
              required
              type="text"
              inputMode="numeric"
              name="experience"
              value={organizerData.experience}
              onChange={(e) =>
                setOrganizerData((prev) => ({
                  ...prev,
                  experience: e.target.value,
                }))
              }
              error={organizerExperienceError}
              placeholder="e.g. 3"
            />

            <div className="space-y-2">
              <label className={`${LABEL} flex items-center gap-2`}>
                <MapPin size={16} className="text-white/40" />
                Where you usually work *
              </label>
              <CascadingLocationFields
                value={organizerPlace}
                onChange={(next) => {
                  setOrganizerPlace(next);
                  setOrganizerData((prev) => ({
                    ...prev,
                    location: [next.city, next.state, next.country]
                      .filter(Boolean)
                      .join(", "),
                  }));
                }}
              />
            </div>

            <SpecializationPicker
              options={ORGANIZER_CATEGORY_OPTIONS}
              value={organizerSpecializations}
              onChange={setOrganizerSpecializations}
              accentColor={accent}
            />
          </WizardStep>

          <WizardStep
            label="Documents"
            title="Verify your identity"
            description="Organizers see guest lists and help run other people's venues and events, so we verify who you are before anyone can invite you."
            validate={() =>
              docsMessage(orgDocs, ORGANIZER_KYC_DOCUMENTS.length)
            }
          >
            <KycDocumentSection
              onUpload={handleFileUpload}
              documents={ORGANIZER_KYC_DOCUMENTS}
              compact
            />
          </WizardStep>
        </>
      ) : null}
    </ApplicationWizard>
  );
}
