"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/shared/store/useThemeStore";
import { currentTheme, type Theme } from "@/shared/lib/theme";

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

/** Light / Dark choice for the user menu, beside the currency switcher. */
export function ThemeSwitcher() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  // The store reads <html> when it's created; if that happened during server
  // rendering it holds the default, so sync once with what the page shows.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const shown = currentTheme();
    if (shown !== useThemeStore.getState().theme) {
      useThemeStore.setState({ theme: shown });
    }
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-3 px-2 py-2.5">
      <span className="text-sm text-white/70 flex-1">Appearance</span>
      <div
        role="radiogroup"
        aria-label="Appearance"
        className="flex rounded-full border border-white/10 bg-white/5 p-0.5"
      >
        {OPTIONS.map(({ value, label, Icon }) => {
          const active = mounted && theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(value)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                active
                  ? "bg-accent text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
