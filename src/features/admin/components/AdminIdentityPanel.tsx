"use client";

import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  IDENTITY_QUERY_KEY,
  fetchIdentityQueue,
  idTypeLabel,
  reviewIdentity,
  type IdentityReviewItem,
  type IdentityStatus,
} from "@/shared/api/identity";
import { pollWhileVisible } from "@/shared/lib/realtime";

const STATUS_STYLE: Record<IdentityStatus, { label: string; color: string }> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  },
  approved: {
    label: "Approved",
    color: "bg-green-500/10 text-green-300 border-green-500/20",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-500/10 text-red-300 border-red-500/20",
  },
  revision_requested: {
    label: "Needs a fix",
    color: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  },
};

const FILTERS: { value: IdentityStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function dateLabel(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function DocumentPreview({
  label,
  file,
}: {
  label: string;
  file: IdentityReviewItem["idFile"];
}) {
  const isImage = file.type.startsWith("image/");
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full sm:w-56 rounded-xl border border-white/10 bg-black/30 overflow-hidden hover:border-accent/50 transition-colors"
    >
      {isImage ? (
        <img
          src={file.url}
          alt={label}
          className="h-36 w-full object-cover"
        />
      ) : (
        <div className="h-36 flex items-center justify-center text-white/40">
          <span className="material-symbols-outlined text-4xl">
            picture_as_pdf
          </span>
        </div>
      )}
      <div className="px-3 py-2 text-[11px] text-white/60 flex items-center justify-between gap-2">
        <span className="font-bold">{label}</span>
        <span className="material-symbols-outlined text-[14px]">
          open_in_new
        </span>
      </div>
    </a>
  );
}

/**
 * The queue of citizens' government IDs. Approving gives the person a
 * "Verified" badge; rejecting needs a reason, which they're shown so they can
 * send a better one. Nothing else hangs on the decision.
 */
export default function AdminIdentityPanel() {
  const [status, setStatus] = useState<IdentityStatus>("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const qc = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...IDENTITY_QUERY_KEY, "admin", status],
    queryFn: () => fetchIdentityQueue(status),
    refetchInterval: pollWhileVisible,
    placeholderData: keepPreviousData,
  });
  const items = data ?? [];

  const review = useMutation({
    mutationFn: (input: {
      id: string;
      decision: "approved" | "rejected";
      reason?: string;
    }) => reviewIdentity(input.id, input.decision, input.reason),
    onSuccess: (_, input) => {
      toast.success(
        input.decision === "approved" ? "ID approved" : "ID rejected",
      );
      setRejectingId(null);
      setReason("");
      qc.invalidateQueries({ queryKey: IDENTITY_QUERY_KEY });
    },
    onError: (err: unknown) => {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not save the decision.",
      );
    },
  });

  return (
    <section className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
      <div className="px-6 sm:px-8 py-6 border-b border-white/5">
        <div className="mb-5">
          <h1 className="text-2xl font-display font-bold text-white">
            Identity checks
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Government IDs citizens sent for a Verified badge. Check the name
            and photo match, and that the document is readable and current.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                status === f.value
                  ? "bg-accent text-black"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-white/30 text-sm">Loading...</div>
      ) : isError ? (
        <div className="py-16 px-6 text-center text-red-400 text-sm space-y-3">
          <p>
            {(error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Could not load identity checks."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/15"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-white/30 text-sm">
          {status === "pending"
            ? "No IDs waiting for review."
            : "Nothing here yet."}
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {items.map((item) => (
            <article
              key={item.id}
              className="px-6 sm:px-8 py-6 hover:bg-white/[0.02]"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLE[item.status].color}`}
                    >
                      {STATUS_STYLE[item.status].label}
                    </span>
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/60 border border-white/10">
                      {idTypeLabel(item.idType)}
                    </span>
                    <span className="text-xs text-white/30">
                      Sent {dateLabel(item.createdAt)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      {item.user.name}
                    </p>
                    <p className="text-xs text-white/40">
                      {item.user.email}
                      {item.user.username && ` · @${item.user.username}`}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <DocumentPreview label="ID" file={item.idFile} />
                    {item.selfieFile && (
                      <DocumentPreview
                        label="Selfie with ID"
                        file={item.selfieFile}
                      />
                    )}
                  </div>

                  {item.status === "pending" ? (
                    rejectingId === item.id ? (
                      <div className="space-y-2 max-w-md">
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Why it can't be accepted — they'll see this (e.g. blurry, expired, name doesn't match)"
                          rows={2}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={review.isPending || !reason.trim()}
                            onClick={() =>
                              review.mutate({
                                id: item.id,
                                decision: "rejected",
                                reason,
                              })
                            }
                            className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-bold hover:bg-red-500/20 transition-all disabled:opacity-40"
                          >
                            Confirm reject
                          </button>
                          <button
                            type="button"
                            disabled={review.isPending}
                            onClick={() => {
                              setRejectingId(null);
                              setReason("");
                            }}
                            className="px-3 py-1.5 rounded-full text-white/40 text-[11px] font-bold hover:text-white/70 transition-all disabled:opacity-40"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={review.isPending}
                          onClick={() =>
                            review.mutate({ id: item.id, decision: "approved" })
                          }
                          className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] font-bold hover:bg-green-500/20 transition-all disabled:opacity-40"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={review.isPending}
                          onClick={() => {
                            setRejectingId(item.id);
                            setReason("");
                          }}
                          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[11px] font-bold hover:bg-white/10 hover:text-white transition-all disabled:opacity-40"
                        >
                          Reject
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="text-xs text-white/40">
                      <span className="font-bold text-white/60">
                        {STATUS_STYLE[item.status].label}
                      </span>
                      {item.reviewer && ` by ${item.reviewer.name}`}
                      {item.reviewedAt && ` · ${dateLabel(item.reviewedAt)}`}
                      {item.rejectionReason && (
                        <p className="mt-1 text-white/30 break-words">
                          &ldquo;{item.rejectionReason}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
