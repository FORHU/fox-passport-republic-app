/* eslint-disable @typescript-eslint/no-unused-vars, @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useAdminCitizens } from "@/features/admin/hooks/useAdminCitizens";

interface CitizenTableProps {
  initialCitizens?: any[];
}

// systemRole: 'user' | 'admin'
const SYSTEM_ROLE_STYLE: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  admin: {
    label: "Admin",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: "shield",
  },
  super_admin: {
    label: "S.Admin",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: "shield",
  },
  user: {
    label: "Citizen",
    color: "bg-white/5 text-white/40 border-white/10",
    icon: "person",
  },
};

// roleType[] values
const ROLE_TYPE_STYLE: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  eventFoxer: {
    label: "Event Foxer",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: "storefront",
  },
  gearFoxer: {
    label: "Gear Foxer",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: "inventory_2",
  },
  serviceFoxer: {
    label: "Service Foxer",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    icon: "build",
  },
  venueFoxer: {
    label: "Venue Foxer",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    icon: "star",
  },
  investor: {
    label: "Investor",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: "payments",
  },
};

function RoleBadge({
  role,
  style,
}: {
  role: string;
  style: { label: string; color: string; icon: string };
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.color}`}
    >
      <span className="material-symbols-outlined text-[11px]">
        {style.icon}
      </span>
      {style.label}
    </span>
  );
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const AdminCitizenTable: React.FC<CitizenTableProps> = ({
  initialCitizens,
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce so typing doesn't fire a request per keystroke; reset to page 1
  // whenever the effective search term changes.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const { citizens, pagination, isLoading, isFetching } = useAdminCitizens(
    page,
    search,
    initialCitizens,
  );

  if (isLoading) {
    return (
      <div className="glass-panel p-20 flex flex-col items-center justify-center rounded-[2rem] border border-white/5">
        <span className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin mb-4" />
        <p className="text-white/40 text-sm uppercase tracking-widest">
          Loading citizens…
        </p>
      </div>
    );
  }

  const filtered = citizens;

  return (
    <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-accent text-2xl">
            group
          </span>
          <div>
            <h2 className="text-xl font-display font-bold text-white">
              Citizen Directory
            </h2>
            <p className="text-xs text-white/30 mt-0.5">
              {pagination?.total ?? citizens.length} registered users
            </p>
          </div>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[16px]">
            search
          </span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email…"
            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent/50 w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-black/20">
              {[
                "Citizen",
                "Account",
                "System Role",
                "Platform Roles",
                "Joined",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="py-3 px-5 text-[10px] uppercase tracking-widest text-white/30 font-bold text-left whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-16 text-center text-white/20 text-sm"
                >
                  No citizens found.
                </td>
              </tr>
            ) : (
              filtered.map((citizen) => {
                const sysStyle =
                  SYSTEM_ROLE_STYLE[citizen.systemRole] ??
                  SYSTEM_ROLE_STYLE.user;
                const roleTypes: string[] = citizen.roleType ?? [];
                const isExpanded = expandedRow === citizen.id;

                return (
                  <React.Fragment key={citizen.id}>
                    <tr className="border-b border-white/5 hover:bg-white/2 transition-colors group">
                      {/* Citizen */}
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          {citizen.imgId ? (
                            <img
                              src={citizen.imgId}
                              alt={citizen.name}
                              className="h-9 w-9 rounded-full object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm shrink-0">
                              {citizen.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-xs">
                              {citizen.name ?? "Anonymous"}
                            </p>
                            <p className="text-[10px] text-white/25 font-mono truncate max-w-35">
                              {citizen.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Account */}
                      <td className="py-3 px-5">
                        <p className="text-xs font-bold text-white/80">
                          @{citizen.username ?? "—"}
                        </p>
                        <p className="text-[10px] text-white/30">
                          {citizen.email}
                        </p>
                      </td>

                      {/* System role */}
                      <td className="py-3 px-5">
                        <RoleBadge role={citizen.systemRole} style={sysStyle} />
                      </td>

                      {/* Platform roles (roleType[]) */}
                      <td className="py-3 px-5">
                        <div className="flex flex-wrap gap-1">
                          {roleTypes.length === 0 ? (
                            <span className="text-white/20 text-xs">—</span>
                          ) : (
                            roleTypes.map((rt) => {
                              const s = ROLE_TYPE_STYLE[rt];
                              return s ? (
                                <RoleBadge key={rt} role={rt} style={s} />
                              ) : (
                                <span
                                  key={rt}
                                  className="px-2 py-0.5 rounded-full text-[10px] border border-white/10 text-white/30"
                                >
                                  {rt}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="py-3 px-5 text-xs text-white/40 whitespace-nowrap">
                        {citizen.createdAt ? fmt(citizen.createdAt) : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-5">
                        <button
                          onClick={() =>
                            setExpandedRow(isExpanded ? null : citizen.id)
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                            isExpanded
                              ? "bg-accent text-black border-accent"
                              : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20"
                          }`}
                        >
                          {isExpanded ? "Close" : "Details"}
                          <span
                            className={`material-symbols-outlined text-[13px] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          >
                            expand_more
                          </span>
                        </button>
                      </td>
                    </tr>

                    {/* Expanded panel */}
                    {isExpanded && (
                      <tr className="bg-black/20">
                        <td
                          colSpan={6}
                          className="px-5 py-4 border-b border-white/5"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-black/30 rounded-2xl border border-white/5 p-6">
                            <div>
                              <p className="text-[9px] uppercase font-bold text-accent tracking-widest mb-3">
                                Identity
                              </p>
                              <div className="space-y-1.5">
                                <p className="text-[11px] text-white/50">
                                  Name:{" "}
                                  <span className="text-white font-bold">
                                    {citizen.name ?? "—"}
                                  </span>
                                </p>
                                <p className="text-[11px] text-white/50">
                                  Email:{" "}
                                  <span className="text-white font-bold">
                                    {citizen.email}
                                  </span>
                                </p>
                                <p className="text-[11px] text-white/50">
                                  Username:{" "}
                                  <span className="text-white font-bold">
                                    @{citizen.username ?? "—"}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-bold text-accent tracking-widest mb-3">
                                System Role
                              </p>
                              <RoleBadge
                                role={citizen.systemRole}
                                style={sysStyle}
                              />
                              <p className="text-[10px] text-white/25 mt-2">
                                {citizen.systemRole === "admin"
                                  ? "Full platform access"
                                  : "Standard access"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-bold text-accent tracking-widest mb-3">
                                Platform Roles
                              </p>
                              <div className="flex flex-col gap-1.5">
                                {roleTypes.length === 0 ? (
                                  <p className="text-[11px] text-white/30">
                                    No platform roles assigned
                                  </p>
                                ) : (
                                  roleTypes.map((rt) => {
                                    const s = ROLE_TYPE_STYLE[rt];
                                    return s ? (
                                      <RoleBadge key={rt} role={rt} style={s} />
                                    ) : null;
                                  })
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-bold text-accent tracking-widest mb-3">
                                Timestamps
                              </p>
                              <p className="text-[11px] text-white/50">
                                Joined:{" "}
                                <span className="text-white font-bold">
                                  {citizen.createdAt
                                    ? fmt(citizen.createdAt)
                                    : "—"}
                                </span>
                              </p>
                            </div>

                            {/* Renders nothing without `roles:assign`, which
                                only `admin` holds — a secretary sees the row
                                exactly as before. */}
                            <RoleAssignmentControls citizen={citizen} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
        <span className="text-[10px] text-white/20 uppercase tracking-widest">
          FoxPassport Administration
        </span>
        {pagination && pagination.totalPages > 1 ? (
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/40">
              {isFetching
                ? "Loading…"
                : `Page ${pagination.page} of ${pagination.totalPages} · ${pagination.total} users`}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-[16px]">
                  chevron_left
                </span>
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page >= pagination.totalPages}
                className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        ) : (
          <span className="text-[10px] text-white/40">
            Showing {filtered.length} users
          </span>
        )}
      </div>
    </div>
  );
};
