"use client";

import { useAuthStore } from '../store/useAuthStore';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';

export default function AuthModal() {
  const { isOpen, view } = useAuthStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 p-4 animate-in fade-in duration-200">
      
      {/* FRAME:
          - max-h-[85vh]: Slightly shorter to ensure it fits on laptops.
          - overflow-hidden: Keeps rounded corners clean.
          - flex: Essential for child layout.
      */}
      <div className="relative w-full max-w-[420px] bg-white rounded-xl shadow-2xl flex max-h-[85vh] overflow-hidden">
        
        {/* Child fills this container */}
        <div className="w-full h-full">
           {view === 'login' ? <LoginForm /> : <SignupForm />}
        </div>
        
      </div>
    </div>
  );
}