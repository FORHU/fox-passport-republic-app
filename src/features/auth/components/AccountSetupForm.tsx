"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { endSession } from "@/shared/auth/endSession";
import { takeReturnTo } from "@/shared/auth/returnTo";
import type { User } from "@/shared/auth/types";
import { getLandingPath } from "@/shared/lib/dashboard-path";
import { getApiErrorMessage } from "@/shared/lib/apiError";
import { PASSWORD_HINT } from "@/shared/lib/passwordPolicy";
import {
  accountSetupSchema,
  usernameSchema,
  type AccountSetupFormData,
} from "@/shared/lib/schema";
import { TextField } from "@/shared/components/ui/TextField";
import PageLoader from "@/shared/components/ui/PageLoader";
import {
  isUsernameAvailable,
  submitAccountSetup,
} from "@/features/auth/api/accountSetup";

/** How long typing pauses before the username is checked. */
export const USERNAME_CHECK_DELAY_MS = 400;

type Availability = "idle" | "checking" | "available" | "taken";
type Needs = { username: boolean; password: boolean };

const labelClassName = "block text-xs font-bold text-white/70 mb-1.5 ml-1";

/**
 * A Google account picks the username and password it lacks before using the
 * app (api#419). Only the missing ones are asked; the username is checked as
 * it is typed. `?then=onboarding` sends a first sign-in on to onboarding.
 */
export default function AccountSetupForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  // Set once the form has saved and is navigating on its own, so the check
  // below doesn't send the person somewhere else at the same time.
  const finished = useRef(false);

  // Someone with nothing left to set (or who opened this page directly) goes on.
  useEffect(() => {
    if (user && !user.needsCredentialSetup && !finished.current) {
      router.replace(getLandingPath(user));
    }
  }, [user, router]);

  if (!user || !user.needsCredentialSetup) {
    return <PageLoader label="Loading your account" />;
  }

  const needs = { username: !user.username, password: !user.hasPassword };
  return (
    <SetupFields
      // A new set of missing fields is a new form, with its own rules.
      key={`${needs.username}-${needs.password}`}
      needs={needs}
      onDone={() => {
        finished.current = true;
      }}
    />
  );
}

function SetupFields({ needs, onDone }: { needs: Needs; onDone: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [availability, setAvailability] = useState<Availability>("idle");
  const [signingOut, setSigningOut] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AccountSetupFormData>({
    resolver: zodResolver(accountSetupSchema(needs)),
  });

  // Checked once typing pauses, and only once it meets the username rule.
  const username = useWatch({ control, name: "username" }) ?? "";
  useEffect(() => {
    if (!needs.username) return;
    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) {
      setAvailability("idle");
      return;
    }
    let current = true;
    setAvailability("checking");
    const timer = setTimeout(() => {
      isUsernameAvailable(parsed.data)
        .then((free) => {
          if (current) setAvailability(free ? "available" : "taken");
        })
        .catch(() => {
          if (current) setAvailability("idle");
        });
    }, USERNAME_CHECK_DELAY_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [username, needs.username]);

  const goOn = (fresh: User) => {
    onDone();
    setUser(fresh);
    toast.success("Your account is all set");
    router.replace(
      searchParams.get("then") === "onboarding"
        ? "/onboarding"
        : takeReturnTo(getLandingPath(fresh)),
    );
  };

  const onSubmit: SubmitHandler<AccountSetupFormData> = async (data) => {
    if (needs.username && availability === "taken") {
      setError("username", { message: "Username already taken" });
      return;
    }
    try {
      goOn(
        await submitAccountSetup({
          ...(needs.username ? { username: data.username } : {}),
          ...(needs.password
            ? { password: data.password, confirmPassword: data.confirmPassword }
            : {}),
        }),
      );
    } catch (error) {
      const field = (error as { response?: { data?: { field?: unknown } } })
        ?.response?.data?.field;
      const message = getApiErrorMessage(
        error,
        "We couldn't save that. Please try again.",
      );
      if (
        field === "username" ||
        field === "password" ||
        field === "confirmPassword"
      ) {
        setError(field, { message });
      } else {
        toast.error(message);
      }
    }
  };

  const signOut = async () => {
    setSigningOut(true);
    await endSession();
    window.location.href = "/";
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="mb-2 font-display text-2xl font-bold text-white sm:text-3xl">
            Finish setting up your account
          </h1>
          <p className="text-sm text-gray-400">
            {needs.username && needs.password
              ? "Choose a username and a password. You can then also sign in with your email and password."
              : needs.username
                ? "Choose a username to continue."
                : "Choose a password, so you can also sign in with your email and password."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {needs.username && (
            <TextField
              {...register("username")}
              label="USERNAME"
              labelClassName={labelClassName}
              placeholder="your.name"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              error={errors.username?.message}
              hint={<AvailabilityHint availability={availability} />}
            />
          )}

          {needs.password && (
            <>
              <TextField
                {...register("password")}
                label="PASSWORD"
                labelClassName={labelClassName}
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                required
                hint={PASSWORD_HINT}
                error={errors.password?.message}
              />
              <TextField
                {...register("confirmPassword")}
                label="CONFIRM PASSWORD"
                labelClassName={labelClassName}
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                required
                error={errors.confirmPassword?.message}
              />
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting || signingOut}
            className="btn-neon mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-black transition-all disabled:opacity-70 sm:py-4 sm:text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
                <span className="sr-only">Saving…</span>
              </>
            ) : (
              "Continue"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="text-sm font-bold text-white/60 transition-colors hover:text-white"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AvailabilityHint({ availability }: { availability: Availability }) {
  if (availability === "checking") {
    return (
      <span className="inline-flex items-center gap-1">
        <Loader2 aria-hidden="true" className="h-3 w-3 animate-spin" />
        Checking…
      </span>
    );
  }
  if (availability === "available") {
    return (
      <span className="inline-flex items-center gap-1 text-lime-400">
        <CheckCircle2 aria-hidden="true" className="h-3 w-3" />
        Available
      </span>
    );
  }
  if (availability === "taken") {
    return (
      <span className="inline-flex items-center gap-1 text-red-400">
        <XCircle aria-hidden="true" className="h-3 w-3" />
        Already taken
      </span>
    );
  }
  return <>3–30 characters: letters, numbers, dots and underscores</>;
}
