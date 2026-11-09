"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  useLogin,
  useSignup,
  useForgotPassword,
  useResetPassword,
  useVerifyEmail,
  useResendOtp,
  forgotPasswordErrorMessage,
} from "@/features/auth/hooks/useAuth";
import {
  loginSchema,
  LoginFormData,
  signupSchema,
  SignupFormData,
  resetPasswordSchema,
  ResetPasswordFormData,
  FIX_HIGHLIGHTED_FIELDS,
} from "@/shared/lib/schema";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { startSocialSignIn } from "@/shared/auth/session-api";
import { TermsPrivacyModal } from "@/features/auth/components/TermsPrivacyModal";
import { BackButton } from "@/shared/components/ui/BackButton";
import { PASSWORD_HINT } from "@/shared/lib/passwordPolicy";
import { IconButton } from "@/shared/components/ui/IconButton";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MobileAuthView = "login" | "signup" | "forgot" | "verify";
type View = MobileAuthView;

// ─── Shared atoms ─────────────────────────────────────────────────────────────

const FIELD: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "color-mix(in srgb, var(--color-white) 5%, transparent)",
  border: "1px solid color-mix(in srgb, var(--color-white) 10%, transparent)",
  borderRadius: 14,
  padding: "14px 16px",
  color: "var(--color-white)",
  fontSize: 14,
  outline: "none",
};

const FIELD_ERR: React.CSSProperties = {
  ...FIELD,
  border: "1px solid rgba(207,61,52,0.6)",
};

function FieldError({ id, msg }: { id?: string; msg?: string }) {
  if (!msg) return null;
  return (
    <span
      id={id}
      role="alert"
      style={{ fontSize: 10, color: "var(--error)", marginTop: 3, display: "block" }}
    >
      {msg}
    </span>
  );
}

const LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "color-mix(in srgb, var(--color-white) 40%, transparent)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: 6,
};

type MobileFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "required" | "style"
> & {
  label: string;
  /** Keeps the label for screen readers only (the placeholder-style fields). */
  labelHidden?: boolean;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  trailing?: React.ReactNode;
  inputStyle?: React.CSSProperties;
};

/**
 * A field whose label is linked by a generated id, with `aria-required`, and
 * with the hint or error announced alongside it. The error also announces
 * itself when it appears.
 */
const MobileField = React.forwardRef<HTMLInputElement, MobileFieldProps>(
  function MobileField(
    { label, labelHidden, error, hint, required, trailing, inputStyle, ...props },
    ref,
  ) {
    const id = React.useId();
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const input = (
      <input
        ref={ref}
        id={id}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        style={{
          ...(error ? FIELD_ERR : FIELD),
          ...(trailing ? { paddingRight: 48 } : null),
          ...inputStyle,
        }}
        {...props}
      />
    );
    return (
      <div>
        <label
          htmlFor={id}
          className={labelHidden ? "sr-only" : undefined}
          style={labelHidden ? undefined : LABEL}
        >
          {label}
        </label>
        {trailing ? (
          <div style={{ position: "relative" }}>
            {input}
            {trailing}
          </div>
        ) : (
          input
        )}
        {/* The hint stays put when an error appears; the error is red. */}
        {hint && (
          <span
            id={hintId}
            style={{
              fontSize: 10,
              color: "color-mix(in srgb, var(--color-white) 30%, transparent)",
              marginTop: 4,
              display: "block",
            }}
          >
            {hint}
          </span>
        )}
        <FieldError id={errorId} msg={error} />
      </div>
    );
  },
);

/** The show/hide toggle in a password field: one name, with aria-pressed for its state. */
function PwToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <IconButton
      label="Show password"
      pressed={shown}
      onClick={onToggle}
      style={{
        position: "absolute",
        right: 14,
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "color-mix(in srgb, var(--color-white) 40%, transparent)",
        lineHeight: 0,
      }}
      icon={
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {shown ? "visibility_off" : "visibility"}
        </span>
      }
    />
  );
}

function Divider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "14px 0",
      }}
    >
      <div
        style={{ flex: 1, height: 1, background: "color-mix(in srgb, var(--color-white) 10%, transparent)" }}
      />
      <span
        style={{
          fontSize: 10,
          color: "color-mix(in srgb, var(--color-white) 30%, transparent)",
          fontWeight: 600,
          letterSpacing: "0.08em",
        }}
      >
        OR
      </span>
      <div
        style={{ flex: 1, height: 1, background: "color-mix(in srgb, var(--color-white) 10%, transparent)" }}
      />
    </div>
  );
}

