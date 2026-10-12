"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import RequireAuth from "@/shared/auth/RequireAuth";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { isFoxerRole } from "@/shared/constants/roles";
import { ROLES, type RoleCatalogEntry } from "../roleCatalog";
import { RoleDetailsModal } from "./RoleDetailsModal";
import {
  CascadingLocationFields,
  type LocationValue,
} from "@/shared/components/ui/CascadingLocationFields";

type Step = 1 | 2 | 3;

/** The card every step sits in — the role-application form's look. */
const STEP_CARD =
  "animate-in fade-in duration-300 relative bg-surface-raised rounded-[2.5rem] p-6 sm:p-10 md:p-12 border border-white/5 shadow-2xl overflow-hidden";

function StepHeader({
  icon,
  color = "var(--accent-text)",
  title,
  subtitle,
}: {
  icon: string;
  color?: string;
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <>
      <div
        className="pointer-events-none absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full opacity-20 blur-[100px]"
        style={{ backgroundColor: color }}
      />
      <div className="relative text-center mb-10">
        <div
          className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}
        >
          <span
            className="material-symbols-outlined text-[32px]"
            style={{ color }}
          >
            {icon}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
          {title}
        </h1>
        <p className="text-white/60">{subtitle}</p>
      </div>
    </>
  );
}

/** Back on the left, the step's own action on the right, under a divider. */
function StepFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mt-10 pt-6 border-t border-white/5 flex flex-col-reverse sm:flex-row sm:items-center gap-3">
      {children}
    </div>
  );
}

const BACK_BUTTON =
  "inline-flex items-center justify-center gap-1.5 py-3 px-4 text-sm font-bold text-white/40 hover:text-white transition-colors";

