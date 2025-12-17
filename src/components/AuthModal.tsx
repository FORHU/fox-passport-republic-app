"use client";

import { X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';

export default function AuthModal() {
  const { isOpen, view, close, toggleView } = useAuthStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={close} className="p-1 hover:bg-gray-100 rounded-full transition text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {view === 'login' ? <LoginForm /> : <SignupForm />}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t text-center text-sm text-gray-600">
          {view === 'login' ? (
             <p>Don't have an account? <span onClick={toggleView} className="text-pink-600 font-bold cursor-pointer hover:underline">Sign Up</span></p>
          ) : (
             <p>Already have an account? <span onClick={toggleView} className="text-pink-600 font-bold cursor-pointer hover:underline">Log In</span></p>
          )}
        </div>
      </div>
    </div>
  );
}