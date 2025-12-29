"use client";

import { useAuthStore } from '@/store/useAuthStore';
import LoginForm from '@/components/authentication/LoginForm';
import SignupForm from '@/components/authentication/SignupForm';

export default function AuthModal() {
  const { isOpen, view } = useAuthStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 p-4 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-[520px] bg-white rounded-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Scrollable container (hidden scrollbar) */}
        <div className="w-full overflow-y-auto hide-scrollbar">
           {view === 'login' ? <LoginForm /> : <SignupForm />}
        </div>
        
      </div>
    </div>
  );
}