import { cn } from "@/shared/lib/utils";

export type InlineAlertTone = "success" | "error" | "warning" | "info";

const TONES: Record<InlineAlertTone, { icon: string; className: string }> = {
  success: {
    icon: "check_circle",
    className: "bg-green-500/10 border-green-500/20 text-green-400",
  },
  error: {
    icon: "error",
    className: "bg-red-500/10 border-red-500/20 text-red-400",
  },
  warning: {
    icon: "warning",
    className: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  },
  info: {
    icon: "info",
    className: "bg-white/5 border-white/10 text-white/70",
  },
};

/**
 * A message that stays on the page, about a whole form or section — e.g. a
 * save the server rejected. For a message about one field use `FieldError`;
 * for a passing confirmation ("Saved") use a sonner toast.
 */
export function InlineAlert({
  tone,
  title,
  children,
  className,
}: {
  tone: InlineAlertTone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { icon, className: toneClass } = TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 px-4 py-3 rounded-xl border text-sm font-medium",
        toneClass,
        className,
      )}
    >
      <span
        aria-hidden
        className="material-symbols-outlined text-[18px] leading-5 shrink-0"
      >
        {icon}
      </span>
      <div className="min-w-0">
        {title && <p className="font-bold">{title}</p>}
        <div className={title ? "opacity-80" : undefined}>{children}</div>
      </div>
    </div>
  );
}

export default InlineAlert;
