"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { PROFILE_QUERY_KEY } from "@/shared/auth/profile";
import { ROLE_BADGE, type RoleType } from "@/shared/constants/roles";
import api from "@/shared/lib/axios";
import { useResendOtp, useVerifyEmail } from "@/features/auth/hooks/useAuth";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import { IdentitySection } from "./IdentitySection";

interface MyRoleRequest {
  id: string;
  roleType: RoleType;
  status: "pending" | "approved" | "rejected" | "revision_requested";
}

const REQUEST_STATUS: Record<
  MyRoleRequest["status"],
  { label: string; color: string }
> = {
  pending: { label: "Under review", color: "#f59e0b" },
  approved: { label: "Approved", color: "#22c55e" },
  rejected: { label: "Not approved", color: "#ef4444" },
  revision_requested: { label: "Needs a fix", color: "#f97316" },
};

/**
 * Where a citizen checks what's verified on their account and fixes what
 * isn't. Booking needs one thing — a verified email — so that comes first,
 * with the code flow right here. Documents only matter for someone applying
 * to offer something (a Foxer role), so they're shown as the status of those
 * applications, not as a requirement for everyone.
 */
export function VerificationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Where to send them once verified — e.g. the booking page that sent them.
  const next = searchParams.get("next");
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  // Logging in already requires a verified email, so anything but an
  // explicit `false` from the server means verified.
  const emailVerified = user?.isEmailVerified !== false;

  const resend = useResendOtp();
  const verify = useVerifyEmail();
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");

  const requests = useQuery({
    queryKey: ["role-requests", "mine"],
    queryFn: async (): Promise<MyRoleRequest[]> => {
      const res = await api.get("/role-requests/my");
      return res.data?.data ?? [];
    },
  });

  const sendCode = () => {
    if (!user?.email) return;
    resend.mutate(user.email, { onSuccess: () => setCodeSent(true) });
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || code.trim().length === 0) return;
    verify.mutate(
      { email: user.email, otpCode: code.trim() },
      {
        onSuccess: () => {
          setUser({ ...user, isEmailVerified: true });
          queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
          if (safeNext) router.push(safeNext);
        },
      },
    );
  };

  return (
    <>
      <LandingHeader />
      <main className="min-h-screen bg-[#050608] px-4 pt-28 pb-20">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Verification
            </h1>
            <p className="text-sm text-white/50 mt-2">
              What&apos;s verified on your account, and what each thing unlocks.
            </p>
          </div>

          {/* Email — the only thing booking requires */}
          <section className="rounded-[1.5rem] border border-white/10 bg-[#0f111a] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Email address</h2>
                <p className="text-sm text-white/50 mt-1">
                  Required to book venues, events, gear and services.
                </p>
                {user?.email && (
                  <p className="text-sm text-white/80 mt-3 font-mono break-all">
                    {user.email}
                  </p>
                )}
              </div>
              <span
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                style={
                  emailVerified
                    ? {
                        color: "#22c55e",
                        borderColor: "#22c55e55",
                        background: "#22c55e1a",
                      }
                    : {
                        color: "#f97316",
                        borderColor: "#f9731655",
                        background: "#f973161a",
                      }
                }
              >
                <span className="material-symbols-outlined text-[14px]">
                  {emailVerified ? "verified" : "error"}
                </span>
                {emailVerified ? "Verified" : "Not verified"}
              </span>
            </div>

            {emailVerified ? (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <p className="text-sm text-white/60">
                  You&apos;re all set to book.
                </p>
                {safeNext && (
                  <Link
                    href={safeNext}
                    className="px-4 py-2 rounded-full bg-accent text-black text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Back to your booking
                  </Link>
                )}
              </div>
            ) : !codeSent ? (
              <button
                type="button"
                onClick={sendCode}
                disabled={resend.isPending}
                className="mt-5 px-5 py-2.5 rounded-xl bg-accent text-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {resend.isPending ? "Sending…" : "Email me a verification code"}
              </button>
            ) : (
              <form onSubmit={submitCode} className="mt-5 space-y-3">
                <label
                  htmlFor="otp"
                  className="block text-xs font-bold text-white/70"
                >
                  Enter the 6-digit code we sent you
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    id="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="w-40 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white font-mono tracking-[0.3em] focus:outline-none focus:border-accent/60"
                  />
                  <button
                    type="submit"
                    disabled={verify.isPending || code.length < 6}
                    className="px-5 py-2.5 rounded-xl bg-accent text-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    {verify.isPending ? "Verifying…" : "Verify"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={resend.isPending}
                  className="text-xs text-white/50 hover:text-white underline cursor-pointer disabled:opacity-50"
                >
                  Send a new code
                </button>
              </form>
            )}
          </section>

          {/* Government ID — optional, earns the Verified badge */}
          <IdentitySection />

          {/* Documents — only for role applications */}
          <section className="rounded-[1.5rem] border border-white/10 bg-[#0f111a] p-6">
            <h2 className="text-lg font-bold text-white">Documents</h2>
            <p className="text-sm text-white/50 mt-1">
              Only needed to offer something on FoxPassport — listing a venue,
              gear or services, building events, organizing or investing. You
              upload them with that role&apos;s application, and we review them
              there. Booking never needs them.
            </p>

            {requests.isPending ? (
              <div className="mt-5 h-14 rounded-2xl bg-white/5 animate-pulse" />
            ) : (requests.data ?? []).length === 0 ? (
              <Link
                href="/onboarding"
                className="mt-5 inline-block px-4 py-2 rounded-full border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5 transition-colors"
              >
                Apply for a role
              </Link>
            ) : (
              <ul className="mt-5 divide-y divide-white/5">
                {(requests.data ?? []).map((r) => {
                  const badge = ROLE_BADGE[r.roleType];
                  const status = REQUEST_STATUS[r.status];
                  return (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <span
                        className="text-sm font-semibold"
                        style={{ color: badge?.color }}
                      >
                        {badge?.label ?? r.roleType}
                      </span>
                      <span className="flex items-center gap-3">
                        <span
                          className="text-[11px] font-bold"
                          style={{ color: status.color }}
                        >
                          {status.label}
                        </span>
                        {r.status === "revision_requested" && (
                          <Link
                            href={`/foxer/resubmit/${r.id}`}
                            className="text-xs font-bold text-white underline"
                          >
                            Fix documents
                          </Link>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
