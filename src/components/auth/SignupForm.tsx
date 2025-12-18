"use client";

import React from 'react';
import Image from 'next/image'; 
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, X } from 'lucide-react'; 

import { useSignup } from '@/src/hooks/useAuth';
import { signupSchema, SignupFormData } from '@/src/lib/schema';
import { AuthInput } from './AuthInput';
import { useAuthStore } from '@/src/store/useAuthStore';

export default function SignupForm() {
  const signupMutation = useSignup();
  const { toggleView, close } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  const onSignup: SubmitHandler<SignupFormData> = (data) => signupMutation.mutate(data);

  return (
    // ROOT: Flex column to stack Header -> Middle -> Footer
    <div className="flex flex-col h-full w-full bg-white">
      
      {/* --- 1. COMPACT HEADER --- */}
      <div className="relative px-5 pt-5 pb-2 text-center flex-shrink-0 z-10 bg-white">
        <button 
          onClick={close} 
          className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition text-gray-500"
        >
          <X size={18} />
        </button>
        <div className="flex flex-col items-center">
            
            {/* Smaller Logo (w-12) */}
            <div className="relative w-12 h-12 mb-2">
               <Image 
                 src="/logofoxpassport.png" 
                 alt="FoxPassport Logo" 
                 fill
                 className="object-contain"
                 priority
               />
            </div>

            <h2 className="text-lg font-bold text-gray-800 tracking-tight">
              Sign in to FoxPassport
            </h2>
            <p className="text-[10px] text-gray-500 mt-1 max-w-xs mx-auto leading-tight">
              By continuing, you agree to FoxPassport’s{' '}
              <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
        </div>
      </div>

      {/* --- 2. COMPACT MIDDLE (Scrolls) --- */}
      {/* flex-1 + min-h-0 is the magic combo that allows scrolling without breaking flexbox */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-2 custom-scrollbar">
        <form onSubmit={handleSubmit(onSignup)} className="space-y-2 mt-1">
            <AuthInput 
              label="Email" 
              name="email" 
              type="email" 
              register={register} 
              error={errors.email} 
            />
            <AuthInput 
              label="Username" 
              name="username" 
              register={register} 
              error={errors.username} 
            />
            <AuthInput 
              label="Password" 
              name="password" 
              type="password" 
              register={register} 
              error={errors.password} 
            />
            
            {/* Compact Optional Section */}
            <div className="pt-2 border-t border-gray-100 mt-2">
                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Optional Details</p>
                <div className="space-y-2">
                    <AuthInput 
                        label="Full Name" 
                        name="name" 
                        required={false}
                        register={register} 
                        error={errors.name} 
                    />
                    <AuthInput 
                        label="Mobile Number" 
                        name="mobileNumber" 
                        type="tel"
                        required={false}
                        register={register} 
                        error={errors.mobileNumber} 
                    />
                </div>
            </div>

            <button 
              type="submit" 
              disabled={signupMutation.isPending} 
              className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-md text-sm font-bold transition flex justify-center items-center gap-2 mt-3 shadow-sm"
            >
              {signupMutation.isPending && <Loader2 className="animate-spin" size={16} />} 
              Create Account
            </button>
        </form>

        {/* Separator */}
        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
               <span className="bg-white px-2 text-gray-500">or</span>
            </div>
        </div>

        {/* Smaller Social Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 pb-4">
            <SocialButton icon={<GoogleIcon />} text="Google" />
            <SocialButton icon={<AppleIcon />} text="Apple" />
            <SocialButton icon={<FacebookIcon />} text="Facebook" />
            <SocialButton icon={<Mail size={16} />} text="Email" />
        </div>
      </div>

      {/* --- 3. FIXED FOOTER --- */}
      {/* flex-shrink-0 guarantees this never disappears */}
      <div className="p-3 bg-white border-t border-gray-100 text-center text-xs text-gray-600 flex-shrink-0 z-20">
        <p>
            Already have an account?{" "}
            <span 
                onClick={toggleView} 
                className="text-pink-600 font-bold cursor-pointer hover:underline"
            >
                Log In
            </span>
        </p>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function SocialButton({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <button type="button" className="w-full flex items-center justify-center gap-2 border border-gray-400 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-900 transition group px-2">
      <div className="w-4 h-4 flex-shrink-0 text-gray-900 group-hover:text-black">
        {icon}
      </div>
      <span className="text-xs font-semibold text-gray-700 group-hover:text-black truncate">
        {text}
      </span>
    </button>
  );
}

// --- ICONS (Same as before) ---
const GoogleIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s2.57-1.29 4.36-.65c.61.22 1.15.55 1.6.96-3.6 1.76-2.99 6.27.65 7.64-.67 1.62-1.23 2.92-1.69 4.28zm-2.22-14.8c.84-1.33.62-2.73.57-2.92-1.39.06-2.9.96-3.69 2.05-.72.96-.86 2.37-.58 2.88 1.54.12 2.87-.71 3.7-2.01z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-full h-full" fill="#1877F2" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);