"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { pollWhileVisible } from "@/shared/lib/realtime";
import { useUIStore } from "@/shared/store/useUIStore";

// Taking real action on a report's target (unpublishing a venue, suspending
// an account) still only happens through that target's own existing
// endpoint — resolving a report here only records the decision (dismissed /
// actioned) and an optional note, it never touches the target itself.
const TARGET_ADMIN_TAB: Record<Report["targetType"], string | null> = {
  venue: "venues",
  user: "citizens",
  post: null, // no moderation surface exists for feed posts yet
};

type ReportStatus = "open" | "dismissed" | "actioned";

const STATUS_STYLE: Record<ReportStatus, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20" },
  dismissed: { label: "Dismissed", color: "bg-white/5 text-white/40 border-white/10" },
  actioned: { label: "Actioned", color: "bg-green-500/10 text-green-300 border-green-500/20" },
};

type Report = {
  id: string;
  targetType: "post" | "user" | "venue";
  targetId: string;
  reason: string;
  details?: string | null;
  createdAt: string;
  reporter: { name: string; email: string };
  target: {
    name?: string;
    email?: string;
    content?: string;
    status?: string;
    author?: { name: string };
  } | null;
  status: ReportStatus;
  resolvedBy: { id: string; name: string } | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
};

type ReportResponse = {
  data: Report[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
  counts: { post: number; user: number; venue: number };
};

type CategoryFilter = "all" | Report["targetType"];

const targetLabels = {
  post: "Post",
  user: "Account",
  venue: "Venue listing",
};

function dateLabel(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function targetSummary(report: Report) {
  if (!report.target) return "Target no longer exists";
  if (report.targetType === "post") {
    return report.target.content || "Post with no text";
  }
  return report.target.name || report.target.email || "Unnamed target";
}

export default function AdminReportsPanel() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [page, setPage] = useState(1);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const setActiveAdminTab = useUIStore((s) => s.setActiveAdminTab);
  const qc = useQueryClient();

  const copyTargetId = async (targetId: string) => {
    try {
      await navigator.clipboard.writeText(targetId);
      toast.success("Target ID copied");
    } catch {
      toast.error("Could not copy — copy it manually instead");
    }
  };
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<ReportResponse>({
    queryKey: ["admin", "reports", category, page],
    queryFn: () =>
      api
        .get("/admin/reports", {
          params: {
            page,
            limit: 50,
            ...(category === "all" ? {} : { targetType: category }),
          },
        })
        .then((response) => ({
          data: response.data.data ?? [],
          pagination: response.data.pagination,
          counts: response.data.counts ?? { post: 0, user: 0, venue: 0 },
        })),
    refetchInterval: pollWhileVisible,
    placeholderData: keepPreviousData,
  });

  const resolve = useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string;
      status: "dismissed" | "actioned";
      note?: string;
    }) =>
      api.patch(`/admin/reports/${id}/resolve`, {
        status,
        resolutionNote: note?.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Report resolved");
      setResolvingId(null);
      setResolutionNote("");
      qc.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message ?? "Could not resolve this report",
      ),
  });

  const reports = data?.data ?? [];
  const pagination = data?.pagination;
  const counts = data?.counts ?? { post: 0, user: 0, venue: 0 };
  const allCount = counts.post + counts.user + counts.venue;

  const changeCategory = (next: CategoryFilter) => {
    setCategory(next);
    setPage(1);
  };

  const CATEGORY_TABS: { value: CategoryFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: allCount },
    { value: "venue", label: "Venue listings", count: counts.venue },
    { value: "user", label: "Accounts", count: counts.user },
    { value: "post", label: "Posts", count: counts.post },
  ];

  return (
    <section className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
      <div className="px-6 sm:px-8 py-6 border-b border-white/5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Reports</h1>
            <p className="text-sm text-white/40 mt-1">
              Listing, account, and community reports submitted by citizens.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => changeCategory(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                category === tab.value
                  ? "bg-accent text-black"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  category === tab.value ? "bg-black/15" : "bg-white/10"
                }`}
              >
                {tab.count}
              </span>
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
              ?.data?.message ?? "Could not load reports."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/15"
          >
            Retry
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="py-16 text-center text-white/30 text-sm">
          No reports have been submitted.
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {reports.map((report) => (
            <article key={report.id} className="px-6 sm:px-8 py-6 hover:bg-white/[0.02]">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-300 border border-red-500/20">
                      {targetLabels[report.targetType]}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLE[report.status].color}`}
                    >
                      {STATUS_STYLE[report.status].label}
                    </span>
                    <span className="text-xs text-white/30">{dateLabel(report.createdAt)}</span>
                  </div>
                  <h2 className="text-sm font-bold text-white">{report.reason}</h2>
                  <p className="text-sm text-white/60 break-words line-clamp-3">
                    {targetSummary(report)}
                  </p>
                  {report.details && (
                    <p className="text-xs text-white/40 break-words">
                      Details: {report.details}
                    </p>
                  )}

                  {report.status === "open" ? (
                    resolvingId === report.id ? (
                      <div className="mt-3 space-y-2 max-w-md">
                        <textarea
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          placeholder="Optional note — why dismissed, or what action was taken"
                          rows={2}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={resolve.isPending}
                            onClick={() =>
                              resolve.mutate({
                                id: report.id,
                                status: "dismissed",
                                note: resolutionNote,
                              })
                            }
                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] font-bold hover:bg-white/10 hover:text-white transition-all disabled:opacity-40"
                          >
                            Confirm dismiss
                          </button>
                          <button
                            type="button"
                            disabled={resolve.isPending}
                            onClick={() =>
                              resolve.mutate({
                                id: report.id,
                                status: "actioned",
                                note: resolutionNote,
                              })
                            }
                            className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] font-bold hover:bg-green-500/20 transition-all disabled:opacity-40"
                          >
                            Confirm actioned
                          </button>
                          <button
                            type="button"
                            disabled={resolve.isPending}
                            onClick={() => {
                              setResolvingId(null);
                              setResolutionNote("");
                            }}
                            className="px-3 py-1.5 rounded-full text-white/40 text-[11px] font-bold hover:text-white/70 transition-all disabled:opacity-40"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setResolvingId(report.id);
                          setResolutionNote("");
                        }}
                        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[11px] font-bold hover:bg-white/10 hover:text-white transition-all"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          task_alt
                        </span>
                        Resolve
                      </button>
                    )
                  ) : (
                    <div className="mt-2 text-xs text-white/40">
                      <span className="font-bold text-white/60">
                        {STATUS_STYLE[report.status].label}
                      </span>
                      {report.resolvedBy && ` by ${report.resolvedBy.name}`}
                      {report.resolvedAt && ` · ${dateLabel(report.resolvedAt)}`}
                      {report.resolutionNote && (
                        <p className="mt-1 text-white/30 break-words">
                          &ldquo;{report.resolutionNote}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="shrink-0 lg:text-right">
                  <p className="text-xs text-white/40">Reported by</p>
                  <p className="text-sm font-bold text-white">{report.reporter.name}</p>
                  <p className="text-xs text-white/40">{report.reporter.email}</p>
                  <button
                    type="button"
                    onClick={() => copyTargetId(report.targetId)}
                    className="mt-2 flex items-center gap-1 text-[10px] text-white/20 hover:text-white/50 transition-colors lg:ml-auto"
                    title="Copy target ID"
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      content_copy
                    </span>
                    Target ID: {report.targetId}
                  </button>
                  {TARGET_ADMIN_TAB[report.targetType] ? (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveAdminTab(TARGET_ADMIN_TAB[report.targetType]!)
                      }
                      className="mt-3 flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-[11px] font-bold hover:bg-accent/20 transition-all"
                    >
                      Moderate {targetLabels[report.targetType].toLowerCase()}
                      <span className="material-symbols-outlined text-[14px]">
                        arrow_forward
                      </span>
                    </button>
                  ) : (
                    <p className="mt-3 text-[10px] text-white/25 italic">
                      No moderation tools for posts yet
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 sm:px-8 py-4 border-t border-white/5 flex items-center justify-end gap-3">
          <span className="text-xs text-white/40">
            {isFetching ? "Loading..." : `Page ${pagination.page} of ${pagination.totalPages}`}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || isFetching}
            className="h-8 w-8 rounded-lg bg-white/5 text-white/60 disabled:opacity-30"
            aria-label="Previous reports page"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
            disabled={page >= pagination.totalPages || isFetching}
            className="h-8 w-8 rounded-lg bg-white/5 text-white/60 disabled:opacity-30"
            aria-label="Next reports page"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      )}
    </section>
  );
}
