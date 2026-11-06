"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useVerifyEmail, useResendOtp } from "@/features/auth/hooks/useAuth";
import { verifyEmailSchema, VerifyEmailFormData } from "@/shared/lib/schema";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { AuthDialogTitle } from "@/features/auth/components/AuthDialogTitle";
import { TextField } from "@/shared/components/ui/TextField";

export default function VerifyEmailForm() {
  const verifyEmailMutation = useVerifyEmail();
  const resendMutation = useResendOtp();
  const setView = useAuthStore((s) => s.setView);
  const setPendingVerificationEmail = useAuthStore(
    (s) => s.setPendingVerificationEmail,
  );
  const pendingEmail = useAuthStore((s) => s.pendingEmail);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
  });

  const onSubmit: SubmitHandler<VerifyEmailFormData> = (data) => {
    if (!pendingEmail) {
      setView("login");
      return;
    }
    verifyEmailMutation.mutate(
      { email: pendingEmail, otpCode: data.otpCode.trim() },
      {
        onSuccess: () => {
          localStorage.setItem("fp_new_user", "1");
          setPendingVerificationEmail("");
          setView("login");
        },
      },
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-5 sm:mb-8">
        <AuthDialogTitle className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
          Verify your email
        </AuthDialogTitle>
        <p className="text-gray-400 text-sm">
          We sent a 6-digit code to{" "}
          <span className="text-white font-bold">{pendingEmail}</span>
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register("otpCode")}
          label="VERIFICATION CODE"
          labelClassName="block text-xs font-bold text-white/70 mb-1.5 ml-1"
          inputClassName="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent/50 focus:bg-white/10 transition-all font-medium text-center text-2xl tracking-widest"
          placeholder="------"
          maxLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          type="text"
          required
          error={errors.otpCode?.message}
        />

        <button
          type="submit"
          disabled={verifyEmailMutation.isPending}
          className="btn-neon w-full py-3 sm:py-4 mt-2 rounded-xl bg-accent text-black font-bold text-sm sm:text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {verifyEmailMutation.isPending ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin w-5 h-5" />
              <span className="sr-only">Verifying…</span>
            </>
          ) : (
            "Verify Email"
          )}
        </button>
      </form>

      <div className="text-center mt-6 space-y-2">
        <button
          type="button"
          onClick={() => pendingEmail && resendMutation.mutate(pendingEmail)}
          disabled={resendMutation.isPending}
          className="text-sm font-bold text-accent hover:underline transition-colors block w-full"
        >
          {resendMutation.isPending ? "Sending..." : "Resend code"}
        </button>
        <button
          type="button"
          onClick={() => setView("login")}
          className="text-sm font-bold text-white/60 hover:text-white transition-colors"
        >
          Back to Log in
        </button>
      </div>
    </div>
  );
}
