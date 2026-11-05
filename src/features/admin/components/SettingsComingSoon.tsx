import Link from "next/link";

/**
 * The Settings section has no backing API yet. Rather than a placeholder that
 * reads like a broken page, say plainly that it is not available and offer a
 * way back.
 */
export function SettingsComingSoon() {
  return (
    <section
      aria-labelledby="admin-settings-heading"
      className="glass-card rounded-[2rem] p-12 border border-white/5 flex flex-col items-center gap-4 text-center"
    >
      <span
        aria-hidden="true"
        className="material-symbols-outlined text-[56px] text-white/20"
      >
        settings
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
        Not yet available
      </span>
      <h2
        id="admin-settings-heading"
        className="text-2xl font-display font-bold text-white"
      >
        Platform settings are coming soon
      </h2>
      <p className="text-text-muted max-w-md">
        Platform-wide configuration isn&apos;t available in the console yet.
        Fees, policies, promotions and categories each have their own section
        in the sidebar.
      </p>
      <Link
        href="/admin"
        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all"
      >
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-[18px]"
        >
          arrow_back
        </span>
        Back to dashboard
      </Link>
    </section>
  );
}
