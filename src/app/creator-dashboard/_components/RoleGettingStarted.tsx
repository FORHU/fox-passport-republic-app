"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useRoleAccess } from "@/shared/auth/useRoleAccess";
import { ROLE_BADGE, type RoleType } from "@/shared/constants/roles";
import { useStripeConnect } from "@/features/dashboard/hooks/useStripeConnect";
import { fetchMyAffiliations } from "@/features/venue-affiliation/api/venueAffiliations";
import { useMyAppointments } from "@/features/appointment/hooks/useAppointments";
import { usePartnershipProposals } from "@/features/partnership/hooks/usePartnerships";
import { fetchInvestments } from "@/shared/api/investments";

interface Step {
  label: string;
  detail: string;
  href?: string;
  /** `null` while the data that decides it is still loading. */
  done: boolean | null;
}

interface ListingTotals {
  venues: number;
  events: number;
  assets: number;
  /** Services and performances share one model, so one count covers both. */
  services: number;
}

const DISMISS_KEY = "getting-started-dismissed";

function readDismissed(): RoleType[] {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    return raw ? (JSON.parse(raw) as RoleType[]) : [];
  } catch {
    return [];
  }
}

/**
 * "Getting started" checklist on the creator dashboard — one tab per role the
 * person holds, each a short list of the first things that role needs to do.
 * Every step ticks itself off from real data (a first listing, payouts
 * connected, a venue approval…), so it reflects where they actually are, and
 * a role's tab disappears once its steps are all done or it's dismissed.
 */
