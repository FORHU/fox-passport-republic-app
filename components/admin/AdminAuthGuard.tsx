"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore, useAuthActions, useAuthStatus, useAuthLoading } from '@/store/useAuthStore';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const isAuthenticated = useAuthStatus();
  const isLoading = useAuthLoading();
  const { openLogin, setLoading } = useAuthActions();
  const [isClient, setIsClient] = useState(false);

  // Check for existing auth on mount
  useEffect(() => {
    setIsClient(true);
    const storedUser = localStorage.getItem('fox_user');
    const storedToken = localStorage.getItem('fox_token');
    const storedRefreshToken = localStorage.getItem('fox_refresh_token');

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        useAuthStore.getState().login({
          user: userData,
          accessToken: storedToken,
          refreshToken: storedRefreshToken || ""
        });
      } catch {
        localStorage.removeItem('fox_user');
        localStorage.removeItem('fox_token');
        localStorage.removeItem('fox_refresh_token');
      }
    }
    setLoading(false);
  }, [setLoading]);

  // Show loading state
  if (!isClient || isLoading) {
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
        <div className="glass-card rounded-[2rem] p-10 max-w-md w-full text-center border border-white/10 relative overflow-hidden">
          {/* Background glow effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/20 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-[60px] pointer-events-none"></div>

          {/* Lock Icon */}
          <div className="relative z-10 w-24 h-24 bg-[#ccff00]/30 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-[#ccff00] shadow-[0_0_60px_#ccff00,0_0_100px_rgba(204,255,0,0.5)]">
            <span className="material-symbols-outlined text-[48px] text-black drop-shadow-[0_0_15px_#ccff00]">lock</span>
          </div>

          {/* Title */}
          <h1 className="relative z-10 text-3xl font-display font-bold text-white mb-3">
            Admin Access Required
          </h1>
          <p className="relative z-10 text-white/60 mb-10">
            Please log in to access the admin dashboard.
          </p>

          {/* Login Button */}
          <button
            onClick={openLogin}
            className="relative z-10 w-full btn-neon bg-accent hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] text-black font-bold py-4 px-8 rounded-full transition-all hover:scale-[1.02]"
          >
            Log In to Continue
          </button>

          {/* Back Link */}
          <a
            href="/"
            className="relative z-10 inline-flex items-center gap-2 mt-6 text-sm text-white/50 hover:text-accent transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // User is authenticated, show admin content
  return <>{children}</>;
};

export default AdminAuthGuard;
