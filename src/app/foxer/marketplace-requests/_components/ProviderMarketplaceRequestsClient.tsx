"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  canDeclineBooked,
  fetchProviderMarketplaceItems,
  isPaidBooked,
  reviewLineItem,
  type DeclineCause,
  type ProviderDashboard,
  type ProviderLineItem,
} from "@/features/event/api/marketplaceItems";
import { LineItemStatusBadge } from "@/features/event/components/LineItemStatusBadge";
import { Money } from "@/shared/components/ui/Money";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { getApiErrorMessage } from "@/shared/lib/apiError";

type Kind = "asset" | "service" | "venue";

const itemName = (item: ProviderLineItem) =>
  item.asset?.name ?? item.service?.name ?? item.venue?.name ?? "Item";

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
  // The booked line a Provider or Mayor is about to decline (ADR 0010).
  const [declining, setDeclining] = useState<{
    item: ProviderLineItem;
    kind: Kind;
  } | null>(null);

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

  const handleDecline = async (cause: DeclineCause) => {
    if (!declining) return;
    const { item, kind } = declining;
    setBusyId(item.id);
    try {
      await reviewLineItem(item.id, kind, "decline", cause);
      toast.success("You declined. The host and the citizen were told.");
    } catch (error: unknown) {
      // Paid meanwhile, or already answered: the API says which.
      toast.error(
        getApiErrorMessage(error, "We couldn't update that request. Try again."),
      );
    } finally {
      setBusyId(null);
      await load();
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
        <Link
          href="/"
          className="text-xs text-white/40 hover:text-white/70 transition-colors mb-3 inline-block"
        >
          ← Home
        </Link>
        <h1 className="text-2xl font-display font-bold mb-2">
          Marketplace Requests
        </h1>
        <p className="text-sm text-white/50 mb-8">
          Requests and bookings for your listings. Confirm what you can
          fulfil and decline what you can&apos;t; requests you don&apos;t
          answer expire and release back to availability. You can still
          decline a booked event until the citizen pays, and its host is then
          asked to replace you.
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
              const declinable = canDeclineBooked(item);
              const paid = isPaidBooked(item);
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
                      {itemName(item)}
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
                      <Money amount={item.agreedPrice ?? 0} />
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
                          className="h-8 px-3 rounded-full bg-accent text-black text-xs font-bold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {declinable && (
                      <button
                        onClick={() => setDeclining({ item, kind })}
                        disabled={isBusy}
                        className="h-8 px-3 rounded-full border border-red-500/40 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isBusy ? "…" : "Decline"}
                      </button>
                    )}
                    {paid && (
                      <span
                        className="text-[11px] text-white/40"
                        title="The citizen has paid, so only the cancellation policy applies."
                      >
                        Paid
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={declining !== null}
        onOpenChange={(open) => {
          if (!open) setDeclining(null);
        }}
        tone="danger"
        title="Decline this booking?"
        description={
          declining
            ? `${itemName(declining.item)} for ${declining.item.event.name}. The event host and the citizen are told, and the host is asked to replace you. You cannot undo this.`
            : undefined
        }
        confirmLabel="Decline this booking"
        onConfirm={() => handleDecline("other")}
        secondaryAction={{
          label: "I'm busy then",
          onConfirm: () => handleDecline("busy"),
        }}
      />
    </div>
  );
}
