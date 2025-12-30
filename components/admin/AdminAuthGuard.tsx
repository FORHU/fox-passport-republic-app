"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore, useAuthActions, useAuthStatus, useAuthLoading } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

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
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        useAuthStore.getState().login(userData);
      } catch {
        localStorage.removeItem('fox_user');
      }
    }
    setLoading(false);
  }, [setLoading]);

  // Show loading state
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8f8] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f6f8f8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-pink-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Admin Access Required
          </h1>
          <p className="text-slate-500 mb-8">
            Please log in to access the admin dashboard.
          </p>
          <button
            onClick={openLogin}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-pink-500/20"
          >
            Log In to Continue
          </button>
          <a
            href="/"
            className="inline-block mt-4 text-sm text-slate-500 hover:text-pink-500 transition-colors"
          >
            &larr; Back to Home
          </a>
        </div>
      </div>
    );
  }

  // User is authenticated, show admin content
  return <>{children}</>;
};

export default AdminAuthGuard;
