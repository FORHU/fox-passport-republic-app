/**
 * Shown next to someone's name once an admin has checked their government ID
 * (User.identityVerifiedAt). Trust signal only — it gates nothing.
 */
export function VerifiedBadge({
  verifiedAt,
  size = "sm",
}: {
  verifiedAt?: string | Date | null;
  size?: "xs" | "sm";
}) {
  if (!verifiedAt) return null;
  return (
    <span
      title="ID verified by Fox Passport"
      aria-label="ID verified"
      className="inline-flex items-center text-sky-400 shrink-0"
    >
      <span
        className={`material-symbols-outlined ${size === "xs" ? "text-[14px]" : "text-[18px]"}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        verified
      </span>
    </span>
  );
}
