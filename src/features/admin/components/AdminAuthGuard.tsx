"use client";

import React from "react";
import Link from "next/link";
import { canAccessAdmin } from "@/shared/lib/permissions";
import {
  useAuthStore,
  useAuthStatus,
  useAuthLoading,
} from "@/shared/auth/useAuthStore";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

/**
 * A display gate over store state, not an access boundary.
 *
 * It renders one of three things - a loading frame, a sign-in prompt, or the
 * console - from whatever the auth store already holds. It hydrates nothing:
 * `AuthStoreProvider` is mounted globally and blocks its children until
 * `initialize()` has settled, so the store is populated before this mounts.
 *
 * What actually enforces admin access is `await requireAdmin()` at the top of
 * `app/admin/page.tsx`, off a live /profile call, and `requirePermission` on
 * every admin route in the API. Nothing reaches this component without passing
 * the first of those.
 *
 * This used to run its own `localStorage` hydration on mount. That predated the
 * global provider and had drifted into a second source of truth: it called
 * `login({ user })`, which *writes* `fox_user` back to localStorage, and it
 * read localStorage directly, so it missed the `fox_user` cookie fallback
 * `initialize` has - with site storage cleared but cookies intact, the rest of
 * the app was signed in and only this screen said "Admin Access Required".
 */
const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const isAuthenticated = useAuthStatus();
  const isLoading = useAuthLoading();
  const openLogin = useAuthStore((state) => state.openLogin);
  // Subscribed rather than read through `getState()`, so a role granted
  // mid-session by the profile poll re-renders this gate instead of waiting
  // for something else to redraw the tree.
  const user = useAuthStore((state) => state.user);

  // Show loading state.
  //
  // There used to be an `isClient` flag beside this to hold the first paint
  // back until the store had hydrated. It is redundant: `AuthStoreProvider`
  // renders its own loader until `isLoading` is false, so this component never
  // renders on the server and its first client render already has the store.
  // `isLoading` starts `true`, so it covers that case on its own anyway.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
          <span className="text-white/60 text-sm font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center p-4">
        {/* ... login prompt UI ... */}
        <div className="glass-card rounded-[2rem] p-10 max-w-md w-full text-center border border-white/10 relative overflow-hidden">
          <div className="relative z-10 w-24 h-24 bg-[#ccff00]/30 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-[#ccff00] shadow-[0_0_60px_#ccff00,0_0_100px_rgba(204,255,0,0.5)]">
            <span className="material-symbols-outlined text-[48px] text-black drop-shadow-[0_0_15px_#ccff00]">
              lock
            </span>
          </div>
          <h1 className="relative z-10 text-3xl font-display font-bold text-white mb-3">
            Admin Access Required
          </h1>
          <p className="relative z-10 text-white/60 mb-10">
            Please log in to access the admin dashboard.
          </p>
          <button
            onClick={openLogin}
            className="relative z-10 w-full btn-neon bg-accent hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] text-black font-bold py-4 px-8 rounded-full transition-all hover:scale-[1.02]"
          >
            Log In to Continue
          </button>
        </div>
      </div>
    );
  }

  // Capability rather than role — admin_secretary belongs here too.
  const isAdmin = canAccessAdmin(user);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center p-4">
        <div className="glass-card rounded-[2rem] p-10 max-w-md w-full text-center border border-white/10 relative overflow-hidden">
          <div className="relative z-10 w-24 h-24 bg-red-500/30 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.3)]">
            <span className="material-symbols-outlined text-[48px] text-white">
              block
            </span>
          </div>
          <h1 className="relative z-10 text-3xl font-display font-bold text-white mb-3">
            Permission Denied
          </h1>
          <p className="relative z-10 text-white/60 mb-10">
            You do not have the necessary permissions to access this area.
          </p>
          <Link
            href="/"
            className="relative z-10 w-full btn-neon bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-full transition-all block text-center"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // User is authenticated and is an admin
  return <>{children}</>;
};

export default AdminAuthGuard;
