"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { fetchVenueById, fetchVenuesByViewport } from "@/features/venue/api/venues";
import {
  EntitySearchPicker,
  PickerItem,
} from "@/features/venue-affiliation/components/EntitySearchPicker";
import {
  MyAffiliations,
  VenueAffiliation,
  applyToVenue,
  approveAffiliation,
  cancelAffiliation,
  fetchMyAffiliations,
  rejectAffiliation,
} from "@/features/venue-affiliation/api/venueAffiliations";

async function searchVenues(query: string): Promise<PickerItem[]> {
  const { venues } = await fetchVenuesByViewport({ search: query, limit: 8 });
  return venues.map((v: any) => ({
    id: v.id,
    label: v.name,
    sublabel: [v.city, v.state].filter(Boolean).join(", ") || undefined,
  }));
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  approved: "bg-accent/10 text-accent",
  rejected: "bg-red-500/10 text-red-400",
  revoked: "bg-white/10 text-white/50",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[status] ?? "bg-white/10 text-white/60"}`}
    >
      {status}
    </span>
  );
}

// The Event Foxer's own side of a venue affiliation: venues they've applied
// to host at, and invitations venues have sent them. The venue mayor's side
// — inviting an Event Foxer, and deciding on applications/invites for one
// specific venue — lives on that venue's own edit page
// (VenueAffiliatesSection), not here: those actions are already scoped to a
// single venue the mayor is looking at, so a second venue picker here would
// just be redundant.
export default function VenueAffiliationDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillVenueId = searchParams.get("venueId") ?? "";

  const [affiliations, setAffiliations] = useState<VenueAffiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyVenue, setApplyVenue] = useState<PickerItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result: MyAffiliations = await fetchMyAffiliations();
      setAffiliations(result.asEventFoxer);
    } catch {
      toast.error("Failed to load your applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Prefill the picker when arriving from a venue's page (?venueId=) — look
  // the venue up so it shows a name, not just holds an id.
  useEffect(() => {
    if (!prefillVenueId) return;
    fetchVenueById(prefillVenueId)
      .then((v) =>
        v ? setApplyVenue({ id: v.id, label: v.name, sublabel: v.city }) : null,
      )
      .catch(() => null);
  }, [prefillVenueId]);

  const withBusy = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    try {
      await fn();
      await load();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Something went wrong";
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  };

  const handleApply = async () => {
    if (!applyVenue) {
      toast.error("Search for a venue to apply to");
      return;
    }
    await withBusy("apply", async () => {
      await applyToVenue(applyVenue.id);
      toast.success(`Application sent to ${applyVenue.label}`);
      setApplyVenue(null);
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0c14] text-white px-6 py-10 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-white/50 hover:text-white text-sm mb-6 flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-[18px]">
          arrow_back
        </span>
        Back
      </button>

      <h1 className="font-display font-bold text-2xl mb-1">
        Venue Affiliations
      </h1>
      <p className="text-sm text-text-muted mb-8">
        Apply to host events at a venue. Approval lets you attach that venue
        to your templates and manage its calendar — never its listing or its
        payouts. Managing who may host at your own venue happens on that
        venue&apos;s edit page.
      </p>

      <section>
        <h2 className="font-bold text-sm uppercase tracking-wider text-white/50 mb-3">
          Apply to host at a venue
        </h2>
        <div className="flex gap-2 mb-6">
          <div className="flex-1">
            <EntitySearchPicker
              selected={applyVenue}
              onSelect={setApplyVenue}
              search={searchVenues}
              placeholder="Search venues by name or city…"
              searchPlaceholder="Type a venue name…"
            />
          </div>
          <button
            disabled={busyId === "apply" || !applyVenue}
            onClick={handleApply}
            className="px-4 py-2 rounded-xl bg-accent text-black text-sm font-bold disabled:opacity-50"
          >
            Apply
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : affiliations.length === 0 ? (
          <p className="text-sm text-text-muted">
            No applications or invitations yet.
          </p>
        ) : (
          <div className="space-y-2">
            {affiliations.map((aff) => {
              // Invites come from the venue mayor, so the Event Foxer is the
              // one who decides; applications the Event Foxer sent in wait
              // on the mayor instead — only cancel (withdraw) applies here.
              const iAmDecider = aff.initiatedBy === "venueFoxer";
              return (
                <div
                  key={aff.id}
                  className="flex items-center justify-between gap-3 bg-[#161b26] border border-white/5 rounded-xl p-4"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">
                      {aff.venue?.name ?? aff.venueId}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {aff.initiatedBy === "eventFoxer" ? "Applied" : "Invited"}{" "}
                      · {new Date(aff.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={aff.status} />
                    {aff.status === "pending" && iAmDecider && (
                      <>
                        <button
                          disabled={busyId === aff.id}
                          onClick={() =>
                            withBusy(aff.id, () => approveAffiliation(aff.id))
                          }
                          className="px-2.5 py-1 rounded-lg bg-accent text-black text-[11px] font-bold disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          disabled={busyId === aff.id}
                          onClick={() =>
                            withBusy(aff.id, () => rejectAffiliation(aff.id))
                          }
                          className="px-2.5 py-1 rounded-lg bg-white/10 text-white/80 text-[11px] font-bold disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {aff.status === "pending" && !iAmDecider && (
                      <button
                        disabled={busyId === aff.id}
                        onClick={() =>
                          withBusy(aff.id, () => cancelAffiliation(aff.id))
                        }
                        className="px-2.5 py-1 rounded-lg bg-white/5 text-white/50 text-[11px] font-bold disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
