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
    <div className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 md:hidden z-99 animate-in slide-in-from-top-1 duration-200">
      <div className="px-4 py-3">
        {/* Navigation Links */}
        <div className="space-y-1">
          <p className="px-3 pt-1 pb-0.5 text-[9px] font-black uppercase tracking-widest text-gray-400">
            Browse
          </p>
          {BROWSE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-2 text-gray-700 font-medium text-sm hover:text-pink-600 hover:bg-pink-50 transition-colors py-2.5 px-3 rounded-lg"
            >
              <span className="material-symbols-outlined text-[16px] text-pink-500">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
          <div className="my-1 border-t border-gray-100" />
          <button
            onClick={() => {
              onClose();
              onOpenHostModal();
            }}
            className="w-full text-left text-gray-800 font-semibold text-sm hover:text-pink-600 hover:bg-pink-50 transition-colors py-3 px-3 rounded-lg"
          >
            Become a Foxer
          </button>

          <button
            onClick={handleWriteReview}
            className="w-full text-left text-gray-600 font-medium text-sm hover:text-pink-600 hover:bg-pink-50 transition-colors py-3 px-3 rounded-lg"
          >
            Write a Review
          </button>

          <Link
            href="/business"
            className="block text-gray-600 font-medium text-sm hover:text-pink-600 hover:bg-pink-50 transition-colors py-3 px-3 rounded-lg"
            onClick={onClose}
          >
            For Businesses
          </Link>
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-gray-100" />

        {/* Auth Buttons */}
        {!isAuthenticated ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                onOpenLogin();
                onClose();
              }}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all text-sm"
            >
              Log In
            </button>
            <button
              onClick={() => {
                onOpenSignup();
                onClose();
              }}
              className="flex-1 py-2.5 rounded-lg bg-[#E31C79] text-white font-semibold hover:bg-pink-700 shadow-sm transition-all text-sm"
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                router.push("/user/passport");
              }}
              className="flex-1 py-2.5 rounded-lg bg-accent text-black font-semibold hover:bg-accent/90 shadow-sm transition-all text-sm"
            >
              Passport
            </button>
            <button
              onClick={() => {
                onClose();
                router.push("/user");
              }}
              className="flex-1 py-2.5 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 shadow-sm transition-all text-sm"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all text-sm"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NavMobileMenu;
