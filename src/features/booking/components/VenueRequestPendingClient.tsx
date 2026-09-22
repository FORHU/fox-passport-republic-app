"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { getDashboardPath } from "@/shared/lib/dashboard-path";

export default function VenueRequestPendingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const bookingId = searchParams.get("bookingId");
  const extraGuests = Number(searchParams.get("extraGuests") ?? 0);
  const total = Number(searchParams.get("total") ?? 0);

  const dashboardPath = getDashboardPath(user);

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body relative overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-6 left-0 right-0 z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            <Link
              href="/"
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/foxonlylogo.png"
                  alt="FoxPassport Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">
                FoxPassport
              </h2>
            </Link>
            <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
              >
                Explore
              </Link>
              <Link
                href="/booking"
                className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-accent hover:bg-accent/90 hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all transform hover:-translate-y-0.5"
              >
                Bookings
              </Link>
            </nav>
            <div
              className="h-10 w-10 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:border-accent transition-colors"
              onClick={() => router.push(dashboardPath)}
            >
              {user?.imgId ? (
                <img
                  alt="User"
                  className="h-full w-full object-cover"
                  src={user.imgId}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-[#ccff00] text-black font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="grow pt-32 pb-28 sm:pb-20 relative flex items-center justify-center">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse-slow mix-blend-screen" />

        <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-amber-500/20 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.3)] mb-6">
              <span className="material-symbols-outlined text-5xl text-amber-400">
                hourglass_top
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
              Request Sent
            </h1>
            <p className="text-lg text-text-muted max-w-lg mx-auto">
              Your request is with the Venue Foxer. No payment is collected
              until they confirm your group fits — we&apos;ll notify you the
              moment they respond.
            </p>
          </div>

          {/* Detail card */}
          <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none" />

            {/* What happens next */}
            <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">
                info
              </span>
              What happens next
            </h2>

            <ol className="space-y-5 mb-8">
              {[
                {
                  icon: "mark_email_unread",
                  color: "text-accent",
                  title: "Request delivered",
                  body: "The Venue Foxer has been notified and can confirm or decline your over-capacity request.",
                },
                {
                  icon: "notifications_active",
                  color: "text-amber-400",
                  title: "You'll be notified",
                  body: "Once they respond you'll get an in-app notification and email with the result.",
                },
                {
                  icon: "payments",
                  color: "text-green-400",
                  title: "Pay only after approval",
                  body: "If they confirm, you'll be taken straight to checkout. If they decline, nothing is charged.",
                },
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
                    <span
                      className={`material-symbols-outlined text-[20px] ${step.color}`}
                    >
                      {step.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {step.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Summary row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-2xl bg-white/5 border border-white/10 p-5 mb-8 text-sm">
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                  Reference
                </p>
                <p className="text-white font-bold">
                  {bookingId ? `#${bookingId.slice(0, 12)}` : "—"}
                </p>
              </div>
              {extraGuests > 0 && (
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                    Extra guests
                  </p>
                  <p className="text-amber-300 font-bold">{extraGuests}</p>
                </div>
              )}
              {total > 0 && (
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
                    Amount (if approved)
                  </p>
                  <p className="text-white font-bold">
                    ₱{total.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 mb-8">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <p className="text-xs text-amber-300 font-medium">
                Status: Awaiting Venue Foxer confirmation
              </p>
            </div>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/booking"
                className="flex-1 px-6 py-3.5 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all text-center"
              >
                View My Bookings
              </Link>
              <Link
                href="/"
                className="flex-1 px-6 py-3.5 rounded-xl bg-accent text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-95 text-center flex items-center justify-center gap-2"
              >
                Explore More Venues
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black pt-10 pb-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white">
                explore
              </span>
              <span className="text-xl font-display font-bold text-white">
                FoxPassport
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              &copy; 2024 FoxPassport Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                className="text-xs text-gray-500 hover:text-white font-medium transition-colors"
                href="#"
              >
                Privacy
              </a>
              <a
                className="text-xs text-gray-500 hover:text-white font-medium transition-colors"
                href="#"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
