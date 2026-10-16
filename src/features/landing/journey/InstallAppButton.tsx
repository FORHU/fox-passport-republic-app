/**
 * "Install the app", for the mobile app that is on its way.
 *
 * Disabled until there is a build to install. To switch it on, give it an
 * `href` (a store link, or the page that routes to the right one) and drop the
 * `disabled` styling - nothing else about its placement needs to change.
 */
export function InstallAppButton({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-auto flex items-center gap-3 ${className}`}>
      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-describedby="install-app-note"
        className="font-landing-mono inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/50"
      >
        <span aria-hidden className="material-symbols-outlined text-[16px]">
          download
        </span>
        Install the app
      </button>
      <span
        id="install-app-note"
        className="font-landing-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/60"
      >
        Coming soon
      </span>
    </div>
  );
}
