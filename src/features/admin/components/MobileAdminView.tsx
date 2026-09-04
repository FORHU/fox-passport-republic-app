"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { useUIStore } from "@/shared/store/useUIStore";
import { useAdminPendingVenues } from "@/features/admin/hooks/useAdminPendingVenues";
import { useAdminPendingAssets } from "@/features/admin/hooks/useAdminPendingAssets";
import { useAdminPendingServices } from "@/features/admin/hooks/useAdminPendingServices";

/**
 * The mobile admin overview.
 *
 * This was a static mockup: hardcoded KPI values, three invented approvals
 * ("Luna Events Space", "Rico Santos", "Gear Up PH"), a hamburger with no
 * onClick and approve/reject buttons that did nothing. It rendered below `lg`
 * while the real dashboard sat behind `hidden lg:flex`, so on a phone the whole
 * admin area was placeholder content.
 *
 * It now takes real stats, lists real pending items from the same hooks the
 * desktop tables use, and its buttons hit the same endpoints.
 */

export interface MobileAdminStats {
  totalUsers?: number;
  totalBookings?: number;
  totalRevenue?: number;
  pendingApprovals?: number;
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₱${(value / 1_000).toFixed(1)}K`;
  return `₱${value.toLocaleString()}`;
}

type PendingKind = "venue" | "asset" | "service";

interface PendingItem {
  id: string;
  name: string;
  type: string;
  kind: PendingKind;
}

// Each kind approves and rejects through its own endpoint - the same ones the
// desktop tables call.
const ENDPOINTS: Record<PendingKind, string> = {
  venue: "/admin/venues",
  asset: "/admin/assets",
  service: "/admin/services",
};

export default function MobileAdminView({
  stats,
}: {
  stats?: MobileAdminStats;
}) {
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Which row is currently asking for a rejection reason, and what has been
  // typed. Desktop opens a modal for this; a row on a phone has no room, so the
  // controls swap inline instead of sending a canned string.
  const [rejectingKey, setRejectingKey] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [handled, setHandled] = useState<Set<string>>(new Set());

  const { venues: pendingVenues, refetch: refetchVenues } =
    useAdminPendingVenues();
  const { assets: pendingAssets, refetch: refetchAssets } =
    useAdminPendingAssets();
  const { services: pendingServices, refetch: refetchServices } =
    useAdminPendingServices();

  const KPI_CARDS = [
    {
      label: "Revenue",
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: "payments",
      valueColor: "#ccff00",
      iconColor: "#ccff00",
      iconBg: "rgba(204,255,0,0.12)",
    },
    {
      label: "Bookings",
      value: (stats?.totalBookings ?? 0).toLocaleString(),
      icon: "event_available",
      valueColor: "#3b82f6",
      iconColor: "#3b82f6",
      iconBg: "rgba(59,130,246,0.15)",
    },
    {
      label: "Citizens",
      value: (stats?.totalUsers ?? 0).toLocaleString(),
      icon: "people",
      valueColor: "#22c55e",
      iconColor: "#22c55e",
      iconBg: "rgba(34,197,94,0.15)",
    },
  ];

  const APPROVALS = useMemo<PendingItem[]>(() => {
    const rows: PendingItem[] = [
      ...(pendingVenues ?? []).map((v: any) => ({
        id: String(v.id),
        name: v.title ?? v.name ?? "Untitled venue",
        type: "Venue application",
        kind: "venue" as const,
      })),
      ...(pendingAssets ?? []).map((a: any) => ({
        id: String(a.id),
        name: a.name ?? "Untitled asset",
        type: "Gear listing review",
        kind: "asset" as const,
      })),
      ...(pendingServices ?? []).map((sv: any) => ({
        id: String(sv.id),
        name: sv.name ?? "Untitled service",
        type: "Service listing review",
        kind: "service" as const,
      })),
    ];
    // Hide rows already actioned in this session so the list responds instantly
    // rather than waiting on a refetch.
    return rows.filter((r) => !handled.has(`${r.kind}:${r.id}`));
  }, [pendingVenues, pendingAssets, pendingServices, handled]);

  const refetchFor = (kind: PendingKind) => {
    if (kind === "venue") return refetchVenues();
    if (kind === "asset") return refetchAssets();
    return refetchServices();
  };

  const review = async (
    item: PendingItem,
    action: "approve" | "reject",
    reason?: string,
  ) => {
    const key = `${item.kind}:${item.id}`;
    setBusyId(key);
    try {
      if (action === "approve") {
        await api.patch(`${ENDPOINTS[item.kind]}/${item.id}/approve`);
      } else {
        await api.patch(`${ENDPOINTS[item.kind]}/${item.id}/reject`, {
          reason: reason?.trim() || "No reason given",
        });
      }
      setHandled((prev) => new Set(prev).add(key));
      setRejectingKey(null);
      setRejectReason("");
      toast.success(
        `${item.name} ${action === "approve" ? "approved" : "rejected"}`,
      );
      await refetchFor(item.kind);
    } catch {
      toast.error(`Could not ${action} ${item.name}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div
      className="lg:hidden"
      style={{
        background: "#050608",
        minHeight: "100svh",
        fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
        color: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px 20px 0",
        }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open admin navigation"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20, color: "rgba(255,255,255,0.7)" }}
          >
            menu
          </span>
        </button>

        <span
          style={{
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            fontSize: 16,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          Overview
        </span>

        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#7c3aed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          A
        </div>
      </div>

      {/* KPI scroll row */}
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          padding: "28px 20px 4px",
        }}
      >
        {KPI_CARDS.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              flexShrink: 0,
              width: 130,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 18,
              padding: "16px 14px",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: kpi.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: kpi.iconColor }}
              >
                {kpi.icon}
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                fontSize: 20,
                fontWeight: 700,
                color: kpi.valueColor,
                margin: "0 0 2px",
              }}
            >
              {kpi.value}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                margin: 0,
              }}
            >
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Pending Approvals */}
      <div style={{ padding: "28px 20px 112px" }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            margin: "0 0 14px",
          }}
        >
          Pending Approvals
        </p>

        {APPROVALS.length === 0 && (
          <p
            style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}
          >
            Nothing waiting for review.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {APPROVALS.map((item) => (
            <div
              key={item.id}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "rgba(124,58,237,0.2)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#c4b5fd",
                  flexShrink: 0,
                }}
              >
                {item.name.charAt(0)}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    margin: "0 0 2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    margin: 0,
                  }}
                >
                  {item.type}
                </p>
              </div>
              {/* Action buttons */}
              <div
                style={{
                  display:
                    rejectingKey === `${item.kind}:${item.id}`
                      ? "none"
                      : "flex",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => review(item, "approve")}
                  disabled={busyId === `${item.kind}:${item.id}`}
                  aria-label={`Approve ${item.name}`}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(34,197,94,0.15)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    opacity: busyId === `${item.kind}:${item.id}` ? 0.4 : 1,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 16, color: "#22c55e" }}
                  >
                    check
                  </span>
                </button>
                <button
                  onClick={() => {
                    setRejectingKey(`${item.kind}:${item.id}`);
                    setRejectReason("");
                  }}
                  disabled={busyId === `${item.kind}:${item.id}`}
                  aria-label={`Reject ${item.name}`}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    opacity: busyId === `${item.kind}:${item.id}` ? 0.4 : 1,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 16, color: "#ef4444" }}
                  >
                    close
                  </span>
                </button>
              </div>

              {/* Reason field — replaces the buttons for the row being
                  rejected, so the phone gets the same "why" the desktop modal
                  collects instead of a canned string. */}
              {rejectingKey === `${item.kind}:${item.id}` && (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexShrink: 0,
                    alignItems: "center",
                  }}
                >
                  <input
                    autoFocus
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        review(item, "reject", rejectReason);
                      if (e.key === "Escape") setRejectingKey(null);
                    }}
                    placeholder="Reason"
                    aria-label={`Reason for rejecting ${item.name}`}
                    style={{
                      width: 108,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 10,
                      padding: "7px 10px",
                      fontSize: 12,
                      color: "#fff",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={() => review(item, "reject", rejectReason)}
                    disabled={busyId === `${item.kind}:${item.id}`}
                    aria-label="Confirm rejection"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(239,68,68,0.2)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16, color: "#ef4444" }}
                    >
                      send
                    </span>
                  </button>
                  <button
                    onClick={() => setRejectingKey(null)}
                    aria-label="Cancel rejection"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}
                    >
                      close
                    </span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
