"use client";

import React, { useState } from "react";
import { useApplyRole } from "@/features/role-application/hooks/useApplyRole";
import {
  Briefcase,
  Package,
  Tag,
  Hash,
  UserCircle,
  Link as LinkIcon,
  BadgeCheck,
  Music2,
  ClipboardCheck,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import {
  KycDocumentSection,
  FOXER_KYC_DOCUMENTS,
  ORGANIZER_KYC_DOCUMENTS,
} from "./KycDocumentSection";
import SpecializationPicker from "./SpecializationPicker";
import { ApplicationWizard, WizardStep } from "./ApplicationWizard";
import {
  CascadingLocationFields,
  type LocationValue,
} from "@/shared/components/ui/CascadingLocationFields";

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

const PROVIDER_TABS: { type: ProviderType; label: string; color: string }[] = [
  { type: "service", label: "Talent Foxer", color: "#00d2ff" },
  { type: "performer", label: "Performer", color: "#f59e0b" },
  { type: "asset", label: "Gear Provider", color: "#a78bfa" },
  { type: "organizer", label: "Organizer", color: "#e879f9" },
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
  ...input
}: {
  label: string;
  hint?: string;
  icon: React.ReactNode;
  accent: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className={LABEL}>{label}</label>
      {hint && <p className="mb-1 text-xs text-white/40">{hint}</p>}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
          {icon}
        </div>
        <input
          {...input}
          className={`${INPUT_BASE} pl-12 pr-4`}
          onFocus={(e) => (e.currentTarget.style.borderColor = `${accent}80`)}
          onBlur={(e) => (e.currentTarget.style.borderColor = "")}
        />
      </div>
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

  const submit = () => {
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
          assetTypes: splitList(assetData.assetTypes),
          specializations: assetSpecializations,
        },
      });
    } else if (providerType === "performer") {
      applyRole({
        roleType: "performerFoxer",
        data: {
          ...performerData,
          experience: parseInt(performerData.experience, 10),
          performerTypes: splitList(performerData.performerTypes),
          portfolioUrls: splitList(performerData.portfolioUrls),
          specializations: performerSpecializations,
        },
      });
    } else {
      applyRole({
        roleType: "serviceFoxer",
        data: {
          ...serviceData,
          experience: parseInt(serviceData.experience, 10),
          serviceTypes: splitList(serviceData.serviceTypes),
          portfolioUrls: splitList(serviceData.portfolioUrls),
          specializations: serviceSpecializations,
        },
      });
    }
  };

  const accent =
    PROVIDER_TABS.find((t) => t.type === providerType)?.color ?? "#00d2ff";

  const countUploaded = (
    docs: { field: string }[],
    data: Record<string, string>,
  ) => docs.filter((d) => data[d.field]).length;

  const docsMessage = (done: number, total: number) =>
    done < total
      ? "Upload all the required documents before continuing."
      : null;

  const orgDocs = countUploaded(ORGANIZER_KYC_DOCUMENTS, organizerData);
  const assetDocs = countUploaded(FOXER_KYC_DOCUMENTS, assetData);
  const serviceDocs = countUploaded(FOXER_KYC_DOCUMENTS, serviceData);
  const performerDocs = countUploaded(FOXER_KYC_DOCUMENTS, performerData);

  const docsRow = (done: number, total: number) => ({
    label: "Identity documents",
    value: `${done} of ${total} uploaded`,
  });

  const icon =
    providerType === "organizer" ? (
      <ClipboardCheck size={32} />
    ) : providerType === "asset" ? (
      <Package size={32} />
    ) : providerType === "performer" ? (
      <Music2 size={32} />
    ) : (
      <Briefcase size={32} />
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
      : providerType === "asset"
        ? [
            { label: "Business name", value: assetData.businessName },
            { label: "Equipment types", value: assetData.assetTypes },
            { label: "TIN number", value: assetData.tinNumber },
            {
              label: "Specializations",
              value: labelsFor(ASSET_CATEGORY_OPTIONS, assetSpecializations),
            },
            docsRow(assetDocs, FOXER_KYC_DOCUMENTS.length),
          ]
        : providerType === "performer"
          ? [
              { label: "Performer types", value: performerData.performerTypes },
              {
                label: "Years of experience",
                value: performerData.experience,
              },
              { label: "Portfolio links", value: performerData.portfolioUrls },
              {
                label: "NBI clearance ID",
                value: performerData.nbiClearanceIdNumber,
              },
              { label: "TIN number", value: performerData.tinNumber },
              {
                label: "Specializations",
                value: labelsFor(
                  PERFORMER_CATEGORY_OPTIONS,
                  performerSpecializations,
                ),
              },
              docsRow(performerDocs, FOXER_KYC_DOCUMENTS.length),
            ]
          : [
              { label: "Service types", value: serviceData.serviceTypes },
              {
                label: "Years of experience",
                value: serviceData.experience,
              },
              { label: "Portfolio links", value: serviceData.portfolioUrls },
              {
                label: "NBI clearance ID",
                value: serviceData.nbiClearanceIdNumber,
              },
              { label: "TIN number", value: serviceData.tinNumber },
              {
                label: "Specializations",
                value: labelsFor(
                  SERVICE_CATEGORY_OPTIONS,
                  serviceSpecializations,
                ),
              },
              docsRow(serviceDocs, FOXER_KYC_DOCUMENTS.length),
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
            Apply to be a <span style={{ color: accent }}>Foxer</span>
          </>
        )
      }
      subtitle={
        providerType === "organizer"
          ? "Once approved, Mayors and Event Owners can invite you to help run their venues and events."
          : "Provide your professional details to start offering services, equipment, or performances in FoxPassport."
      }
      intro={intro}
      summary={summary}
      agreement="By submitting this application, you confirm the details are accurate and agree to FoxPassport's provider policies and quality standards. Your application will be reviewed by our team."
      isPending={isPending}
      onSubmit={submit}
    >
      {providerType === "organizer" ? (
        <>
          <WizardStep
            label="About you"
            title="About you"
            description="The events and venues you've helped run, and where."
            validate={() =>
              organizerPlace.city
                ? null
                : "Choose where you usually work — country, state and city."
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
              pattern="[0-9]*"
              name="experience"
              value={organizerData.experience}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                setOrganizerData((prev) => ({
                  ...prev,
                  experience:
                    digits === "" ? "" : String(Math.min(100, Number(digits))),
                }));
              }}
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
      ) : providerType === "service" ? (
        <>
          <WizardStep
            label="Your work"
            title="Your work"
            description="What you offer, how long you've done it, and where people can see it."
          >
            <IconField
              label="Service Types *"
              hint="Comma-separated (e.g. Photography, DJ, Catering)"
              accent={accent}
              icon={<Tag size={18} />}
              required
              type="text"
              name="serviceTypes"
              value={serviceData.serviceTypes}
              onChange={handleServiceChange}
              placeholder="Photography, Event Styling, DJ..."
            />
            <IconField
              label="Years of Experience *"
              accent={accent}
              icon={<UserCircle size={18} />}
              required
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="experience"
              value={serviceData.experience}
              onChange={handleExperienceChange}
              placeholder="e.g. 3"
            />
            <IconField
              label="Portfolio Links *"
              accent={accent}
              icon={<LinkIcon size={18} />}
              required
              type="text"
              name="portfolioUrls"
              value={serviceData.portfolioUrls}
              onChange={handleServiceChange}
              placeholder="https://instagram.com/..., https://myportfolio.com"
            />
            <SpecializationPicker
              options={SERVICE_CATEGORY_OPTIONS}
              value={serviceSpecializations}
              onChange={setServiceSpecializations}
              accentColor={accent}
            />
          </WizardStep>

          <WizardStep
            label="Verification"
            title="Professional verification"
            description="As a Talent Foxer, we require a full background check including NBI clearance."
            validate={() =>
              docsMessage(serviceDocs, FOXER_KYC_DOCUMENTS.length)
            }
          >
            <IconField
              label="NBI Clearance ID *"
              accent={accent}
              icon={<BadgeCheck size={18} />}
              required
              type="text"
              inputMode="numeric"
              name="nbiClearanceIdNumber"
              maxLength={18}
              value={serviceData.nbiClearanceIdNumber}
              onChange={handleServiceDigitsChange}
              placeholder="XXXX-XXXX-XXXX"
            />
            <IconField
              label="TIN Number (Optional)"
              accent={accent}
              icon={<Hash size={18} />}
              type="text"
              inputMode="numeric"
              name="tinNumber"
              maxLength={9}
              value={serviceData.tinNumber}
              onChange={handleServiceDigitsChange}
              placeholder="000-000-000-000"
            />
            <KycDocumentSection onUpload={handleFileUpload} compact />
          </WizardStep>
        </>
      ) : providerType === "performer" ? (
        <>
          <WizardStep
            label="Your act"
            title="Your act"
            description="What you perform, how long you've done it, and where people can watch."
          >
            <IconField
              label="Performer Types *"
              hint="Comma-separated (e.g. DJ, Live Band, MC)"
              accent={accent}
              icon={<Tag size={18} />}
              required
              type="text"
              name="performerTypes"
              value={performerData.performerTypes}
              onChange={handlePerformerChange}
              placeholder="DJ, Live Band, Photography..."
            />
            <IconField
              label="Years of Experience *"
              accent={accent}
              icon={<UserCircle size={18} />}
              required
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="experience"
              value={performerData.experience}
              onChange={handlePerformerExperienceChange}
              placeholder="e.g. 3"
            />
            <IconField
              label="Portfolio / Demo Reel Links *"
              accent={accent}
              icon={<LinkIcon size={18} />}
              required
              type="text"
              name="portfolioUrls"
              value={performerData.portfolioUrls}
              onChange={handlePerformerChange}
              placeholder="https://youtube.com/..., https://soundcloud.com/..."
            />
            <SpecializationPicker
              options={PERFORMER_CATEGORY_OPTIONS}
              value={performerSpecializations}
              onChange={setPerformerSpecializations}
              accentColor={accent}
            />
          </WizardStep>

          <WizardStep
            label="Verification"
            title="Performer verification"
            description="As a performer, we require a full background check including NBI clearance."
            validate={() =>
              docsMessage(performerDocs, FOXER_KYC_DOCUMENTS.length)
            }
          >
            <IconField
              label="NBI Clearance ID *"
              accent={accent}
              icon={<BadgeCheck size={18} />}
              required
              type="text"
              inputMode="numeric"
              name="nbiClearanceIdNumber"
              maxLength={18}
              value={performerData.nbiClearanceIdNumber}
              onChange={handlePerformerDigitsChange}
              placeholder="XXXX-XXXX-XXXX"
            />
            <IconField
              label="TIN Number (Optional)"
              accent={accent}
              icon={<Hash size={18} />}
              type="text"
              inputMode="numeric"
              name="tinNumber"
              maxLength={9}
              value={performerData.tinNumber}
              onChange={handlePerformerDigitsChange}
              placeholder="000-000-000-000"
            />
            <KycDocumentSection onUpload={handleFileUpload} compact />
          </WizardStep>
        </>
      ) : (
        <>
          <WizardStep
            label="Your business"
            title="Your business"
            description="Who you are and what you rent out."
          >
            <IconField
              label="Business Name *"
              accent={accent}
              icon={<Briefcase size={18} />}
              required
              type="text"
              name="businessName"
              value={assetData.businessName}
              onChange={handleAssetChange}
              placeholder="Super Sounds Audio"
            />
            <IconField
              label="Equipment Types *"
              hint="Comma-separated (e.g. Speakers, Microphones, Lights)"
              accent={accent}
              icon={<Package size={18} />}
              required
              type="text"
              name="assetTypes"
              value={assetData.assetTypes}
              onChange={handleAssetChange}
              placeholder="Sound Systems, Lighting Rigs..."
            />
            <IconField
              label="TIN Number *"
              accent={accent}
              icon={<Hash size={18} />}
              required
              type="text"
              inputMode="numeric"
              name="tinNumber"
              maxLength={9}
              value={assetData.tinNumber}
              onChange={handleAssetTinChange}
              placeholder="000-000-000-000"
            />
            <SpecializationPicker
              options={ASSET_CATEGORY_OPTIONS}
              value={assetSpecializations}
              onChange={setAssetSpecializations}
              accentColor={accent}
            />
          </WizardStep>

          <WizardStep
            label="Documents"
            title="Equipment provider verification"
            description="Verify your identity to start listing assets on FoxPassport."
            validate={() => docsMessage(assetDocs, FOXER_KYC_DOCUMENTS.length)}
          >
            <KycDocumentSection onUpload={handleFileUpload} compact />
          </WizardStep>
        </>
      )}
    </ApplicationWizard>
  );
}