function GoogleButton({ disabled }: { disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        border: "1.5px solid color-mix(in srgb, var(--color-white) 15%, transparent)",
        background: "transparent",
        color: "var(--color-white)",
        fontSize: 14,
        fontWeight: 700,
        borderRadius: 14,
        padding: "12px 0",
        cursor: "pointer",
        boxSizing: "border-box",
      }}
      onClick={() => {
        void startSocialSignIn("google");
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          fill="#34A853"
        />
        <path
          d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.583c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.583 9 3.583z"
          fill="#EA4335"
        />
      </svg>
      Continue with Google
    </button>
  );
}

// ─── Login View ───────────────────────────────────────────────────────────────

function LoginView({
  onSignup,
  onForgot,
}: {
  onSignup: () => void;
  onForgot: () => void;
}) {
  const loginMutation = useLogin();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const onSubmit = (data: LoginFormData) => loginMutation.mutate(data);

  return (
    <div style={{ marginTop: "auto", padding: "0 24px 44px" }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--accent-text)",
          marginBottom: 8,
        }}
      >
        Welcome Back
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
          fontSize: 27,
          fontWeight: 700,
          color: "var(--color-white)",
          lineHeight: 1.2,
          marginBottom: 24,
        }}
      >
        Log in to
        <br />
        your account
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <MobileField
          {...register("email")}
          label="Email address"
          labelHidden
          type="email"
          placeholder="Email address"
          autoComplete="email"
          required
          error={errors.email?.message}
        />

        <MobileField
          {...register("password")}
          label="Password"
          labelHidden
          type={showPw ? "text" : "password"}
          placeholder="Password"
          autoComplete="current-password"
          required
          error={errors.password?.message}
          trailing={<PwToggle shown={showPw} onToggle={() => setShowPw((p) => !p)} />}
        />

        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: -4 }}
        >
          <button
            type="button"
            onClick={onForgot}
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--accent-text)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          style={{
            background: "#C4E85A",
            color: "#000",
            fontSize: 14,
            fontWeight: 800,
            borderRadius: 16,
            padding: "14px 0",
            border: "none",
            cursor: loginMutation.isPending ? "not-allowed" : "pointer",
            opacity: loginMutation.isPending ? 0.7 : 1,
            boxShadow: "0 4px 20px rgba(196,232,90,0.3)",
            marginTop: 4,
          }}
        >
          {loginMutation.isPending ? "Logging in…" : "Log In"}
        </button>
      </form>

      <Divider />
      <GoogleButton disabled={loginMutation.isPending} />

      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "color-mix(in srgb, var(--color-white) 40%, transparent)",
          marginTop: 20,
        }}
      >
        New here?{" "}
        <button
          onClick={onSignup}
          style={{
            color: "var(--accent-text)",
            fontWeight: 700,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            padding: 0,
          }}
        >
          Create an account
        </button>
      </p>
    </div>
  );
}

// ─── Signup View ──────────────────────────────────────────────────────────────

