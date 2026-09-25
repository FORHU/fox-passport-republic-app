"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  EntitySearchPicker,
  PickerItem,
} from "./EntitySearchPicker";
import {
  VenueAffiliation,
  approveAffiliation,
  cancelAffiliation,
  fetchVenueAffiliates,
  inviteEventFoxer,
  rejectAffiliation,
  revokeAffiliation,
} from "@/features/venue-affiliation/api/venueAffiliations";
import { fetchEventFoxers } from "@/features/search/api/search";

async function searchEventFoxers(query: string): Promise<PickerItem[]> {
  const { items } = await fetchEventFoxers(1, 8, { q: query });
  return items.map((f) => ({
    id: f.id,
    label: f.name,
    sublabel: f.city || undefined,
  }));
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  approved: "bg-accent/10 text-accent",
  rejected: "bg-red-500/10 text-red-400",
  revoked: "bg-white/10 text-white/50",
};

// A venue's own "who can attach their event templates here" roster — the
// mayor's side of an affiliation. Lives on the venue's edit page (not the
// cross-venue /foxer/affiliations dashboard) because every action here is
// already scoped to this one venue: no venue picker needed, and the
// affiliate list is naturally "this venue's team," not "all my venues'
// affiliations mixed together."
// `asOrganizer`: shown to one of the venue's Organizers rather than its mayor
// (the API's docs/adr/0005). They decide applications, but inviting,
// withdrawing and revoking stay the mayor's, and so does approving one that
// carries a negotiated price. The API refuses all of these regardless.
export function VenueAffiliatesSection({
  venueId,
  asOrganizer = false,
}: {
  venueId: string;
  asOrganizer?: boolean;
}) {
  const [affiliates, setAffiliates] = useState<VenueAffiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteFoxer, setInviteFoxer] = useState<PickerItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await fetchVenueAffiliates(venueId);
      setAffiliates(result);
    } catch {
      toast.error("Failed to load this venue's affiliates");
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    load();
  }, [load]);

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

  const handleInvite = async () => {
    if (!inviteFoxer) return;
    await withBusy("invite", async () => {
      await inviteEventFoxer(venueId, inviteFoxer.id);
      toast.success(`Invitation sent to ${inviteFoxer.label}`);
      setInviteFoxer(null);
    });
  };

  return (
    <div className="rounded-[2rem] border-2 border-dashed border-white/10 bg-[#0f111a]/30 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">
              group
            </span>
            Event Foxer Affiliates
          </h3>
          <p className="text-xs text-text-muted">
            Approved Event Foxers may attach this venue to their templates
            and manage its calendar — never your listing or your payouts.
          </p>
        </div>
        <span className="bg-white/5 text-white/70 px-3 py-1 rounded-full text-xs font-bold border border-white/5">
          {affiliates.length}
        </span>
      </div>

      {!asOrganizer && (
        <div className="flex gap-2 mb-6">
          <div className="flex-1">
            <EntitySearchPicker
            selected={inviteFoxer}
            onSelect={setInviteFoxer}
            search={searchEventFoxers}
            placeholder="Search Event Foxers by name…"
            searchPlaceholder="Type a name…"
          />
        </div>
        <button
          disabled={busyId === "invite" || !inviteFoxer}
          onClick={handleInvite}
          className="px-4 py-2 rounded-xl bg-accent text-black text-sm font-bold disabled:opacity-50"
        >
          Invite
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-20 text-text-muted">
          <p className="text-sm opacity-50">Loading…</p>
        </div>
      ) : affiliates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-20 text-text-muted pointer-events-none">
          <span className="material-symbols-outlined text-3xl mb-2 opacity-30">
            group
          </span>
          <p className="text-sm opacity-50">
            No one has applied to or been invited to this venue yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {affiliates.map((aff) => {
            // The party that did NOT initiate is the one who may decide —
            // here that's only relevant for applications an Event Foxer
            // sent in (invites the mayor sent are decided by the Event
            // Foxer, elsewhere).
            const iAmDecider = aff.initiatedBy === "eventFoxer";
            const needsMayor =
              asOrganizer && aff.agreedPrice != null;
            return (
              <div
                key={aff.id}
                className="bg-[#1a1d2d] border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm truncate">
                    {aff.eventFoxer?.name ?? aff.eventFoxerId}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {aff.initiatedBy === "eventFoxer" ? "Applied" : "Invited"}{" "}
                    · {new Date(aff.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[aff.status] ?? "bg-white/10 text-white/60"}`}
                  >
                    {aff.status}
                  </span>
                  {aff.status === "pending" && iAmDecider && (
                    <>
                      {needsMayor ? (
                        <span
                          className="px-2.5 py-1 rounded-lg bg-white/5 text-white/50 text-[11px] font-bold"
                          title="This application sets a price, so the venue's mayor approves it"
                        >
                          Mayor approves
                        </span>
                      ) : (
                        <button
                          disabled={busyId === aff.id}
                          onClick={() =>
                            withBusy(aff.id, () => approveAffiliation(aff.id))
                          }
                          className="px-2.5 py-1 rounded-lg bg-accent text-black text-[11px] font-bold disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        disabled={busyId === aff.id}
                        onClick={() =>
                          withBusy(aff.id, () => rejectAffiliation(aff.id))
                        }
                        className="px-2.5 py-1 rounded-lg bg-white/10 text-white/80 text-[11px] font-bold disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {!asOrganizer && aff.status === "pending" && !iAmDecider && (
                    <button
                      disabled={busyId === aff.id}
                      onClick={() =>
                        withBusy(aff.id, () => cancelAffiliation(aff.id))
                      }
                      className="px-2.5 py-1 rounded-lg bg-white/5 text-white/50 text-[11px] font-bold disabled:opacity-50"
                      title="Withdraw this invitation"
                    >
                      Cancel
                    </button>
                  )}
                  {!asOrganizer && aff.status === "approved" && (
                    <button
                      disabled={busyId === aff.id}
                      onClick={() =>
                        withBusy(aff.id, () => revokeAffiliation(aff.id))
                      }
                      className="px-2.5 py-1 rounded-lg bg-white/5 text-white/50 text-[11px] font-bold disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
