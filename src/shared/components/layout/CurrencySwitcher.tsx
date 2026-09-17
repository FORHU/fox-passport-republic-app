"use client";

import { useState } from "react";
import { Coins, Check } from "lucide-react";
import { useCurrency } from "@/shared/providers/CurrencyProvider";

const CURRENCY_LABELS: Record<string, string> = {
  PHP: "Philippine Peso",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  AUD: "Australian Dollar",
  SGD: "Singapore Dollar",
  CAD: "Canadian Dollar",
  HKD: "Hong Kong Dollar",
  KRW: "South Korean Won",
};

const CURRENCIES = Object.keys(CURRENCY_LABELS);

/**
 * Dropdown for the viewer's display currency. Lives inline (not a page nav
 * item) so it's a one-click change rather than a navigation — the choice is
 * display-only (see CurrencyProvider), so there's no confirmation step.
 */
export function CurrencySwitcher({ onAfterSelect }: { onAfterSelect?: () => void }) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
      >
        <Coins className="w-4 h-4 text-white/40 group-hover:text-[#ccff00] transition-colors shrink-0" />
        <span className="text-sm text-white/70 group-hover:text-white transition-colors">
          Currency
        </span>
        <span className="ml-auto text-xs font-bold text-white/40 group-hover:text-[#ccff00] transition-colors">
          {currency}
        </span>
      </button>

      {open && (
        <div
          className="mt-1 mb-1 mx-2 max-h-64 overflow-y-auto custom-scrollbar rounded-lg border border-white/10 bg-[#13141f]"
          onClick={(e) => e.stopPropagation()}
        >
          {CURRENCIES.map((code) => (
            <button
              key={code}
              onClick={() => {
                setCurrency(code);
                setOpen(false);
                onAfterSelect?.();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors"
            >
              <span className="text-sm font-bold text-white/80 w-10 shrink-0">
                {code}
              </span>
              <span className="text-xs text-white/40 truncate">
                {CURRENCY_LABELS[code]}
              </span>
              {currency === code && (
                <Check className="w-3.5 h-3.5 text-[#ccff00] ml-auto shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
