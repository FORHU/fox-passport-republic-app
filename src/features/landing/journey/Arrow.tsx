/** The forward arrow on landing links, from the app's Material Symbols font. */
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`material-symbols-outlined text-[1.15em] leading-none transition-transform group-hover:translate-x-0.5 ${className}`}
    >
      arrow_forward
    </span>
  );
}
