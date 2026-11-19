"use client";

import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { pollWhileVisible } from "@/shared/lib/realtime";
import { formatCurrency } from "@/shared/lib/currency";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { hasPermission } from "@/shared/lib/permissions";
import { AdminListPager } from "./AdminListPager";

/**
 * Payouts that didn't reach their recipient (api#363, app#346), from
 * `GET /admin/payouts?status=failed`, with a Retry for the ones that can be
 * sent again. "Not onboarded" ones also go out on their own once the
 * recipient finishes Stripe setup; "cancelled or refunded" ones never do.
 */

type FailureReason = "not_onboarded" | "stripe_error" | "source_refunded";

export type AdminPayout = {
  id: string;
  sourceType: string;
  sourceId: string;
  payoutAmount: string | number;
  status: "pending" | "paid" | "failed";
  failureReason: FailureReason | null;
  failureMessage: string | null;
  transferAttempts: number;
  createdAt: string;
  providerUser: { id: string; name: string | null; email: string } | null;
};

type PayoutsResponse = {
  data: AdminPayout[];
  pagination?: { page: number; total: number; totalPages: number };
};

type ReasonFilter = "all" | FailureReason;

const REASONS: { value: ReasonFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "not_onboarded", label: "Not onboarded" },
  { value: "stripe_error", label: "Stripe error" },
  { value: "source_refunded", label: "Cancelled or refunded" },
];

const REASON_STYLE: Record<FailureReason, { label: string; color: string }> = {
  not_onboarded: {
    label: "Not onboarded",
    color: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  },
  stripe_error: {
    label: "Stripe error",
    color: "bg-red-500/10 text-red-300 border-red-500/20",
  },
  source_refunded: {
    label: "Cancelled or refunded",
    color: "bg-white/5 text-white/40 border-white/10",
  },
};

const SOURCE_LABEL: Record<string, string> = {
  event_asset_transaction: "Gear",
  event_service_transaction: "Service",
  event_venue_transaction: "Venue",
  event_host_markup: "EventFoxer commission",
  sponsorship: "Sponsorship",
  investor_revenue_share: "Investor share",
};

const amountOf = (p: AdminPayout) => Number(p.payoutAmount) || 0;

/** Whether an admin retry can send this payout (the API refuses the rest). */
export function canRetryPayout(p: AdminPayout): boolean {
  return (
    p.status !== "paid" &&
    p.failureReason !== "source_refunded" &&
    Math.round(amountOf(p) * 100) > 0
  );
}

function dateLabel(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function errorMessage(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback
  );
}

export default function AdminPayoutsPanel() {
  const [reason, setReason] = useState<ReasonFilter>("all");
  const [page, setPage] = useState(1);
  const user = useAuthStore((s) => s.user);
  const mayRetry = hasPermission(user, "payments:manage");
  const qc = useQueryClient();

  const { data, isLoading, isFetching, isError, error, refetch } =
    useQuery<PayoutsResponse>({
      queryKey: ["admin", "payouts", reason, page],
      queryFn: () =>
        api
          .get("/admin/payouts", {
            params: {
              status: "failed",
              page,
              limit: 20,
              ...(reason === "all" ? {} : { failureReason: reason }),
            },
          })
          .then((res) => ({
            data: res.data.data ?? [],
            pagination: res.data.pagination,
          })),
      refetchInterval: pollWhileVisible,
      placeholderData: keepPreviousData,
    });

  const retry = useMutation({
    mutationFn: (id: string) =>
      api
        .post(`/admin/payouts/${id}/retry`)
        .then((res) => res.data.data as AdminPayout | null),
    onSuccess: (payout) => {
      if (payout?.status === "paid") {
        toast.success("Payout sent");
      } else if (payout?.status === "failed") {
        toast.error(
          `Still not sent: ${payout.failureMessage ?? "Stripe refused it"}`,
        );
      } else {
        toast.success("Retry started");
      }
      qc.invalidateQueries({ queryKey: ["admin", "payouts"] });
    },
    onError: (err) =>
      toast.error(errorMessage(err, "Could not retry this payout")),
  });

  const payouts = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <section className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
      <div className="px-6 sm:px-8 py-6 border-b border-white/5">
        <div className="mb-5">
          <h1 className="text-2xl font-display font-bold text-white">
            Failed payouts
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Foxer payouts that didn&apos;t go through. Not-onboarded ones are
            sent automatically when the Foxer finishes Stripe setup.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {REASONS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={reason === tab.value}
              onClick={() => {
                setReason(tab.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                reason === tab.value
                  ? "bg-accent text-black"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-white/30 text-sm">
          Loading...
        </div>
      ) : isError ? (
        <div className="py-16 px-6 text-center text-red-400 text-sm space-y-3">
          <p>{errorMessage(error, "Could not load payouts.")}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/15"
          >
            Try again
          </button>
        </div>
      ) : payouts.length === 0 ? (
        <div className="py-16 text-center text-white/30 text-sm">
          No failed payouts.
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {payouts.map((p) => {
            const style = p.failureReason
              ? REASON_STYLE[p.failureReason]
              : null;
            const recipient =
              p.providerUser?.name || p.providerUser?.email || "Unknown";
            return (
              <li
                key={p.id}
                className="px-6 sm:px-8 py-5 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-white/[0.02]"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-white">
                      {formatCurrency(amountOf(p))}
                    </span>
                    {style && (
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style.color}`}
                      >
                        {style.label}
                      </span>
                    )}
                    <span className="text-xs text-white/40">
                      {SOURCE_LABEL[p.sourceType] ?? p.sourceType}
                    </span>
                  </div>
                  <p className="text-sm text-white/70">
                    {recipient}
                    {p.providerUser?.name && (
                      <span className="text-white/40">
                        {" "}
                        · {p.providerUser.email}
                      </span>
                    )}
                  </p>
                  {p.failureMessage && (
                    <p className="text-xs text-white/40 break-words">
                      {p.failureMessage}
                    </p>
                  )}
                  <p className="text-[11px] text-white/30">
                    {dateLabel(p.createdAt)} · {p.transferAttempts}{" "}
                    {p.transferAttempts === 1 ? "attempt" : "attempts"}
                  </p>
                </div>
                {mayRetry && canRetryPayout(p) && (
                  <button
                    type="button"
                    disabled={retry.isPending}
                    onClick={() => retry.mutate(p.id)}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold hover:bg-accent/20 transition-all disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      replay
                    </span>
                    {retry.isPending && retry.variables === p.id
                      ? "Retrying..."
                      : "Retry"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {pagination && (
        <AdminListPager
          page={pagination.page}
          totalPages={pagination.totalPages}
          busy={isFetching}
          label="payouts"
          onPage={setPage}
        />
      )}
    </section>
  );
}