export function RoleGettingStarted({
  totals,
  onlyRole,
}: {
  totals: ListingTotals;
  /** Show just this role's checklist (for a page that belongs to one role). */
  onlyRole?: RoleType;
}) {
  const user = useAuthStore((s) => s.user);
  const access = useRoleAccess();
  const roleType = user?.roleType ?? [];
  const isOrganizer = roleType.includes("organizer");

  // Read after mount: localStorage doesn't exist during SSR.
  const [dismissed, setDismissed] = useState<RoleType[]>([]);
  useEffect(() => setDismissed(readDismissed()), []);

  const { status: stripe, loading: stripeLoading } = useStripeConnect();
  const payoutsDone = stripeLoading ? null : !!stripe?.stripeOnboardingComplete;

  const ownsAffiliationSide = access.canManageEvents || access.canManageVenues;
  const affiliations = useQuery({
    queryKey: ["affiliations", "mine"],
    queryFn: fetchMyAffiliations,
    enabled: ownsAffiliationSide,
  });
  const { mine: appointments } = useMyAppointments(isOrganizer);
  const proposals = usePartnershipProposals();
  const investments = useQuery({
    queryKey: ["investments", "mine-count", user?.id],
    queryFn: () => fetchInvestments({ partnerId: user!.id, limit: 1 }),
    enabled: access.canProposePartnerships && !!user?.id,
  });

  const payoutStep: Step = {
    label: "Connect your payout account",
    detail: "So the money from your bookings can reach your bank.",
    href: "/creator-dashboard/stripe-onboard",
    done: payoutsDone,
  };
  const approved = (list?: { status: string }[]) =>
    affiliations.isPending
      ? null
      : !!list?.some((a) => a.status === "approved");

  const checklists: { role: RoleType; steps: Step[] }[] = [];
  if (access.canManageVenues)
    checklists.push({
      role: "venueFoxer",
      steps: [
        {
          label: "List your first venue",
          detail: "Photos, capacity, pricing and the days it's available.",
          href: "/venue-foxer/create-venue",
          done: totals.venues > 0,
        },
        payoutStep,
        {
          label: "Approve an Event Foxer",
          detail:
            "Event Foxers apply to host at your venue — or invite one yourself.",
          href: "/foxer/affiliations",
          done: approved(affiliations.data?.asVenueMayor),
        },
      ],
    });
  if (access.canManageEvents)
    checklists.push({
      role: "eventFoxer",
      steps: [
        {
          label: "Get approved to host at a venue",
          detail:
            "An event can only be published at a venue that approved you.",
          href: "/foxer/affiliations",
          done: approved(affiliations.data?.asEventFoxer),
        },
        {
          label: "Build your first event",
          detail:
            "Bundle a venue, gear and services into one bookable package.",
          href: "/foxer/create-event",
          done: totals.events > 0,
        },
        payoutStep,
      ],
    });
  if (access.canManageInventory)
    checklists.push({
      role: "gearFoxer",
      steps: [
        {
          label: "List your first item",
          detail: "Sound, lighting, furniture — with stock and a daily rate.",
          href: "/foxer/create-listing",
          done: totals.assets > 0,
        },
        payoutStep,
      ],
    });
  if (access.canManageServices)
    checklists.push({
      role: "serviceFoxer",
      steps: [
        {
          label: "List your first service",
          detail: "Catering, design, staffing — your packages and pricing.",
          href: "/foxer/create-service",
          done: totals.services > 0,
        },
        payoutStep,
      ],
    });
  if (access.canManagePerformers)
    checklists.push({
      role: "performerFoxer",
      steps: [
        {
          label: "List your first performance",
          detail: "Photography, DJ sets, live music, hosting and more.",
          href: "/foxer/create-service?type=performer",
          done: totals.services > 0,
        },
        payoutStep,
      ],
    });
  if (isOrganizer)
    checklists.push({
      role: "organizer",
      steps: [
        {
          label: "Join your first team",
          detail:
            "Accept an invitation below, or ask to join a venue or event that's open to Organizers.",
          done: appointments.isPending
            ? null
            : !!appointments.data?.some((a) => a.state === "active"),
        },
      ],
    });
  if (access.canProposePartnerships)
    checklists.push({
      role: "investor",
      steps: [
        {
          label: "Register inventory or capital",
          detail: "What you're putting to work — equipment, or funds.",
          href: "/foxer/create-investment",
          done: investments.isPending
            ? null
            : (investments.data?.total ?? 0) > 0,
        },
        {
          label: "Send your first proposal",
          detail: "Find an event or venue open to partners and propose a deal.",
          href: "/republic/investments",
          done: proposals.isPending
            ? null
            : !!proposals.data?.some((p) => p.partnerId === user?.id),
        },
        payoutStep,
      ],
    });

  const shown = onlyRole
    ? checklists.filter((c) => c.role === onlyRole)
    : checklists;
  const visible = shown.filter(
    (c) =>
      !dismissed.includes(c.role) && !c.steps.every((s) => s.done === true),
  );
  const [activeRole, setActiveRole] = useState<RoleType | null>(null);
  const current =
    visible.find((c) => c.role === activeRole) ?? visible[0] ?? null;

  const hiddenCount = shown.filter(
    (c) =>
      dismissed.includes(c.role) && !c.steps.every((s) => s.done === true),
  ).length;

  const restore = () => {
    setDismissed([]);
    try {
      localStorage.removeItem(DISMISS_KEY);
    } catch {
      // Storage unavailable — nothing was persisted to clear.
    }
  };

  if (!current) {
    if (hiddenCount === 0) return null;
    return (
      <div className="mb-10 flex justify-end">
        <button
          type="button"
          onClick={restore}
          className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          Show getting-started guide
        </button>
      </div>
    );
  }

  const doneCount = current.steps.filter((s) => s.done === true).length;
  const badge = ROLE_BADGE[current.role];

  const dismiss = (role: RoleType) => {
    const next = [...dismissed, role];
    setDismissed(next);
    try {
      localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable — it just reappears next visit.
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-surface/60 p-6 sm:p-8 mb-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-white">
            Getting started as {badge.label}
          </h2>
          <p className="text-xs text-white/50 mt-1">
            {doneCount} of {current.steps.length} done
          </p>
        </div>
        <div className="flex items-center gap-4">
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={restore}
              className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              Show hidden guides
            </button>
          )}
          <button
            type="button"
            onClick={() => dismiss(current.role)}
            className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
          >
            Hide this guide
          </button>
        </div>
      </div>

      {visible.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5" role="tablist">
          {visible.map((c) => {
            const b = ROLE_BADGE[c.role];
            const selected = c.role === current.role;
            return (
              <button
                key={c.role}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveRole(c.role)}
                className="px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer"
                style={
                  selected
                    ? {
                        backgroundColor: b.color,
                        borderColor: b.color,
                        color: "#000",
                      }
                    : { borderColor: `${b.color}55`, color: b.color }
                }
              >
                {b.label}
              </button>
            );
          })}
        </div>
      )}

      <div
        className="h-1 rounded-full bg-white/10 mb-5 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${(doneCount / current.steps.length) * 100}%`,
            backgroundColor: badge.color,
          }}
        />
      </div>

      <ol className="space-y-3">
        {current.steps.map((step) => {
          const body = (
            <>
              <span
                className="material-symbols-outlined text-[22px] shrink-0"
                style={{
                  color: step.done ? badge.color : "color-mix(in srgb, var(--color-white) 25%, transparent)",
                }}
                aria-hidden="true"
              >
                {step.done === null
                  ? "progress_activity"
                  : step.done
                    ? "check_circle"
                    : "radio_button_unchecked"}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-sm font-semibold ${step.done ? "text-white/40 line-through" : "text-white"}`}
                >
                  {step.label}
                </span>
                <span className="block text-xs text-white/45">
                  {step.detail}
                </span>
              </span>
              {step.href && !step.done && (
                <span
                  className="material-symbols-outlined text-[18px] text-white/30 shrink-0"
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              )}
              <span className="sr-only">
                {step.done ? "Done" : step.done === null ? "Checking" : "To do"}
              </span>
            </>
          );
          return (
            <li key={step.label}>
              {step.href && !step.done ? (
                <Link
                  href={step.href}
                  className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/3 p-4 hover:bg-white/6 transition-colors"
                >
                  {body}
                </Link>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/3 p-4">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