function SignupView({
  onLogin,
  onSignedUp,
}: {
  onLogin: () => void;
  onSignedUp: () => void;
}) {
  const signupMutation = useSignup();
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [hasReadCharter, setHasReadCharter] = useState(false);
  const [charterTab, setCharterTab] = useState<"terms" | "privacy" | null>(
    null,
  );
  const termsErrorId = `${React.useId()}-terms-error`;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit",
    defaultValues: { acceptedTerms: false },
  });

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data, { onSuccess: () => onSignedUp() });
  };

  // The inline errors carry the detail; react-hook-form focuses the first
  // invalid field. One toast id, so repeated submits don't stack toasts.
  const onInvalid = () =>
    toast.error(FIX_HIGHLIGHTED_FIELDS, { id: "signup-invalid" });

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 44px" }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--accent-text)",
          marginBottom: 8,
        }}
      >
        Join the Hype
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
          fontSize: 27,
          fontWeight: 700,
          color: "var(--color-white)",
          lineHeight: 1.2,
          marginBottom: 8,
        }}
      >
        Create your
        <br />
        account
      </h1>
      <p
        style={{
          fontSize: 12,
          color: "color-mix(in srgb, var(--color-white) 40%, transparent)",
          marginBottom: 24,
        }}
      >
        Unlock exclusive events and meet your crew.
      </p>

      {/* noValidate: the browser's own checks (the required checkbox, the
          email format) would cancel the submit before zod shows any error. */}
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <MobileField
          {...register("name")}
          label="Full Name"
          type="text"
          placeholder="e.g. Fox Mulder"
          autoComplete="name"
          required
          error={errors.name?.message}
        />

        <MobileField
          {...register("email")}
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          required
          error={errors.email?.message}
        />

        <MobileField
          {...register("username")}
          label="Username"
          type="text"
          placeholder="fox_mulder"
          autoComplete="username"
          required
          error={errors.username?.message}
        />

        <MobileField
          {...register("password")}
          label="Password"
          type={showPw ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="new-password"
          required
          error={errors.password?.message}
          hint={PASSWORD_HINT}
          trailing={<PwToggle shown={showPw} onToggle={() => setShowPw((p) => !p)} />}
        />

        <MobileField
          {...register("confirmPassword")}
          label="Confirm Password"
          type={showConfirmPw ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          trailing={
            <PwToggle
              shown={showConfirmPw}
              onToggle={() => setShowConfirmPw((p) => !p)}
            />
          }
        />

        {/* Terms: part of the schema, so its error shows with the others */}
        <Controller
          control={control}
          name="acceptedTerms"
          render={({ field, fieldState }) => (
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                <input
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  type="checkbox"
                  checked={field.value === true}
                  aria-required="true"
                  aria-invalid={fieldState.error ? true : undefined}
                  aria-describedby={fieldState.error ? termsErrorId : undefined}
                  onChange={(e) => {
                    // Reading the charter is mandatory before it can be checked;
                    // unchecking never needs that gate.
                    if (e.target.checked && !hasReadCharter) {
                      setCharterTab("terms");
                      return;
                    }
                    field.onChange(e.target.checked);
                  }}
                  style={{
                    accentColor: "#C4E85A",
                    width: 16,
                    height: 16,
                    flexShrink: 0,
                    outline: fieldState.error ? "1px solid var(--error)" : undefined,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: "color-mix(in srgb, var(--color-white) 45%, transparent)",
                    lineHeight: 1.5,
                  }}
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCharterTab("terms");
                    }}
                    style={{
                      color: "var(--accent-text)",
                      fontWeight: 700,
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    Terms of Service
                  </button>{" "}
                  &{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCharterTab("privacy");
                    }}
                    style={{
                      color: "var(--accent-text)",
                      fontWeight: 700,
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
              <FieldError id={termsErrorId} msg={fieldState.error?.message} />
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

        <button
          type="submit"
          disabled={signupMutation.isPending}
          style={{
            background: "#C4E85A",
            color: "#000",
            fontSize: 14,
            fontWeight: 800,
            borderRadius: 16,
            padding: "14px 0",
            border: "none",
            cursor: signupMutation.isPending ? "not-allowed" : "pointer",
            opacity: signupMutation.isPending ? 0.7 : 1,
            boxShadow: "0 4px 20px rgba(196,232,90,0.3)",
            marginTop: 4,
          }}
        >
          {signupMutation.isPending ? "Creating account…" : "Sign Up"}
        </button>
      </form>

      <Divider />
      <GoogleButton disabled={signupMutation.isPending} />

      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "color-mix(in srgb, var(--color-white) 40%, transparent)",
          marginTop: 20,
        }}
      >
        Already a member?{" "}
        <button
          onClick={onLogin}
          style={{
            color: "var(--accent-text)",
            fontWeight: 700,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            padding: 0,
          }}
        >
          Log in
        </button>
      </p>
    </div>
  );
}

// ─── Forgot Password View ─────────────────────────────────────────────────────

const EYEBROW: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--accent-text)",
  marginBottom: 8,
};

const HEADLINE: React.CSSProperties = {
  fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
  fontSize: 27,
  fontWeight: 700,
  color: "var(--color-white)",
  lineHeight: 1.2,
  marginBottom: 8,
};

const BODY: React.CSSProperties = {
  fontSize: 12,
  color: "color-mix(in srgb, var(--color-white) 40%, transparent)",
  marginBottom: 24,
};

