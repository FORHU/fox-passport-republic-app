"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * Shared minimal header for every role-application form (Mayor, Host,
 * Foxer) — logo + a back/close affordance, nothing else. These forms don't
 * want the full app nav (Explore/Foxers/Map/Republic), just a way out.
 *
 * Before this, three of the four apply flows had no header at all (just
 * blank `pt-24` padding assuming one existed), while the fourth
 * (MobileRoleApplicationForm on /foxer/apply) drew its own bespoke bar
 * floating at a hardcoded `top: 62px` with nothing rendered above it. One
 * shared component fixes both: real content where there was empty space,
 * and the same design everywhere instead of a one-off.
 */
export function ApplicationFlowHeader() {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050608]/90 backdrop-blur-xl border-b border-white/5 h-14 sm:h-16 flex items-center px-4 sm:px-6 gap-3">
      <Image
        src="/foxonlylogo.png"
        alt="FoxPassport"
        width={22}
        height={22}
        className="object-contain shrink-0"
      />
      <p className="flex-1 text-sm sm:text-base font-bold font-display truncate">
        FoxPassport
      </p>
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Back"
        className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </header>
  );
}
