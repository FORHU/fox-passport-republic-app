"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchExchangeRates } from "@/shared/api/fx";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import api from "@/shared/lib/axios";
import {
  DEFAULT_CURRENCY,
  convertCurrency,
  formatCurrency,
} from "@/shared/lib/currency";

const STORAGE_KEY = "fox_display_currency";

interface CurrencyContextValue {
  /** The currency the viewer chose to see amounts in. */
  currency: string;
  setCurrency: (code: string) => void;
  /** Converts `amount` (denominated in `from`) into the viewer's chosen currency. */
  convert: (amount: number, from?: string) => number;
  /** Converts then formats — the one most call sites want. */
  format: (amount: number, from?: string) => string;
  isConverting: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [guestCurrency, setGuestCurrency] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_CURRENCY;
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_CURRENCY;
    } catch {
      return DEFAULT_CURRENCY;
    }
  });

  // Signed-in: the account's own preference, kept in sync via useProfile.
  // Signed-out: a per-device fallback, since there's no account to persist to.
  const currency = user?.preferredCurrency || guestCurrency;

  const { data } = useQuery({
    queryKey: ["fx-rates", DEFAULT_CURRENCY],
    queryFn: () => fetchExchangeRates(DEFAULT_CURRENCY),
    staleTime: 60 * 60 * 1000, // 1h — matches the backend's own 6h cache closely enough
    retry: 1,
  });

  const setCurrency = useCallback(
    (code: string) => {
      if (user) {
        setUser({ ...user, preferredCurrency: code });
        // Fire-and-forget: the picker should feel instant, and a failed
        // persist just means the choice reverts to the account's stored
        // value on next login rather than breaking the current session.
        api
          .put("/profile", { preferredCurrency: code })
          .catch((e) => console.error("Failed to save currency preference", e));
      } else {
        setGuestCurrency(code);
        try {
          localStorage.setItem(STORAGE_KEY, code);
        } catch {
          // localStorage unavailable (private mode, etc) — the choice just
          // won't survive a reload, which is a reasonable degradation.
        }
      }
    },
    [user, setUser],
  );

  const convert = useCallback(
    (amount: number, from: string = DEFAULT_CURRENCY) =>
      convertCurrency(amount, from, currency, data?.rates, data?.base ?? DEFAULT_CURRENCY),
    [currency, data],
  );

  const format = useCallback(
    (amount: number, from: string = DEFAULT_CURRENCY) =>
      formatCurrency(convert(amount, from), currency),
    [convert, currency],
  );

  const value = useMemo(
    () => ({ currency, setCurrency, convert, format, isConverting: !data }),
    [currency, setCurrency, convert, format, data],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