const primaryButton = (disabled: boolean): React.CSSProperties => ({
  background: "#C4E85A",
  color: "#000",
  fontSize: 14,
  fontWeight: 800,
  borderRadius: 16,
  padding: "14px 0",
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.7 : 1,
  boxShadow: "0 4px 20px rgba(196,232,90,0.3)",
});

function ForgotView({
  onBack,
  onSent,
}: {
  onBack: () => void;
  onSent: () => void;
}) {
  const forgotMutation = useForgotPassword();
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!address) return;
    setError(undefined);
    forgotMutation.mutate(address, {
      onSuccess: () => {
        setPendingEmail(address);
        onSent();
      },
      // Same text as the toast; the form stays so the email can be fixed.
      onError: (err) => setError(forgotPasswordErrorMessage(err)),
    });
  };

  const disabled = forgotMutation.isPending || !email.trim();

  return (
    <div style={{ marginTop: "auto", padding: "0 24px 44px" }}>
      <BackButton
        variant="label"
        label="Back to login"
        onClick={onBack}
        className="mb-7 self-start"
      />

      <p style={EYEBROW}>Reset Password</p>
      <h1 style={HEADLINE}>
        Forgot your
        <br />
        password?
      </h1>
      <p style={BODY}>Enter your email and we&apos;ll send a reset code.</p>

      <form
        onSubmit={handleSend}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <MobileField
          label="Email address"
          labelHidden
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(undefined);
          }}
          placeholder="Email address"
          autoComplete="email"
          required
          error={error}
        />
        <button type="submit" disabled={disabled} style={primaryButton(disabled)}>
          {forgotMutation.isPending ? "Sending…" : "Send Reset Code"}
        </button>
      </form>
    </div>
  );
}

// ─── Reset Password View ──────────────────────────────────────────────────────

