"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { canAccessAdmin } from "@/shared/lib/permissions";
import { StyledSelect } from "@/shared/components/ui/StyledSelect";
import {
  fetchDisputedBookings,
  resolveDispute,
  issueItemizedRefund,
  type DisputeRecord,
} from "@/features/booking/api/bookings";

const DISPUTE_STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  approved: "bg-accent/10 text-accent",
  rejected: "bg-white/10 text-white/50",
  refunded: "bg-green-500/10 text-green-400",
  refund_failed: "bg-red-500/10 text-red-400",
};

function DisputeBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${DISPUTE_STATUS_STYLES[status] ?? "bg-white/10 text-white/60"}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

/**
 * Admin surface for both refund paths this app has:
 *  - Disputes below resolve via the EXISTING whole-booking flow
 *    (approve = retry the Stripe refund, reject = settle by hand, no new
 *    Stripe call, no remaining-balance check).
 *  - The itemized form is the Phase B addition — refunds ONE asset/service
 *    transaction, validated against what's actually left refundable on it,
 *    and does call Stripe. See the api repo's
 *    docs/adr/0005-itemized-refunds-vs-bookkeeping-refunds.md for exactly
 *    why both exist and neither is escrow/buyer-protected.
 *
 * There is no "browse all paid transactions" admin list yet — an admin
 * enters the transaction id directly (found via the dispute/booking record,
 * or the provider/citizen support conversation). Building a full
 * transaction browser is a separate, larger feature.
 */
export default function AdminRefundsClient() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [loadingDisputes, setLoadingDisputes] = useState(true);
  const [disputesError, setDisputesError] = useState(false);
  const [busyDisputeId, setBusyDisputeId] = useState<string | null>(null);

  const [form, setForm] = useState({
    transactionId: "",
    kind: "asset" as "asset" | "service",
    amount: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{
    id: string;
    status: string;
    alreadyPaidOutWarning?: boolean;
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !canAccessAdmin(user)) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  const loadDisputes = useCallback(async () => {
    setDisputesError(false);
    try {
      const result = await fetchDisputedBookings();
      setDisputes(result);
    } catch {
      setDisputesError(true);
    } finally {
      setLoadingDisputes(false);
    }
  }, []);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const handleResolve = async (
    disputeId: string,
    action: "approve" | "reject",
  ) => {
    setBusyDisputeId(disputeId);
    try {
      await resolveDispute(disputeId, action);
      toast.success(action === "approve" ? "Refund retried" : "Marked resolved");
      await loadDisputes();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Something went wrong";
      toast.error(message);
    } finally {
      setBusyDisputeId(null);
    }
  };

  const handleItemizedRefund = async () => {
    const amount = Number(form.amount);
    if (!form.transactionId.trim()) {
      toast.error("Enter a transaction id");
      return;
    }
    if (!amount || amount <= 0) {
      toast.error("Enter a refund amount greater than zero");
      return;
    }
    if (!form.reason.trim()) {
      toast.error("Enter a reason — it's recorded on the refund permanently");
      return;
    }

    setSubmitting(true);
    setLastResult(null);
    try {
      const refund = await issueItemizedRefund(form.transactionId.trim(), {
        kind: form.kind,
        amount,
        reason: form.reason.trim(),
      });
      setLastResult({
        id: refund.id,
        status: refund.status,
        alreadyPaidOutWarning: refund.alreadyPaidOutWarning,
      });
      toast.success(`Refund ${refund.status}`);
      setForm({ transactionId: "", kind: "asset", amount: "", reason: "" });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Could not issue this refund";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user || !canAccessAdmin(user)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <span className="h-6 w-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-10">
        <div>
          <h1 className="text-2xl font-display font-bold mb-2">Refunds</h1>
          <p className="text-sm text-white/50">
            Whole-booking disputes and itemized single-item refunds — two
            different mechanisms, see the section headers below.
          </p>
        </div>

        {/* Itemized refund — Phase B */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-1">Itemized refund</h2>
          <p className="text-xs text-white/40 mb-5">
            Refunds a single asset or service transaction. Calls Stripe and
            is validated against what&apos;s actually left refundable on
            that item — cannot exceed it.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-white/50 block mb-1">
                Transaction ID
              </label>
              <input
                value={form.transactionId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, transactionId: e.target.value }))
                }
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                placeholder="event-asset or event-service transaction id"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Kind</label>
              <StyledSelect
                value={form.kind}
                onChange={(v) =>
                  setForm((f) => ({ ...f, kind: v as "asset" | "service" }))
                }
                options={[
                  { value: "asset", label: "Asset (gear)" },
                  { value: "service", label: "Service (talent)" },
                ]}
                className="py-2"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">
                Amount (₱)
              </label>
              <input
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Reason</label>
              <input
                value={form.reason}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reason: e.target.value }))
                }
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                placeholder="Recorded permanently on the refund"
              />
            </div>
          </div>

          <button
            onClick={handleItemizedRefund}
            disabled={submitting}
            className="h-9 px-5 rounded-full bg-accent text-black text-sm font-bold hover:bg-[#b3e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                Issuing…
              </>
            ) : (
              "Issue refund"
            )}
          </button>

          {lastResult && (
            <div className="mt-4 bg-black/30 border border-white/10 rounded-lg p-3 text-xs">
              <p className="text-white/70">
                Refund <span className="font-mono">{lastResult.id}</span> —{" "}
                <span className="font-bold">{lastResult.status}</span>
              </p>
              {lastResult.alreadyPaidOutWarning && (
                <p className="text-yellow-400 mt-2 flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[14px] mt-0.5">
                    warning
                  </span>
                  This provider was already paid out for this item. This
                  refund does not automatically claw that back — recover it
                  from the provider out-of-band if needed.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Existing whole-booking disputes */}
        <section>
          <h2 className="text-lg font-bold mb-1">Booking disputes</h2>
          <p className="text-xs text-white/40 mb-5">
            Whole-booking refunds — no itemization, no Stripe call for a
            manual settlement. Approve retries the automated Stripe refund;
            reject settles it by hand.
          </p>

          {loadingDisputes ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : disputesError ? (
            <div className="text-sm text-red-400 flex items-center gap-3">
              Failed to load disputes.
              <button onClick={loadDisputes} className="underline hover:text-white">
                Retry
              </button>
            </div>
          ) : disputes.length === 0 ? (
            <p className="text-sm text-white/40">No open disputes.</p>
          ) : (
            <div className="space-y-3">
              {disputes.map((d) => {
                const isBusy = busyDisputeId === d.id;
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-4 bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">
                        {d.booking?.event?.name ??
                          d.booking?.service?.name ??
                          d.booking?.asset?.name ??
                          "Booking"}
                      </p>
                      <p className="text-xs text-white/40 truncate">
                        {d.citizen?.name} · {d.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <DisputeBadge status={d.status} />
                      {d.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResolve(d.id, "approve")}
                            disabled={isBusy}
                            className="h-8 px-3 rounded-full bg-accent text-black text-xs font-bold hover:bg-[#b3e600] transition-colors disabled:opacity-50"
                          >
                            {isBusy ? "…" : "Approve"}
                          </button>
                          <button
                            onClick={() => handleResolve(d.id, "reject")}
                            disabled={isBusy}
                            className="h-8 px-3 rounded-full bg-white/10 text-white/70 text-xs font-bold hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
