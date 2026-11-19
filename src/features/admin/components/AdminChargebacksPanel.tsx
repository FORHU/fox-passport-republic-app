"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { pollWhileVisible } from "@/shared/lib/realtime";
import { formatCurrency } from "@/shared/lib/currency";
import { AdminListPager } from "./AdminListPager";

/**
 * Stripe chargebacks (`charge.dispute.*`), recorded by the API's webhook
 * (api#363, app#346): `GET /admin/payment-disputes`. Answering one happens in
 * the Stripe dashboard; this list exists so nobody misses the evidence
 * deadline, after which Stripe decides the dispute against FoxPassport.
 */

export type AdminChargeback = {
  id: string;
  stripeDisputeId: string;
  stripeChargeId: string;
  amount: string | number;
  currency: string;
  reason: string;
  status: string;
  evidenceDueBy: string | null;
  createdAt: string;
  payment: {
    id: string;
    invoiceId: string | null;
    assetBookingId: string | null;
    serviceBookingId: string | null;
  } | null;
};

type ChargebacksResponse = {
  data: AdminChargeback[];
  pagination?: { page: number; total: number; totalPages: number };
};

const STATUSES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "needs_response", label: "Needs response" },
  { value: "under_review", label: "Under review" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  needs_response: {
    label: "Needs response",
    color: "bg-red-500/10 text-red-300 border-red-500/20",
  },
  warning_needs_response: {
    label: "Inquiry: needs response",
    color: "bg-red-500/10 text-red-300 border-red-500/20",
  },
  under_review: {
    label: "Under review",
    color: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  },
  warning_under_review: {
    label: "Inquiry: under review",
    color: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  },
  won: {
    label: "Won",
    color: "bg-green-500/10 text-green-300 border-green-500/20",
  },
  lost: { label: "Lost", color: "bg-white/5 text-white/40 border-white/10" },
  warning_closed: {
    label: "Inquiry closed",
    color: "bg-white/5 text-white/40 border-white/10",
  },
  prevented: {
    label: "Prevented",
    color: "bg-green-500/10 text-green-300 border-green-500/20",
  },
};

const DAY = 86_400_000;
/** Within this long of the deadline, an unanswered chargeback is urgent. */
const URGENT_WITHIN = 3 * DAY;

/** Whether the chargeback still waits for FoxPassport's answer. */
export function needsResponse(status: string): boolean {
  return status === "needs_response" || status === "warning_needs_response";
}

/** Unanswered with the evidence deadline close or already passed. */
export function isUrgent(c: AdminChargeback, now = Date.now()): boolean {
  if (!needsResponse(c.status) || !c.evidenceDueBy) return false;
  return new Date(c.evidenceDueBy).getTime() - now <= URGENT_WITHIN;
}

/** The dispute in the Stripe dashboard, in test mode when the key is a test key. */
export function stripeDisputeUrl(
  disputeId: string,
  publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
): string {
  const mode = publishableKey.startsWith("pk_test_") ? "test/" : "";
  return `https://dashboard.stripe.com/${mode}disputes/${encodeURIComponent(disputeId)}`;
}

function humanize(value: string) {
  const text = value.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function dateLabel(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function paymentLabel(payment: AdminChargeback["payment"]) {
  if (!payment) return "Payment not matched";
  if (payment.invoiceId) return "Event or sponsorship payment";
  if (payment.assetBookingId) return "Gear booking payment";
  if (payment.serviceBookingId) return "Service booking payment";
  return "Payment";
}

export default function AdminChargebacksPanel() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useQuery<ChargebacksResponse>({
      queryKey: ["admin", "chargebacks", status, page],
      queryFn: () =>
        api
          .get("/admin/payment-disputes", {
            params: {
              page,
              limit: 20,
              ...(status === "all" ? {} : { status }),
            },
          })
          .then((res) => ({
            data: res.data.data ?? [],
            pagination: res.data.pagination,
          })),
      refetchInterval: pollWhileVisible,
      placeholderData: keepPreviousData,
    });

  const chargebacks = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <section className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
      <div className="px-6 sm:px-8 py-6 border-b border-white/5">
        <div className="mb-5">
          <h1 className="text-2xl font-display font-bold text-white">
            Chargebacks
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Card payments a client disputed with their bank. Answer each one in
            Stripe before its evidence deadline, or it is lost automatically.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={status === tab.value}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                status === tab.value
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
          <p>
            {(error as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? "Could not load chargebacks."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/15"
          >
            Try again
          </button>
        </div>
      ) : chargebacks.length === 0 ? (
        <div className="py-16 text-center text-white/30 text-sm">
          No chargebacks.
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {chargebacks.map((c) => {
            const style = STATUS_STYLE[c.status] ?? {
              label: humanize(c.status),
              color: "bg-white/5 text-white/50 border-white/10",
            };
            const urgent = isUrgent(c);
            return (
              <li
                key={c.id}
                className="px-6 sm:px-8 py-5 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-white/[0.02]"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-white">
                      {formatCurrency(
                        Number(c.amount) || 0,
                        c.currency.toUpperCase(),
                      )}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style.color}`}
                    >
                      {style.label}
                    </span>
                    <span className="text-xs text-white/40">
                      {humanize(c.reason)}
                    </span>
                  </div>
                  <p className="text-sm text-white/60">
                    {paymentLabel(c.payment)}
                  </p>
                  {c.evidenceDueBy && needsResponse(c.status) && (
                    <p
                      className={`text-xs font-bold ${urgent ? "text-red-400" : "text-white/50"}`}
                      data-urgent={urgent || undefined}
                    >
                      Evidence due {dateLabel(c.evidenceDueBy)}
                    </p>
                  )}
                  <p className="text-[11px] text-white/30">
                    Opened {dateLabel(c.createdAt)} · {c.stripeDisputeId}
                  </p>
                </div>
                <a
                  href={stripeDisputeUrl(c.stripeDisputeId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-bold hover:bg-white/10 hover:text-white transition-all"
                >
                  Open in Stripe
                  <span className="material-symbols-outlined text-[16px]">
                    open_in_new
                  </span>
                </a>
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
          label="chargebacks"
          onPage={setPage}
        />
      )}
    </section>
  );
}