function ResetView({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const pendingEmail = useAuthStore((s) => s.pendingEmail);
  const resetMutation = useResetPassword();
  const resendMutation = useForgotPassword();
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otpCode: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!pendingEmail) {
      onBack();
      return;
    }
    resetMutation.mutate(
      {
        email: pendingEmail,
        otpCode: data.otpCode,
        newPassword: data.newPassword,
      },
      { onSuccess: () => onDone() },
    );
  };

  return (
    <div style={{ marginTop: "auto", padding: "0 24px 44px" }}>
      <BackButton
        variant="label"
        label="Back"
        onClick={onBack}
        className="mb-7 self-start"
      />

      <p style={EYEBROW}>Reset Password</p>
      <h1 style={HEADLINE}>
        Enter your
        <br />
        reset code
      </h1>
      <p style={BODY}>
        We sent a 6-digit code to{" "}
        <strong style={{ color: "color-mix(in srgb, var(--color-white) 70%, transparent)" }}>
          {pendingEmail}
        </strong>
        .
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <Controller
          control={control}
          name="otpCode"
          render={({ field }) => (
            <MobileField
              label="Reset code"
              labelHidden
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              name={field.name}
              ref={field.ref}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(e) =>
                field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              required
              error={errors.otpCode?.message}
              inputStyle={{
                fontSize: 24,
                fontWeight: 700,
                textAlign: "center",
                letterSpacing: "0.3em",
              }}
            />
          )}
        />

        <MobileField
          {...register("newPassword")}
          label="New password"
          type={showPw ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="new-password"
          required
          error={errors.newPassword?.message}
          hint={PASSWORD_HINT}
          trailing={<PwToggle shown={showPw} onToggle={() => setShowPw((p) => !p)} />}
        />

        <MobileField
          {...register("confirmPassword")}
          label="Confirm new password"
          type={showConfirmPw ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          trailing={
            <PwToggle
              shown={showConfirmPw}
              onToggle={() => setShowConfirmPw((p) => !p)}
            />
          }
        />

        <button
          type="submit"
          disabled={resetMutation.isPending}
          style={primaryButton(resetMutation.isPending)}
        >
          {resetMutation.isPending ? "Resetting…" : "Reset Password"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <p style={{ fontSize: 12, color: "color-mix(in srgb, var(--color-white) 35%, transparent)" }}>
          Didn&apos;t receive it?{" "}
          <button
            type="button"
            onClick={() => pendingEmail && resendMutation.mutate(pendingEmail)}
            disabled={resendMutation.isPending || !pendingEmail}
            style={{
              color: "var(--accent-text)",
              fontWeight: 700,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              padding: 0,
              opacity: resendMutation.isPending ? 0.5 : 1,
            }}
          >
            {resendMutation.isPending ? "Sending…" : "Resend code"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Verify Email View ────────────────────────────────────────────────────────

function VerifyView({ onVerified }: { onVerified: () => void }) {
  const { pendingEmail, setPendingVerificationEmail } = useAuthStore();
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendOtp();
  const [otp, setOtp] = useState("");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6 || !pendingEmail) return;
    verifyMutation.mutate(
      { email: pendingEmail, otpCode: otp },
      {
        onSuccess: () => {
          if (typeof window !== "undefined")
            localStorage.setItem("fp_new_user", "true");
          setPendingVerificationEmail("");
          toast.success("Email verified! Please log in to continue.");
          onVerified();
        },
      },
    );
  };

  return (
    <div style={{ marginTop: "auto", padding: "0 24px 44px" }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--accent-text)",
          marginBottom: 8,
        }}
      >
        One More Step
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-display,"Space Grotesk",sans-serif)',
          fontSize: 27,
          fontWeight: 700,
          color: "var(--color-white)",
          lineHeight: 1.2,
          marginBottom: 8,
        }}
      >
        Verify your
        <br />
        email
      </h1>
      <p
        style={{
          fontSize: 12,
          color: "color-mix(in srgb, var(--color-white) 40%, transparent)",
          marginBottom: 24,
        }}
      >
        Enter the 6-digit code sent to{" "}
        <strong style={{ color: "color-mix(in srgb, var(--color-white) 70%, transparent)" }}>
          {pendingEmail}
        </strong>
        .
      </p>

      <form
        onSubmit={handleVerify}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <MobileField
          label="Verification code"
          labelHidden
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="000000"
          required
          inputStyle={{
            fontSize: 24,
            fontWeight: 700,
            textAlign: "center",
            letterSpacing: "0.3em",
          }}
        />

        <button
          type="submit"
          disabled={verifyMutation.isPending || otp.length < 6}
          style={{
            background: "#C4E85A",
            color: "#000",
            fontSize: 14,
            fontWeight: 800,
            borderRadius: 16,
            padding: "14px 0",
            border: "none",
            cursor:
              verifyMutation.isPending || otp.length < 6
                ? "not-allowed"
                : "pointer",
            opacity: verifyMutation.isPending || otp.length < 6 ? 0.7 : 1,
            boxShadow: "0 4px 20px rgba(196,232,90,0.3)",
          }}
        >
          {verifyMutation.isPending ? "Verifying…" : "Verify Email"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <p style={{ fontSize: 12, color: "color-mix(in srgb, var(--color-white) 35%, transparent)" }}>
          Didn&apos;t receive it?{" "}
          <button
            onClick={() => pendingEmail && resendMutation.mutate(pendingEmail)}
            disabled={resendMutation.isPending || !pendingEmail}
            style={{
              color: "var(--accent-text)",
              fontWeight: 700,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              padding: 0,
              opacity: resendMutation.isPending ? 0.5 : 1,
            }}
          >
            {resendMutation.isPending ? "Sending…" : "Resend code"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function MobileAuthPage({
  initialView = "login",
}: {
  initialView?: View;
}) {
  const [view, setView] = useState<View>(initialView);

  return (
    <div
      style={{
        background: "var(--canvas)",
        minHeight: "100svh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background radial gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(196,232,90,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        {/* Room for the page's fixed site header, which carries the logo. */}
        <div aria-hidden="true" style={{ paddingTop: 84, flexShrink: 0 }} />

        {/* View content */}
        {view === "login" && (
          <LoginView
            onSignup={() => setView("signup")}
            onForgot={() => setView("forgot")}
          />
        )}
        {view === "signup" && (
          <SignupView
            onLogin={() => setView("login")}
            onSignedUp={() => setView("verify")}
          />
        )}
        {view === "forgot" && (
          <ForgotView
            onBack={() => setView("login")}
            onSent={() => setView("reset")}
          />
        )}
        {view === "reset" && (
          <ResetView
            onBack={() => setView("forgot")}
            onDone={() => setView("login")}
          />
        )}
        {view === "verify" && (
          <VerifyView onVerified={() => setView("login")} />
        )}
      </div>
    </div>
  );
}
