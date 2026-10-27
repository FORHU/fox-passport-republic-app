import Link from "next/link";

interface StudioAccessDeniedProps {
  /** The page being refused, e.g. "Event Studio". */
  studio: string;
  /** The role that opens it, e.g. "Event Foxer". */
  role: string;
  /** Where to apply for that role. */
  applyHref: string;
}

/**
 * Shown in place of a Studio to someone without the role it needs, when they
 * reach it by URL. The links to it are already hidden from them; this is for
 * the typed address. UI only — the API refuses the save regardless.
 *
 * Styled after the admin console's Permission Denied card (AdminAuthGuard).
 */
export function StudioAccessDenied({
  studio,
  role,
  applyHref,
}: StudioAccessDeniedProps) {
  return (
    <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center p-4">
      <div className="glass-card rounded-[2rem] p-10 max-w-md w-full text-center border border-white/10">
        <div className="w-24 h-24 bg-red-500/30 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-red-500">
          <span className="material-symbols-outlined text-[48px] text-white">
            block
          </span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white mb-3">
          {studio} is for {role}s
        </h1>
        <p className="text-white/60 mb-10">
          Your account doesn&apos;t have the {role} role yet.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={applyHref}
            className="w-full btn-neon bg-accent text-black font-bold py-4 px-8 rounded-full transition-all hover:scale-[1.02] block text-center"
          >
            Apply to become a{/^[AEIOU]/.test(role) ? "n" : ""} {role}
          </Link>
          <Link
            href="/creator-dashboard"
            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-full transition-all block text-center"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
