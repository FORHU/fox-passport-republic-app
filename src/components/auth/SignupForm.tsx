"use client";

import React from 'react';
import Image from 'next/image'; 
import { useForm, SubmitHandler, UseFormRegister, FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, X } from 'lucide-react'; 

import { useSignup } from '@/src/hooks/useAuth';
import { signupSchema, SignupFormData } from '@/src/lib/schema';
import { useAuthStore } from '@/src/store/useAuthStore';

// Responsive Input - compact on mobile, matching social buttons on desktop
interface CompactInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
}

const CompactInput = ({ label, error, register, name, type = "text", required = true, ...props }: CompactInputProps) => (
  <div className="flex flex-col gap-0.5">
    <label className="text-[8px] md:text-[10px] font-bold uppercase text-gray-500 tracking-wide">
      {label} {!required && <span className="text-gray-400 font-normal normal-case">(Optional)</span>}
    </label>
    <input
      type={type}
      {...register(name)}
      {...props}
      className={`w-full px-2 md:px-3 text-xs md:text-sm bg-gray-50 text-gray-900 border rounded md:rounded-lg focus:ring-1 focus:ring-pink-500 focus:outline-none focus:bg-white transition h-6 md:h-8 ${
        error ? 'border-red-500' : 'border-gray-200'
      }`}
    />
    {error && <span className="text-[8px] md:text-[10px] text-red-500">{error.message}</span>}
  </div>
);

export default function SignupForm() {
  const signupMutation = useSignup();
  const { toggleView, close } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  const onSignup: SubmitHandler<SignupFormData> = (data) => signupMutation.mutate(data);

  return (
    <div className="flex flex-col h-full w-full bg-white">
      
      {/* --- HEADER --- */}
      <div className="relative px-3 md:px-5 pt-2 md:pt-4 pb-1 md:pb-2 text-center flex-shrink-0 bg-white">
        <button 
          onClick={close} 
          className="absolute top-1 md:top-3 right-1.5 md:right-3 p-1 md:p-1.5 hover:bg-gray-100 rounded-full transition text-gray-500"
        >
          <X className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
        </button>
        <div className="flex flex-col items-center">
            <div className="relative w-7 h-7 md:w-10 md:h-10 mb-0.5 md:mb-1">
               <Image 
                 src="/logofoxpassport.png" 
                 alt="FoxPassport Logo" 
                 fill
                 className="object-contain"
                 priority
               />
            </div>
            <h2 className="text-xs md:text-base font-bold text-gray-800">
              Sign up for FoxPassport
            </h2>
            <p className="text-[7px] md:text-[9px] text-gray-500 mt-0.5 max-w-[160px] md:max-w-[220px] mx-auto leading-tight">
              By continuing, you agree to FoxPassport's{' '}
              <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
        </div>
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 md:px-5 py-1 md:py-2 custom-scrollbar">
        <form onSubmit={handleSubmit(onSignup)} className="space-y-1 md:space-y-1.5">
            <CompactInput label="Email" name="email" type="email" register={register} error={errors.email} />
            <CompactInput label="Username" name="username" register={register} error={errors.username} />
            <CompactInput label="Password" name="password" type="password" register={register} error={errors.password} />
            
            {/* Optional Section */}
            <div className="pt-1 md:pt-1.5 border-t border-gray-100 mt-0.5 md:mt-1">
                <p className="text-[7px] md:text-[8px] font-bold text-gray-400 uppercase mb-0.5">Optional Details</p>
                <div className="space-y-1 md:space-y-1.5">
                    <CompactInput label="Full Name" name="name" required={false} register={register} error={errors.name} />
                    <CompactInput label="Mobile Number" name="mobileNumber" type="tel" required={false} register={register} error={errors.mobileNumber} />
                </div>
            </div>

            <button 
              type="submit" 
              disabled={signupMutation.isPending} 
              className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded md:rounded-lg text-[10px] md:text-xs font-bold transition flex justify-center items-center gap-1 md:gap-2 mt-1.5 md:mt-2 shadow-sm h-7 md:h-9"
            >
              {signupMutation.isPending && <Loader2 className="animate-spin w-3 h-3 md:w-4 md:h-4" />} 
              Create Account
            </button>
        </form>

        {/* Separator */}
        <div className="relative my-1.5 md:my-3">
            <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-[7px] md:text-[9px] uppercase">
               <span className="bg-white px-2 text-gray-500">or</span>
            </div>
        </div>

        {/* Social Buttons - same height as inputs */}
        <div className="grid grid-cols-2 gap-1 md:gap-1.5 pb-1 md:pb-2">
            <SocialButton icon={<GoogleIcon />} text="Google" />
            <SocialButton icon={<AppleIcon />} text="Apple" />
            <SocialButton icon={<FacebookIcon />} text="Facebook" />
            <SocialButton icon={<Mail className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />} text="Email" />
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="py-1.5 md:py-2 px-3 md:px-5 bg-white border-t border-gray-100 text-center text-[10px] md:text-xs text-gray-600 flex-shrink-0">
        <p>
            Already have an account?{" "}
            <span onClick={toggleView} className="text-pink-600 font-bold cursor-pointer hover:underline">
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
    <button type="button" className="w-full flex items-center justify-center gap-1 md:gap-2 border border-gray-300 rounded md:rounded-lg hover:bg-gray-50 hover:border-gray-400 transition group px-1.5 md:px-2 h-6 md:h-8">
      <div className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 text-gray-900">
        {icon}
      </div>
      <span className="text-[9px] md:text-xs font-semibold text-gray-700">
        {text}
      </span>
    </button>
  );
}

// --- ICONS ---
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