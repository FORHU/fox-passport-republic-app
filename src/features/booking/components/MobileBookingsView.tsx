"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { fetchUserBookings } from "@/features/booking/api/bookings";

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "rgba(234,179,8,0.12)", color: "#facc15", label: "Pending" },
  confirmed: { bg: "rgba(204,255,0,0.12)", color: "#ccff00", label: "Confirmed" },
  active: { bg: "rgba(74,222,128,0.12)", color: "#4ade80", label: "Active" },
  completed: {
    bg: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.5)",
    label: "Completed",
  },
  cancelled: { bg: "rgba(239,68,68,0.12)", color: "#f87171", label: "Cancelled" },
  disputed: { bg: "rgba(249,115,22,0.12)", color: "#fb923c", label: "Disputed" },
  refunded: { bg: "rgba(168,85,247,0.12)", color: "#c084fc", label: "Refunded" },
  refund_failed: {
    bg: "rgba(249,115,22,0.12)",
    color: "#fb923c",
    label: "Refund Failed",
  },
};

export default function MobileBookingsView() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isInitial, setIsInitial] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const userId = user?.id || user?.userId;
    if (!userId) {
      router.replace("/");
      return;
    }

    fetchUserBookings(userId, 1, 20)
      .then((res) => setBookings(res.bookings))
      .finally(() => setIsInitial(false));
  }, [authLoading, user?.id, user?.userId, router]);

  return (
    <div
      style={{
        background: "#050608",
        minHeight: "100svh",
        position: "relative",
        color: "#fff",
      }}
    >
      {/* Nav bar */}
      <div
        style={{
          position: "fixed",
          top: 62,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 5,
          background: "rgba(5,6,8,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
        }}
      >
        <Image
          src="/foxonlylogo.png"
          alt="FoxPassport"
          width={22}
          height={22}
          style={{ objectFit: "contain" }}
        />
        <p
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
            margin: 0,
          }}
        >
          My Bookings
        </p>
      </div>

      {/* Booking list */}
      <div
        style={{
          padding: "142px 20px 112px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {isInitial || authLoading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.15)",
                borderTopColor: "#ccff00",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 48, color: "rgba(255,255,255,0.2)" }}
            >
              book_online
            </span>
            <p style={{ fontSize: 13, fontWeight: 700, margin: "12px 0 4px" }}>
              No bookings yet
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              Start by exploring venues and booking your next event.
            </p>
          </div>
        ) : (
          bookings.map((b) => {
            const s = STATUS_STYLE[b.status] ?? STATUS_STYLE.pending;
            const startDate = b.startAt
              ? new Date(b.startAt).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                })
              : "—";
            const eventName = b.event?.name || "Venue Booking";

            return (
              <button
                key={b.id}
                style={{
                  display: "flex",
                  gap: 12,
                  textAlign: "left",
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: 12,
                  cursor: "pointer",
                }}
                onClick={() => router.push(`/booking/${b.id}`)}
              >
                {/* Thumbnail */}
                <div
                  className="stripe"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    flexShrink: 0,
                  }}
                />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                      margin: 0,
                    }}
                  >
                    {eventName}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.4)",
                      margin: "3px 0 6px",
                    }}
                  >
                    {startDate} · ₱{b.totalAmount?.toLocaleString() ?? "0"}
                  </p>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      padding: "3px 9px",
                      borderRadius: 999,
                      background: s.bg,
                      color: s.color,
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
