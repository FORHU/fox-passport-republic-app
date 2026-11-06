"use client";

import { IconButton } from "@/shared/components/ui/IconButton";

/** The show/hide button inside a password field. Reachable by keyboard and named by its action. */
export function PasswordVisibilityToggle({
  visible,
  onToggle,
  className = "flex h-9 w-9 items-center justify-center rounded-lg text-white/30 hover:text-white transition-colors",
}: {
  visible: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <IconButton
      // A toggle keeps one name; aria-pressed says whether it is on.
      label="Show password"
      pressed={visible}
      onClick={onToggle}
      className={className}
      icon={
        <span className="material-symbols-outlined text-[20px]">
          {visible ? "visibility_off" : "visibility"}
        </span>
      }
    />
  );
}
