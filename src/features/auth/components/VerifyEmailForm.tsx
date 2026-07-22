"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useVerifyEmail, useResendOtp } from "@/features/auth/hooks/useAuth";
import { verifyEmailSchema, VerifyEmailFormData } from "@/shared/lib/schema";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export default function VerifyEmailForm() {
  const verifyEmailMutation = useVerifyEmail();
  const resendMutation = useResendOtp();
  const setView = useAuthStore((s) => s.setView);
  const pendingEmail = useAuthStore((s) => s.pendingEmail);

  const { register, handleSubmit, formState: { errors } } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
  });

  const onSubmit: SubmitHandler<VerifyEmailFormData> = (data) => {
    if (!pendingEmail) {
      setView("login");
      return;
    }
    verifyEmailMutation.mutate(
      { email: pendingEmail, otpCode: data.otpCode },
      {
        onSuccess: () => {
          localStorage.setItem("fp_new_user", "1");
          setView("login");
        },
      }
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-5 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">Verify your email</h2>
        <p className="text-gray-400 text-sm">
          We sent a 6-digit code to <span className="text-white font-bold">{pendingEmail}</span>
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="group">
          <label className="block text-xs font-bold text-white/70 mb-1.5 ml-1">VERIFICATION CODE</label>
          <input
            {...register("otpCode")}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#ccff00] focus:border-[#ccff00]/50 focus:bg-white/10 transition-all font-medium text-center text-2xl tracking-widest"
            placeholder="------"
            maxLength={6}
            type="text"
          />
          {errors.otpCode && <span className="text-xs text-red-500 ml-1">{errors.otpCode.message}</span>}
        </div>

        <button
          type="submit"
          disabled={verifyEmailMutation.isPending}
          className="btn-neon w-full py-3 sm:py-4 mt-2 rounded-xl bg-[#ccff00] text-black font-bold text-sm sm:text-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {verifyEmailMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify Email"}
        </button>
      </form>

      <div className="text-center mt-6 space-y-2">
        <button
          onClick={() => pendingEmail && resendMutation.mutate(pendingEmail)}
          disabled={resendMutation.isPending}
          className="text-sm font-bold text-[#ccff00] hover:underline transition-colors block w-full"
        >
          {resendMutation.isPending ? "Sending..." : "Resend code"}
        </button>
        <button onClick={() => setView("login")} className="text-sm font-bold text-white/60 hover:text-white transition-colors">
          Back to Log in
        </button>
      </div>
    </div>
  );
}