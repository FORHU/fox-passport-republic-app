'use client';
import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import LoginForm from '@/components/authentication/LoginForm';
import SignupForm from '@/components/authentication/SignupForm';

export default function AuthModal() {
  const { isOpen, view, close } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={close}></div>
      
      <div className="relative w-full max-w-[480px] transform transition-all">
        {/* Background Blobs */}
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-[#ccff00] rounded-full blur-[100px] opacity-20 animate-pulse-slow pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-[#ccff00] rounded-full blur-[100px] opacity-10 animate-pulse-slow pointer-events-none" style={{ animationDelay: '1.5s' }}></div>

        <div className="glass-card relative rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          
          <div className="relative p-8 sm:p-10">
            <button 
              onClick={close}
              className="absolute top-6 right-6 h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white hover:text-black transition-all hover:rotate-90 z-20"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            {view === 'login' ? (
              <LoginForm />
            ) : (
              <SignupForm />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}