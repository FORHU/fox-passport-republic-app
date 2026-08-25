import { toast } from "sonner";

// On-brand alternative to sonner's richColors variants, styled with the
// app's accent (#ccff00) and glass-card surface instead of red/blue/green.
export function toastRequireLogin(message: string) {
  toast(message, {
    icon: (
      <span className="material-symbols-outlined text-accent text-[20px]">
        lock
      </span>
    ),
    style: {
      background: "#13141f",
      border: "1px solid rgba(204, 255, 0, 0.35)",
      color: "#ffffff",
    },
  });
}
