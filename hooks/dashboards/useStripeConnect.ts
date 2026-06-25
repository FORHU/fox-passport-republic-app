"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface StripeConnectStatus {
  hasStripeAccount: boolean;
  stripeOnboardingComplete: boolean;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
}

interface UseStripeConnectReturn {
  status: StripeConnectStatus | null;
  loading: boolean;
  onboarding: boolean;
  error: string | null;
  startOnboarding: () => Promise<void>;
}

export function useStripeConnect(): UseStripeConnectReturn {
  const [onboarding, setOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: status, isLoading: loading } = useQuery<StripeConnectStatus>({
    queryKey: ["stripe-connect-status"],
    queryFn: async () => {
      const res = await api.get("/stripe-connect/status");
      return res.data?.data ?? res.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  const startOnboarding = useCallback(async () => {
    try {
      setOnboarding(true);
      setError(null);
      const res = await api.post("/stripe-connect/onboard");
      const url = res.data?.data?.url ?? res.data?.url;
      if (url) {
        window.open(url, "_blank");
      } else {
        throw new Error("No onboarding URL returned");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start onboarding";
      setError(msg);
    } finally {
      setOnboarding(false);
    }
  }, []);

  return {
    status: status ?? null,
    loading,
    onboarding,
    error,
    startOnboarding,
  };
}
