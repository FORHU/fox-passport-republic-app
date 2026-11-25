"use client";

import { Moon, Sun } from "lucide-react";
import { Switch } from "@/shared/components/ui/Switch";
import { useHydratedTheme, useThemeStore } from "@/shared/store/useThemeStore";

/**
 * Light / dark as one switch: on is dark (the app's default), with a moon in
 * the knob; off is light, with a sun (app#380). For signed-out visitors in the
 * header; signed-in users also have the picker in their user menu.
 */
export function ThemeToggle({
  "aria-labelledby": labelledBy,
}: {
  "aria-labelledby"?: string;
}) {
  // The server can't know a saved Light choice: render its theme while
  // hydrating, then the real one, so aria-checked never mismatches.
  const theme = useHydratedTheme();
  const setTheme = useThemeStore((s) => s.setTheme);
  const dark = theme === "dark";

  return (
    <Switch
      checked={dark}
      onCheckedChange={(on) => setTheme(on ? "dark" : "light")}
      aria-label={labelledBy ? undefined : "Dark mode"}
      aria-labelledby={labelledBy}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      thumb={
        dark ? (
          <Moon aria-hidden className="h-3 w-3" strokeWidth={2.5} />
        ) : (
          <Sun aria-hidden className="h-3 w-3" strokeWidth={2.5} />
        )
      }
    />
  );
}