export default function OnboardingClient({ user: serverUser }: { user: any }) {
  const router = useRouter();
  const { user: clientUser, setUser } = useAuthStore();
  const user = clientUser || serverUser;

  // Organizer and investor aren't Foxers (neither supplies inventory) but
  // are still roles this page offers, so they count as ones the user
  // already holds.
  const existingRoles: string[] = (user?.roleType ?? []).filter(
    (role: string) =>
      isFoxerRole(role) || role === "organizer" || role === "investor",
  );
  const hasExistingRoles = existingRoles.length > 0;

  const [step, setStep] = useState<Step>(hasExistingRoles ? 3 : 1);
  const [pendingRoles, setPendingRoles] = useState<string[]>([]);
  const [revisionRequests, setRevisionRequests] = useState<
    { id: string; roleType: string }[]
  >([]);
  const [name, setName] = useState(user?.name ?? "");
  // Their home address: country → state/province → city, plus an optional
  // barangay (district outside the Philippines).
  const [address, setAddress] = useState<LocationValue>({
    country: user?.country ?? "",
    state: user?.state ?? "",
    city: user?.city ?? "",
  });
  const [district, setDistrict] = useState(user?.district ?? "");
  const districtLabel = /^philippines$/i.test(address.country.trim())
    ? "Barangay"
    : "District";
  // What still blocks Continue, named so the button can say why.
  const missing = [
    !name.trim() && "display name",
    !address.country.trim() && "country",
    !address.city.trim() && "city",
  ].filter(Boolean) as string[];
  const profileComplete = missing.length === 0;
  const [isSaving, setIsSaving] = useState(false);
  // The role whose details modal is open — picking a role explains it first
  // instead of dropping straight into its application form.
  const [viewingRole, setViewingRole] = useState<RoleCatalogEntry | null>(null);

  useEffect(() => {
    api
      .get("/role-requests/my")
      .then((res) => {
        const requests: any[] = res.data?.data ?? [];
        const pending: string[] = requests
          .filter((r) => r.status === "pending")
          .map((r) => r.roleType);
        const revisions = requests
          .filter((r) => r.status === "revision_requested")
          .map((r) => ({ id: r.id, roleType: r.roleType }));
        setPendingRoles(pending);
        setRevisionRequests(revisions);
        if (pending.length > 0 || revisions.length > 0) setStep(3);
      })
      .catch(() => {});
  }, []);

  const hasCommittedRoles =
    hasExistingRoles || pendingRoles.length > 0 || revisionRequests.length > 0;
  const goAfterProfile = () => setStep(hasCommittedRoles ? 3 : 2);
  const goBackFromRoles = () => setStep(hasCommittedRoles ? 1 : 2);

  const handleProfileContinue = async () => {
    if (!profileComplete) return;
    try {
      setIsSaving(true);
      await api.put("/profile", {
        name: name.trim(),
        country: address.country.trim(),
        state: address.state.trim(),
        city: address.city.trim(),
        district: district.trim(),
      });
      if (user)
        setUser({
          ...user,
          name: name.trim(),
          country: address.country.trim(),
          state: address.state.trim(),
          city: address.city.trim(),
          district: district.trim(),
        });
      goAfterProfile();
    } catch (err: any) {
      // Stay on the step: moving on would let them believe it was saved.
      toast.error(
        err?.response?.data?.message ??
          "Couldn't save your profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // The journey shown in the stepper — someone already committed to a role
  // skips the "what brings you here" step.
  const journey: { step: Step; label: string }[] = hasCommittedRoles
    ? [
        { step: 1, label: "Profile" },
        { step: 3, label: "Roles" },
      ]
    : [
        { step: 1, label: "Profile" },
        { step: 2, label: "Interests" },
        { step: 3, label: "Roles" },
      ];
  const currentIndex = journey.findIndex((j) => j.step === step);

  // One label style for every field, the location dropdowns included.
  const labelClass =
    "text-xs font-bold text-white/60 uppercase tracking-wider block mb-2";
  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <RequireAuth>
      {/* The app-wide page background (booking, checkout, admin, …). */}
      <div className="relative min-h-screen flex items-center justify-center bg-background bg-gradient-dark text-text-main overflow-hidden px-4 py-12 font-body selection:bg-accent selection:text-black">
        <div className="relative w-full max-w-2xl mx-auto">
          {/* Exit + stepper */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-bold text-white/40 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Home
            </Link>

            <ol className="flex items-center gap-2">
              {journey.map((j, i) => {
                const active = i === currentIndex;
                const done = i < currentIndex;
                return (
                  <li key={j.step} className="flex items-center gap-2">
                    {i > 0 && (
                      <span
                        className={`h-px w-4 sm:w-8 ${done || active ? "bg-accent/60" : "bg-white/10"}`}
                      />
                    )}
                    <span
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                        active
                          ? "bg-accent text-black"
                          : done
                            ? "bg-accent/15 text-accent"
                            : "bg-white/5 text-white/40"
                      }`}
                      aria-current={active ? "step" : undefined}
                    >
                      {done ? (
                        <span className="material-symbols-outlined text-[14px]">
                          check
                        </span>
                      ) : (
                        <span>{i + 1}</span>
                      )}
                      <span className={active ? "inline" : "hidden sm:inline"}>
                        {j.label}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* ── Step 1: Profile setup ── */}
          {step === 1 && (
            <div className={STEP_CARD}>
              <StepHeader
                icon="waving_hand"
                title={
                  <>
                    {hasExistingRoles ? "Back again," : "Welcome,"}{" "}
                    <span className="text-accent">
                      {user?.name?.split(" ")[0] || "Friend"}!
                    </span>
                  </>
                }
                subtitle={
                  hasExistingRoles
                    ? "Update your profile or continue to manage your roles."
                    : "Let's set up your profile first."
                }
              />

              <div className="relative space-y-6">
                <div>
                  <label htmlFor="onboarding-name" className={labelClass}>
                    Display Name <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-white/40 pointer-events-none">
                      person
                    </span>
                    <input
                      id="onboarding-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      placeholder="How others will see you"
                    />
                  </div>
                </div>

                <fieldset className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
                  <legend className="sr-only">Your address</legend>
                  <p className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[18px] text-white/40">
                      location_on
                    </span>
                    Your Address <span className="text-accent">*</span>
                  </p>
                  <p className="text-xs text-white/40 mb-5">
                    Used to show you events, venues and Foxers near you.
                  </p>

                  {/* Country on its own row; state and city share the next. */}
                  <CascadingLocationFields
                    value={address}
                    onChange={(next) => setAddress(next)}
                    labelClassName={labelClass}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:[&>*:first-child]:col-span-2"
                  />

                  <div className="mt-4">
                    <label htmlFor="onboarding-district" className={labelClass}>
                      {districtLabel}{" "}
                      <span className="normal-case font-normal tracking-normal text-white/30">
                        — optional
                      </span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-white/40 pointer-events-none">
                        home_pin
                      </span>
                      <input
                        id="onboarding-district"
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        disabled={!address.city.trim()}
                        className={inputClass}
                        placeholder={
                          address.city.trim()
                            ? `Your ${districtLabel.toLowerCase()}`
                            : "Select a city first"
                        }
                      />
                    </div>
                  </div>
                </fieldset>
              </div>

              <StepFooter>
                {!profileComplete && (
                  <p
                    className="text-xs text-white/40 text-center sm:text-left"
                    aria-live="polite"
                  >
                    Add your {missing.join(", ")} to continue.
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleProfileContinue}
                  disabled={isSaving || !profileComplete}
                  className="sm:ml-auto py-3.5 px-8 rounded-xl bg-accent text-black font-bold hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? "Saving…" : "Continue"}
                  {!isSaving && (
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  )}
                </button>
              </StepFooter>
            </div>
          )}

          {/* ── Step 2: Intent (new users only) ── */}
          {step === 2 && (
            <div className={STEP_CARD}>
              <StepHeader
                icon="explore"
                color="#a78bfa"
                title="What brings you here?"
                subtitle="Choose how you plan to use FoxPassport."
              />

              <div className="relative space-y-3">
                <button
                  onClick={() => router.push("/search")}
                  className="group w-full bg-white/[0.03] rounded-[1.5rem] p-5 sm:p-6 text-left border border-white/5 hover:border-accent/40 hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                      <span
                        className="material-symbols-outlined text-[24px]"
                        style={{ color: "var(--accent-text)" }}
                      >
                        local_activity
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-display font-bold text-white">
                        Book Events
                      </h3>
                      <p className="text-sm text-white/40">
                        Browse foxers, venues, and services to create your
                        perfect event.
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-accent transition-colors">
                      arrow_forward
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="group w-full bg-white/[0.03] rounded-[1.5rem] p-5 sm:p-6 text-left border border-white/5 hover:border-[#ff00aa]/40 hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#ff00aa]/15 flex items-center justify-center shrink-0">
                      <span
                        className="material-symbols-outlined text-[24px]"
                        style={{ color: "#ff00aa" }}
                      >
                        badge
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-display font-bold text-white">
                        Become a Foxer
                      </h3>
                      <p className="text-sm text-white/40">
                        Offer services, rent gear, list venues, or create events
                        professionally.
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-[#ff00aa] transition-colors">
                      arrow_forward
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="group w-full bg-white/[0.03] rounded-[1.5rem] p-5 sm:p-6 text-left border border-white/5 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[24px] text-white/50">
                        people
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-display font-bold text-white">
                        Both
                      </h3>
                      <p className="text-sm text-white/40">
                        Book events and apply to become a Foxer in the
                        ecosystem.
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-white transition-colors">
                      arrow_forward
                    </span>
                  </div>
                </button>
              </div>

              <StepFooter>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={BACK_BUTTON}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_back
                  </span>
                  Back
                </button>
              </StepFooter>
            </div>
          )}

          {/* ── Step 3: Role selection ── */}
          {step === 3 && (
            <div className={STEP_CARD}>
              <StepHeader
                icon="badge"
                color="#ec4899"
                title={
                  hasExistingRoles
                    ? "Your roles"
                    : pendingRoles.length > 0
                      ? "Application submitted"
                      : "Choose your role"
                }
                subtitle={
                  hasExistingRoles
                    ? "Active roles are shown below. Apply for additional roles anytime."
                    : pendingRoles.length > 0
                      ? "We're reviewing your application. You'll be notified once approved."
                      : "Select how you want to contribute. You can hold multiple roles over time."
                }
              />

              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLES.map((role, idx) => {
                  // An odd count leaves the last card alone in its row —
                  // give it the full row instead of a lopsided empty gap.
                  const isLastOdd =
                    ROLES.length % 2 === 1 && idx === ROLES.length - 1;
                  const isActive = existingRoles.includes(role.roleType);
                  const isPending =
                    !isActive && pendingRoles.includes(role.roleType);
                  const revisionRequest =
                    !isActive && !isPending
                      ? revisionRequests.find(
                          (r) => r.roleType === role.roleType,
                        )
                      : undefined;

                  if (isActive) {
                    return (
                      <div
                        key={role.type}
                        className={`relative bg-white/[0.03] rounded-[1.5rem] p-6 border border-green-500/20 flex flex-col ${isLastOdd ? "sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-[calc(50%-0.5rem)]" : ""}`}
                        style={{
                          boxShadow: "inset 0 0 0 1px rgba(34,197,94,0.15)",
                        }}
                      >
                        <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[11px]">
                            check_circle
                          </span>
                          Active
                        </span>
                        <div
                          className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
                          style={{ backgroundColor: `${role.color}20` }}
                        >
                          <span
                            className="material-symbols-outlined text-[24px]"
                            style={{ color: role.color }}
                          >
                            {role.icon}
                          </span>
                        </div>
                        <h3 className="text-lg font-display font-bold text-white mb-1">
                          {role.title}
                        </h3>
                        <p className="text-xs text-white/30 mt-auto">
                          {role.desc}
                        </p>
                      </div>
                    );
                  }

                  if (isPending) {
                    return (
                      <div
                        key={role.type}
                        className={`relative bg-white/[0.03] rounded-[1.5rem] p-6 border border-amber-500/20 flex flex-col ${isLastOdd ? "sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-[calc(50%-0.5rem)]" : ""}`}
                        style={{
                          boxShadow: "inset 0 0 0 1px rgba(245,158,11,0.12)",
                        }}
                      >
                        <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[11px]">
                            schedule
                          </span>
                          Under Review
                        </span>
                        <div
                          className="h-12 w-12 rounded-xl flex items-center justify-center mb-4 opacity-60"
                          style={{ backgroundColor: `${role.color}15` }}
                        >
                          <span
                            className="material-symbols-outlined text-[24px]"
                            style={{ color: role.color }}
                          >
                            {role.icon}
                          </span>
                        </div>
                        <h3 className="text-lg font-display font-bold text-white mb-1">
                          {role.title}
                        </h3>
                        <p className="text-xs text-white/25 mt-auto">
                          {role.desc}
                        </p>
                      </div>
                    );
                  }

                  if (revisionRequest) {
                    return (
                      <Link
                        key={role.type}
                        href={`/foxer/resubmit/${revisionRequest.id}`}
                        className={`group relative bg-white/[0.03] rounded-[1.5rem] p-6 text-left border border-orange-500/20 hover:bg-white/[0.06] transition-all duration-300 flex flex-col ${isLastOdd ? "sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-[calc(50%-0.5rem)]" : ""}`}
                        style={{
                          boxShadow: "inset 0 0 0 1px rgba(249,115,22,0.15)",
                        }}
                      >
                        <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[11px]">
                            flag
                          </span>
                          Needs Revision
                        </span>
                        <div
                          className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
                          style={{ backgroundColor: `${role.color}20` }}
                        >
                          <span
                            className="material-symbols-outlined text-[24px]"
                            style={{ color: role.color }}
                          >
                            {role.icon}
                          </span>
                        </div>
                        <h3 className="text-lg font-display font-bold text-white mb-1">
                          {role.title}
                        </h3>
                        <p className="text-xs text-orange-300/70 mt-auto group-hover:text-orange-300 transition-colors">
                          One or more documents were flagged — tap to fix and
                          resubmit.
                        </p>
                      </Link>
                    );
                  }

                  return (
                    <button
                      type="button"
                      key={role.type}
                      onClick={() => setViewingRole(role)}
                      aria-haspopup="dialog"
                      className={`group relative bg-white/[0.03] rounded-[1.5rem] p-6 text-left border border-white/5 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer ${isLastOdd ? "sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-[calc(50%-0.5rem)]" : ""}`}
                    >
                      <div
                        className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{ boxShadow: `inset 0 0 0 1px ${role.color}` }}
                      />
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all"
                        style={{ backgroundColor: `${role.color}20` }}
                      >
                        <span
                          className="material-symbols-outlined text-[24px]"
                          style={{ color: role.color }}
                        >
                          {role.icon}
                        </span>
                      </div>
                      <h3 className="text-lg font-display font-bold text-white mb-1">
                        {role.title}
                      </h3>
                      <p className="text-xs text-white/40 group-hover:text-white/70 transition-colors">
                        {role.desc}
                      </p>
                      <span
                        className="mt-auto pt-3 inline-flex items-center gap-1 text-[11px] font-bold opacity-70 group-hover:opacity-100 transition-opacity"
                        style={{ color: role.color }}
                      >
                        Learn more & apply
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_forward
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <RoleDetailsModal
                role={viewingRole}
                onClose={() => setViewingRole(null)}
              />

              <StepFooter>
                <button
                  type="button"
                  onClick={goBackFromRoles}
                  className={BACK_BUTTON}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_back
                  </span>
                  Back
                </button>
                <button
                  type="button"
                  onClick={() =>
                    router.push(hasExistingRoles ? "/creator-dashboard" : "/")
                  }
                  className="sm:ml-auto py-3 px-6 rounded-xl border border-white/10 text-white/70 text-sm font-bold hover:bg-white/5 hover:text-white transition-colors"
                >
                  {hasExistingRoles
                    ? "Go to Dashboard"
                    : pendingRoles.length > 0
                      ? "Back to Home"
                      : "Skip for now"}
                </button>
              </StepFooter>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
