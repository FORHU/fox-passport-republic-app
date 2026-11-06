"use client";

import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check } from "lucide-react";

import { useSignup } from "@/features/auth/hooks/useAuth";
import {
  signupSchema,
  SignupFormData,
  FIX_HIGHLIGHTED_FIELDS,
} from "@/shared/lib/schema";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { TermsPrivacyModal } from "@/features/auth/components/TermsPrivacyModal";
import { AuthDialogTitle } from "@/features/auth/components/AuthDialogTitle";
import { PasswordVisibilityToggle } from "@/features/auth/components/PasswordVisibilityToggle";
import { TextField } from "@/shared/components/ui/TextField";
import { FieldError } from "@/shared/components/ui/FieldError";

import { toast } from "sonner";
import { startSocialSignIn } from "@/shared/auth/session-api";
import { PASSWORD_HINT } from "@/shared/lib/passwordPolicy";

// Social buttons component
const SocialButtons = () => (
  <div className="grid grid-cols-2 gap-3 mb-4 sm:mb-6">
    <a
      // No-JS fallback: the sign-in page. The click starts Better Auth.
      href="/auth"
      onClick={(e) => {
        e.preventDefault();
        void startSocialSignIn("google");
      }}
      className="group flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 px-3 sm:px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
    >
      <svg
        aria-hidden="true"
        className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
          fill="#4285F4"
        ></path>
        <path
          d="M12.24 24.0008C15.4765 24.0008 18.2058 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z"
          fill="#34A853"
        ></path>
        <path
          d="M5.50255 14.3003C5.00236 12.8099 5.00236 11.1961 5.50255 9.70575V6.61481H1.5166C-0.18551 10.0056 -0.18551 14.0004 1.5166 17.3912L5.50255 14.3003Z"
          fill="#FBBC05"
        ></path>
        <path
          d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61049L5.50255 9.70143C6.45046 6.86181 9.10938 4.74966 12.24 4.74966Z"
          fill="#EA4335"
        ></path>
      </svg>
      <span className="font-bold text-sm">Google</span>
    </a>
    <a
      href="/auth"
      onClick={(e) => {
        e.preventDefault();
        void startSocialSignIn("facebook");
      }}
      className="group flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 px-3 sm:px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300"
    >
      <svg
        aria-hidden="true"
        className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.563H7.078V12.073H10.125V9.429C10.125 6.423 11.916 4.761 14.656 4.761C15.968 4.761 17.344 4.995 17.344 4.995V7.948H15.83C14.34 7.948 13.875 8.873 13.875 9.822V12.073H17.203L16.671 15.563H13.875V24C19.612 23.094 24 18.1 24 12.073Z"
          fill="#1877F2"
          className="group-hover:fill-white transition-colors"
        ></path>
      </svg>
      <span className="font-bold text-sm">Facebook</span>
    </a>
  </div>
);

