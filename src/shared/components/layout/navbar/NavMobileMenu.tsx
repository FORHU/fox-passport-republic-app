"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BROWSE_ITEMS } from "./BrowseDropdown";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { clearAuthCookies } from "@/shared/lib/server/auth-actions";

interface NavMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHostModal: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export function NavMobileMenu({
  isOpen,
  onClose,
  onOpenHostModal,
  onOpenLogin,
  onOpenSignup,
}: NavMobileMenuProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  if (!isOpen) return null;

  const handleWriteReview = () => {
    onClose();
    if (isAuthenticated) {
      router.push("/reviews/select");
    } else {
      onOpenLogin();
    }
  };

  const handleLogout = async () => {
    await clearAuthCookies();
    useAuthStore.getState().logout();
    onClose();
    router.push("/");
  };

  return (
    <div className="absolute top-full left-0 right-0 mx-auto max-w-7xl px-4 pt-2 lg:hidden z-100 animate-in slide-in-from-top-2 duration-300">
      <div className="glass-panel bg-[#0f111a]/95 backdrop-blur-2xl rounded-3xl p-5 border border-white/10 shadow-2xl space-y-4">
        {/* Navigation Links */}
        <div className="space-y-1">
          <p className="px-3 pt-1 pb-1 text-[10px] font-black uppercase tracking-widest text-white/40 font-display">
            Explore Republic
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {BROWSE_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 text-white/80 font-medium text-sm hover:text-white hover:bg-white/10 transition-all py-3 px-3.5 rounded-xl active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px] text-accent">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="my-2 border-t border-white/5" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            <Link
              href="/creator-dashboard"
              onClick={onClose}
              className="flex items-center gap-3 text-white/80 font-medium text-sm hover:text-white hover:bg-white/10 transition-all py-3 px-3.5 rounded-xl active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px] text-purple-400">
                dashboard
              </span>
              Creator Dashboard
            </Link>

            <Link
              href="/booking"
              onClick={onClose}
              className="flex items-center gap-3 text-white/80 font-medium text-sm hover:text-white hover:bg-white/10 transition-all py-3 px-3.5 rounded-xl active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px] text-pink-400">
                event_available
              </span>
              Bookings
            </Link>

            <button
              onClick={() => {
                onClose();
                onOpenHostModal();
              }}
              className="w-full text-left flex items-center gap-3 text-white font-bold text-sm text-accent hover:bg-accent/10 transition-all py-3 px-3.5 rounded-xl active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px] text-accent">
                add_business
              </span>
              Become a Foxer
            </button>

            <button
              onClick={handleWriteReview}
              className="w-full text-left flex items-center gap-3 text-white/70 font-medium text-sm hover:text-white hover:bg-white/10 transition-all py-3 px-3.5 rounded-xl active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px] text-yellow-400">
                rate_review
              </span>
              Write a Review
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Auth Buttons */}
        {!isAuthenticated ? (
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={() => {
                onOpenLogin();
                onClose();
              }}
              className="w-full py-3 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/10 active:scale-98 transition-all text-sm flex items-center justify-center gap-2"
            >
              Log In
            </button>
            <button
              onClick={() => {
                onOpenSignup();
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-accent text-black font-extrabold hover:bg-accent/90 shadow-[0_0_20px_rgba(204,255,0,0.3)] active:scale-98 transition-all text-sm flex items-center justify-center gap-2"
            >
              Join Republic
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={() => {
                onClose();
                router.push("/user/passport");
              }}
              className="flex-1 py-3 rounded-2xl bg-accent text-black font-extrabold hover:bg-accent/90 shadow-sm transition-all text-sm flex items-center justify-center gap-2 active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">
                badge
              </span>
              Passport
            </button>
            <button
              onClick={() => {
                onClose();
                router.push("/user");
              }}
              className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all text-sm flex items-center justify-center gap-2 active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">
                person
              </span>
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="py-3 px-4 rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold transition-all text-sm flex items-center justify-center gap-2 active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">
                logout
              </span>
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NavMobileMenu;
