"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { pollWhileVisible } from "@/shared/lib/realtime";

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
};

type ReportResponse = {
  data: Report[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
};

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
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<ReportResponse>({
    queryKey: ["admin", "reports", page],
    queryFn: () =>
      api
        .get("/admin/reports", { params: { page, limit: 50 } })
        .then((response) => ({
          data: response.data.data ?? [],
          pagination: response.data.pagination,
        })),
    refetchInterval: pollWhileVisible,
    placeholderData: keepPreviousData,
  });

  const reports = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <section className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
      <div className="px-6 sm:px-8 py-6 border-b border-white/5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Reports</h1>
          <p className="text-sm text-white/40 mt-1">
            Listing, account, and community reports submitted by citizens.
          </p>
        </div>
        {pagination && (
          <span className="text-xs text-white/40">
            {pagination.total} total
          </span>
        )}
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
                </div>
                <div className="shrink-0 lg:text-right">
                  <p className="text-xs text-white/40">Reported by</p>
                  <p className="text-sm font-bold text-white">{report.reporter.name}</p>
                  <p className="text-xs text-white/40">{report.reporter.email}</p>
                  <p className="text-[10px] text-white/20 mt-2">Target ID: {report.targetId}</p>
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
