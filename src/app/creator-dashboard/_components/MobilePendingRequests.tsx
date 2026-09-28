"use client";

import React from "react";
import Link from "next/link";
import { useRoleAccess } from "@/shared/auth/useRoleAccess";
import { useClientMatchRequests } from "@/features/gamification/hooks/usePassport";
import type { ClientMatchRequest } from "@/features/gamification/api/passport";

const STRIPE_BG = `repeating-linear-gradient(135deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 12px)`;

function subtitleOf(req: ClientMatchRequest) {
  const when = new Date(req.startAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${req.guestCount} guests · ${when}`;
}

/**
 * Mobile Creator Studio's read-only view of the real match-request inbox
 * (`useClientMatchRequests` — same source desktop's `PendingRequests` uses,
 * composed here rather than inside `MobileCreatorHome` because that lives in
 * the `dashboard` feature and cannot reach into `gamification` directly).
 *
 * Deliberately no Accept/Decline here (25 Sep) — this replaced a permanently
 * hardcoded "Skyline Loft"/"DJ Marco" demo list that showed the same two
 * fake requests to every phone visitor regardless of role or account.
 * Getting to real, honest data mattered more than getting to full parity
 * with desktop in one pass; acting on a request still means going to
 * /user/passport, same as desktop's own "View All" does.
 *
 * Self-gated on `hasListings`, the same as desktop's `PendingRequests`: an
 * Organizer or Investor owns no event template, so there is nothing here
 * that is theirs to answer.
 */
export function MobilePendingRequests() {
  const { hasListings } = useRoleAccess();
  const { data: page, isLoading } = useClientMatchRequests(0, hasListings);

  if (!hasListings) return null;

  const pending = (page?.data ?? []).filter(
    (r) => r.requestStatus === "pending",
  );
  const visible = pending.slice(0, 3);

  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            margin: 0,
          }}
        >
          Pending Requests
        </p>
        {pending.length > 0 && (
          <span style={{ fontSize: 11, color: "#ccff00", fontWeight: 600 }}>
            {pending.length} new
          </span>
        )}
      </div>

      {isLoading ? (
        <div
          style={{
            padding: "20px 0",
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          Loading…
        </div>
      ) : visible.length === 0 ? (
        <div
          style={{
            padding: "20px 0",
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          No pending requests
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.map((req) => (
            <div
              key={req.id}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  flexShrink: 0,
                  overflow: "hidden",
                  background: STRIPE_BG,
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              />
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
                  {req.client?.name ?? "A citizen"}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    margin: 0,
                  }}
                >
                  {subtitleOf(req)}
                  {req.template ? ` · ${req.template.name}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/user/passport"
        style={{
          display: "block",
          width: "100%",
          marginTop: 12,
          padding: "10px 0",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          textAlign: "center",
          color: "#fff",
        }}
      >
        View All
      </Link>
    </div>
  );
}
