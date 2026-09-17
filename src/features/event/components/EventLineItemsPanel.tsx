"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import {
  fetchEventLineItems,
  addAdHocItem,
  reviewLineItem,
  browseAddableAssets,
  browseAddableServices,
  type BrowsableItem,
} from "@/features/event/api/marketplaceItems";
import { LineItemStatusBadge } from "./LineItemStatusBadge";

export interface EventLineItemsPanelProps {
  eventId: string;
  /** Lets the sibling payment panel disable "Pay Now" before the citizen
   * even tries — rather than only finding out from a 409 after clicking. */
  onBlockingChange?: (hasBlockingItems: boolean) => void;
}

const KIND_LABEL: Record<string, string> = {
  venue: "Venue",
  asset: "Gear",
  service: "Talent",
};

export function EventLineItemsPanel({
  eventId,
  onBlockingChange,
}: EventLineItemsPanelProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const queryKey = ["eventLineItems", eventId];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchEventLineItems(eventId),
    enabled: !!eventId,
  });

  const items = data?.items ?? [];
  const isOwner = !!user && !!data?.clientId && user.id === data.clientId;
  const bookingId = data?.bookingId;

  const blockingCount = items.filter(
    (i) => i.status === "pending_provider_confirmation",
  ).length;

  useEffect(() => {
    onBlockingChange?.(blockingCount > 0);
  }, [blockingCount, onBlockingChange]);

  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseKind, setBrowseKind] = useState<"asset" | "service">("asset");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const { data: browseItems, isLoading: isBrowseLoading } = useQuery({
    queryKey: ["marketplaceBrowse", browseKind],
    queryFn: () =>
      browseKind === "asset" ? browseAddableAssets() : browseAddableServices(),
    enabled: browseOpen,
  });

  const addMutation = useMutation({
    mutationFn: (item: BrowsableItem) => {
      setPendingActionId(item.id);
      return addAdHocItem(bookingId!, { kind: browseKind, itemId: item.id });
    },
    onSuccess: () => {
      toast.success("Added — waiting for the provider to confirm.");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Could not add this item.",
      );
    },
    onSettled: () => setPendingActionId(null),
  });

  const cancelMutation = useMutation({
    mutationFn: (itemId: string) => {
      setPendingActionId(itemId);
      const item = items.find((i) => i.id === itemId)!;
      return reviewLineItem(item.id, item.kind, "cancel");
    },
    onSuccess: () => {
      toast.success("Removed.");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Could not remove this item.",
      );
    },
    onSettled: () => setPendingActionId(null),
  });

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-6 md:p-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-accent text-2xl">
            inventory_2
          </span>
          <h2 className="text-xl font-display font-bold text-white">
            Booked Items
          </h2>
        </div>
        {isOwner && bookingId && (
          <button
            onClick={() => setBrowseOpen((v) => !v)}
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">
              {browseOpen ? "close" : "add_circle"}
            </span>
            {browseOpen ? "Close" : "Add from marketplace"}
          </button>
        )}
      </div>

      {blockingCount > 0 && (
        <div className="flex items-start gap-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 mb-6">
          <span className="material-symbols-outlined text-yellow-400 text-[18px] mt-0.5 shrink-0">
            hourglass_top
          </span>
          <p className="text-yellow-400 text-sm font-medium">
            {blockingCount} item{blockingCount !== 1 ? "s" : ""} still
            awaiting provider confirmation — you can pay once every item is
            resolved, or remove it now and try something else.
          </p>
        </div>
      )}

      {error ? (
        <div className="text-sm text-red-400">
          Failed to load this event&apos;s items.
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-white/40">No items booked yet.</p>
      ) : (
        <div className="space-y-3 mb-6">
          {items.map((item) => {
            const canRemove =
              isOwner &&
              (item.status === "pending_provider_confirmation" ||
                item.status === "approved");
            const isBusy = pendingActionId === item.id;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 bg-black/20 rounded-xl p-4 border border-white/5"
              >
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold mb-0.5">
                    {KIND_LABEL[item.kind] ?? item.kind}
                  </p>
                  <p className="text-sm font-bold text-white truncate">
                    {item.name}
                  </p>
                  {item.status === "rejected" && item.rejectionReason && (
                    <p className="text-[11px] text-red-400/80 mt-0.5">
                      {item.rejectionReason === "deadline_expired"
                        ? "Provider didn't respond in time"
                        : "Declined by provider"}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-white">
                    ₱{item.agreedPrice.toLocaleString()}
                  </span>
                  <LineItemStatusBadge
                    status={item.status}
                    confirmationDeadline={item.confirmationDeadline}
                  />
                  {canRemove && (
                    <button
                      onClick={() => cancelMutation.mutate(item.id)}
                      disabled={isBusy}
                      className="h-7 w-7 rounded-full bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Remove item"
                    >
                      {isBusy ? (
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">
                          close
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {browseOpen && isOwner && bookingId && (
        <div className="border-t border-white/10 pt-6">
          <div className="flex gap-2 mb-4">
            {(["asset", "service"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setBrowseKind(k)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  browseKind === k
                    ? "bg-accent text-black"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {k === "asset" ? "Gear" : "Talent"}
              </button>
            ))}
          </div>

          {isBrowseLoading ? (
            <div className="flex justify-center py-6">
              <span className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
            </div>
          ) : !browseItems || browseItems.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-4">
              Nothing available right now.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {browseItems.map((bi) => {
                const isBusy = pendingActionId === bi.id;
                return (
                  <div
                    key={bi.id}
                    className="flex items-center justify-between gap-3 bg-black/20 rounded-xl p-3 border border-white/5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {bi.name}
                      </p>
                      <p className="text-xs text-white/40">
                        ₱{bi.price.toLocaleString()} / {bi.billingRate}
                        {bi.ownerName ? ` · ${bi.ownerName}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => addMutation.mutate(bi)}
                      disabled={isBusy}
                      className="shrink-0 h-8 px-3 rounded-full bg-accent text-black text-xs font-bold hover:bg-[#b3e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {isBusy ? (
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                      ) : (
                        "Add"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-[10px] text-white/30 mt-3">
            Added items require the provider&apos;s confirmation before they
            count toward your total — you&apos;ll see their status above.
          </p>
        </div>
      )}
    </div>
  );
}
