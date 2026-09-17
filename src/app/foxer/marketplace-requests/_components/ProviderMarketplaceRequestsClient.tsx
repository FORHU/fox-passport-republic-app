"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchProviderMarketplaceItems,
  reviewLineItem,
  type ProviderDashboard,
  type ProviderLineItem,
} from "@/features/event/api/marketplaceItems";
import { LineItemStatusBadge } from "@/features/event/components/LineItemStatusBadge";

type Kind = "asset" | "service" | "venue";

/**
 * Provider-facing confirm/reject for ad-hoc marketplace picks. Deliberately
 * shows every status, not just pending_provider_confirmation — a provider
 * who declined or confirmed something recently benefits from seeing the
 * outcome, not just the queue of new asks. Confirm/reject both route
 * through the same PATCH /event-transactions/:id/review endpoint the
 * citizen-facing cancel action uses; the server (TransactionStatusSvc)
 * decides who's allowed to do what, not this page.
 */
export default function ProviderMarketplaceRequestsClient() {
  const [data, setData] = useState<ProviderDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const result = await fetchProviderMarketplaceItems();
      setData(result);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleReview = async (
    item: ProviderLineItem,
    kind: Kind,
    action: "confirm" | "reject",
  ) => {
    setBusyId(item.id);
    try {
      await reviewLineItem(item.id, kind, action);
      toast.success(action === "confirm" ? "Confirmed" : "Declined");
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

  const rows: { item: ProviderLineItem; kind: Kind }[] = data
    ? [
        ...data.assets.map((item) => ({ item, kind: "asset" as const })),
        ...data.services.map((item) => ({ item, kind: "service" as const })),
        ...data.venues.map((item) => ({ item, kind: "venue" as const })),
      ]
    : [];

  // Awaiting-confirmation first, so the action a provider actually needs to
  // take is never buried below already-resolved history.
  rows.sort((a, b) => {
    const rank = (s: string) =>
      s === "pending_provider_confirmation" ? 0 : s === "pending" ? 1 : 2;
    return rank(a.item.status) - rank(b.item.status);
  });

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-display font-bold mb-2">
          Marketplace Requests
        </h1>
        <p className="text-sm text-white/50 mb-8">
          Ad-hoc bookings citizens have added directly — confirm what you can
          fulfil, decline what you can&apos;t. Requests you don&apos;t
          respond to expire automatically and release back to availability.
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : loadError ? (
          <div className="text-sm text-red-400 flex items-center gap-3">
            Failed to load your requests.
            <button onClick={load} className="underline hover:text-white">
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-white/40">No requests yet.</p>
        ) : (
          <div className="space-y-3">
            {rows.map(({ item, kind }) => {
              const isBusy = busyId === item.id;
              const isPending = item.status === "pending_provider_confirmation";
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold mb-0.5">
                      {kind}
                    </p>
                    <p className="text-sm font-bold text-white truncate">
                      {item.asset?.name ?? item.service?.name ?? "Item"}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {item.event.name}
                      {item.event.client?.name
                        ? ` · ${item.event.client.name}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-white">
                      ₱{Number(item.agreedPrice ?? 0).toLocaleString()}
                    </span>
                    <LineItemStatusBadge
                      status={item.status}
                      confirmationDeadline={item.confirmationDeadline}
                    />
                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReview(item, kind, "confirm")}
                          disabled={isBusy}
                          className="h-8 px-3 rounded-full bg-accent text-black text-xs font-bold hover:bg-[#b3e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isBusy ? "…" : "Confirm"}
                        </button>
                        <button
                          onClick={() => handleReview(item, kind, "reject")}
                          disabled={isBusy}
                          className="h-8 px-3 rounded-full bg-white/10 text-white/70 text-xs font-bold hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