export default function SignupForm() {
  const signupMutation = useSignup();
  const { toggleView } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [hasReadCharter, setHasReadCharter] = React.useState(false);
  const termsId = React.useId();
  const termsErrorId = `${termsId}-error`;
  const [charterTab, setCharterTab] = React.useState<
    "terms" | "privacy" | null
  >(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: { acceptedTerms: false },
  });

  React.useEffect(() => {
    reset();
  }, [reset]);

  const onSignup: SubmitHandler<SignupFormData> = (data) =>
    signupMutation.mutate(data);

  // The inline errors carry the detail; react-hook-form focuses the first
  // invalid field. One toast id, so repeated submits don't stack toasts.
  const onInvalid = () =>
    toast.error(FIX_HIGHLIGHTED_FIELDS, { id: "signup-invalid" });

  return (
    <div className="animate-in fade-in slide-in-from-left-8 duration-300">
      <div className="text-center mb-5 sm:mb-8">
        <AuthDialogTitle className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
          Join the <span className="text-gradient-lime">Hype</span>
        </AuthDialogTitle>
        <p className="text-gray-400 text-sm">
          Unlock exclusive events and meet your crew.
        </p>
      </div>

      <SocialButtons />

      <div className="relative flex py-2 items-center mb-4 sm:mb-6">
        <div className="grow border-t border-white/10"></div>
        <span className="shrink-0 mx-4 text-xs font-medium text-white/30 uppercase tracking-widest">
          Or sign up with email
        </span>
        <div className="grow border-t border-white/10"></div>
      </div>

      {/* noValidate: the browser's own checks (the required checkbox, the
          email format) would cancel the submit before zod shows any error. */}
      <form
        className="space-y-4"
        noValidate
        onSubmit={handleSubmit(onSignup, onInvalid)}
      >
        <TextField
          {...register("name")}
          label="FULL NAME"
          placeholder="e.g. Fox Mulder"
          type="text"
          autoComplete="name"
          required
          error={errors.name?.message}
        />

        <TextField
          {...register("email")}
          label="EMAIL ADDRESS"
          placeholder="name@example.com"
          type="email"
          autoComplete="email"
          required
          error={errors.email?.message}
        />

        <TextField
          {...register("username")}
          label="USERNAME"
          placeholder="fox_mulder"
          type="text"
          autoComplete="username"
          required
          error={errors.username?.message}
        />

        <TextField
          {...register("password")}
          label="PASSWORD"
          placeholder="••••••••"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          hint={PASSWORD_HINT}
          error={errors.password?.message}
          trailing={
            <PasswordVisibilityToggle
              visible={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
            />
          }
        />

        <TextField
          {...register("confirmPassword")}
          label="CONFIRM PASSWORD"
          placeholder="••••••••"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          trailing={
            <PasswordVisibilityToggle
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((prev) => !prev)}
            />
          }
        />

        {/* Terms: part of the schema, so its error shows with the others */}
        <Controller
          control={control}
          name="acceptedTerms"
          render={({ field, fieldState }) => (
            <div className="pt-2">
              <div className="flex items-center gap-3">
                <div className="relative flex h-5 w-5 shrink-0 items-center">
                  <input
                    ref={field.ref}
                    name={field.name}
                    onBlur={field.onBlur}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 checked:border-accent checked:bg-accent transition-all hover:border-accent/50 aria-[invalid=true]:border-red-400"
                    id={termsId}
                    type="checkbox"
                    checked={field.value === true}
                    aria-required="true"
                    aria-invalid={fieldState.error ? true : undefined}
                    aria-describedby={
                      fieldState.error ? termsErrorId : undefined
                    }
                    onChange={(e) => {
                      // Reading the charter is mandatory before it can be
                      // checked; unchecking never needs that gate.
                      if (e.target.checked && !hasReadCharter) {
                        setCharterTab("terms");
                        return;
                      }
                      field.onChange(e.target.checked);
                    }}
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-black opacity-0 transition-opacity peer-checked:opacity-100">
                    <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                  </span>
                </div>
                <label
                  className="text-xs text-gray-400 cursor-pointer select-none"
                  htmlFor={termsId}
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setCharterTab("terms")}
                    className="text-white hover:text-accent underline decoration-accent/30 underline-offset-2 transition-colors"
                  >
                    Terms of Service
                  </button>{" "}
                  &{" "}
                  <button
                    type="button"
                    onClick={() => setCharterTab("privacy")}
                    className="text-white hover:text-accent underline decoration-accent/30 underline-offset-2 transition-colors"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              <FieldError
                id={termsErrorId}
                message={fieldState.error?.message}
                className="mt-1.5 ml-1"
              />
            </div>
          )}
        />

        {charterTab && (
          <TermsPrivacyModal
            initialTab={charterTab}
            onClose={() => setCharterTab(null)}
            onAccept={() =>
              setValue("acceptedTerms", true, { shouldValidate: true })
            }
            onBothRead={() => setHasReadCharter(true)}
          />
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={signupMutation.isPending}
          className="btn-neon w-full py-3 sm:py-4 mt-2 rounded-xl bg-accent text-black font-bold text-sm sm:text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed text-center relative overflow-hidden"
        >
          {signupMutation.isPending ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin w-5 h-5" />
              <span className="sr-only">Signing up…</span>
            </>
          ) : (
            <>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Sign Up
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform"
                >
                  arrow_forward
                </span>
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-white/30 transition-transform duration-300 ease-out skew-x-12"></div>
            </>
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={toggleView}
            className="font-bold text-white hover:text-accent transition-colors relative inline-block group"
          >
            Log in
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
          </button>
        </p>
      </div>
    </div>
  );
}
