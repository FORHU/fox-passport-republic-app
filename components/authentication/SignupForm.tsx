"use client";

import React from 'react';
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react'; 

import { useSignup } from '@/hooks/auth/useAuth';
import { signupSchema, SignupFormData } from '@/lib/schema';
import { useAuthStore } from '@/store/useAuthStore';

import {toast} from 'sonner';

// Social buttons component
const SocialButtons = () => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <button type="button" className="group flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white hover:text-black hover:border-white transition-all duration-300">
      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"></path>
        <path d="M12.24 24.0008C15.4765 24.0008 18.2058 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z" fill="#34A853"></path>
        <path d="M5.50255 14.3003C5.00236 12.8099 5.00236 11.1961 5.50255 9.70575V6.61481H1.5166C-0.18551 10.0056 -0.18551 14.0004 1.5166 17.3912L5.50255 14.3003Z" fill="#FBBC05"></path>
        <path d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61049L5.50255 9.70143C6.45046 6.86181 9.10938 4.74966 12.24 4.74966Z" fill="#EA4335"></path>
      </svg>
      <span className="font-bold text-sm">Google</span>
    </button>
    <button type="button" className="group flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300">
      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path className="group-hover:fill-white transition-colors" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.563H7.078V12.073H10.125V9.429C10.125 6.423 11.916 4.761 14.656 4.761C15.968 4.761 17.344 4.995 17.344 4.995V7.948H15.83C14.34 7.948 13.875 8.873 13.875 9.822V12.073H17.203L16.671 15.563H13.875V24C19.612 23.094 24 18.1 24 12.073Z" fill="#1877F2"></path>
      </svg>
      <span className="font-bold text-sm">Facebook</span>
    </button>
  </div>
);

export default function SignupForm() {
  const signupMutation = useSignup();
  const { toggleView } = useAuthStore();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange"
  });

  React.useEffect(() => {
    reset();
  }, [reset]);

  const onSignup: SubmitHandler<SignupFormData> = (data) => signupMutation.mutate(data)

  const onInvalid = (formErrors: FieldErrors<SignupFormData>) => {
  if (formErrors.email) {
    toast.error(formErrors.email.message ?? 'Invalid email address');
  } else if (formErrors.password) {
    toast.error(formErrors.password.message ?? 'Password must be at least 6 characters long');
  }
};

  return (
    <div className="animate-in fade-in slide-in-from-left-8 duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">Join the <span className="text-gradient-lime">Hype</span></h2>
        <p className="text-gray-400 text-sm">Unlock exclusive events and meet your crew.</p>
      </div>

      <SocialButtons />

      <div className="relative flex py-2 items-center mb-6">
        <div className="grow border-t border-white/10"></div>
        <span className="shrink-0 mx-4 text-xs font-medium text-white/30 uppercase tracking-widest">Or sign up with email</span>
        <div className="grow border-t border-white/10"></div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSignup,  onInvalid)}>
        {/* Full Name */}
        <div className="group">
          <label className="block text-xs font-bold text-white/70 mb-1.5 ml-1 group-focus-within:text-[#ccff00] transition-colors">FULL NAME</label>
          <input 
            {...register('name')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#ccff00] focus:border-[#ccff00]/50 focus:bg-white/10 transition-all font-medium" 
            placeholder="e.g. Fox Mulder" 
            type="text" 
          />
          {errors.name && <span className="text-xs text-red-500 ml-1">{errors.name.message}</span>}
        </div>

        {/* Email Address */}
        <div className="group">
          <label className="block text-xs font-bold text-white/70 mb-1.5 ml-1 group-focus-within:text-[#ccff00] transition-colors">EMAIL ADDRESS</label>
          <input 
            {...register('email')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#ccff00] focus:border-[#ccff00]/50 focus:bg-white/10 transition-all font-medium" 
            placeholder="name@example.com" 
            type="email" 
          />
          {errors.email && <span className="text-xs text-red-500 ml-1">{errors.email.message}</span>}
        </div>

        {/* Username */}
        <div className="group">
          <label className="block text-xs font-bold text-white/70 mb-1.5 ml-1 group-focus-within:text-[#ccff00] transition-colors">USERNAME</label>
          <input 
            {...register('username')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#ccff00] focus:border-[#ccff00]/50 focus:bg-white/10 transition-all font-medium" 
            placeholder="fox_mulder" 
            type="text" 
          />
           {errors.username && <span className="text-xs text-red-500 ml-1">{errors.username.message}</span>}
        </div>

        {/* Password */}
        <div className="group">
          <label className="block text-xs font-bold text-white/70 mb-1.5 ml-1 group-focus-within:text-[#ccff00] transition-colors">PASSWORD</label>
          <input 
            {...register('password')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#ccff00] focus:border-[#ccff00]/50 focus:bg-white/10 transition-all font-medium" 
            placeholder="••••••••" 
            type="password" 
          />
          {errors.password && <span className="text-xs text-red-500 ml-1">{errors.password.message}</span>}
        </div>

        {/* Terms */}
        <div className="flex items-center gap-3 pt-2">
          <div className="relative flex items-center">
            <input 
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 checked:border-[#ccff00] checked:bg-[#ccff00] transition-all hover:border-[#ccff00]/50" 
              id="terms" 
              type="checkbox" 
              required
            />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
              <span className="material-symbols-outlined text-[16px] font-bold">check</span>
            </span>
          </div>
          <label className="text-xs text-gray-400 cursor-pointer select-none" htmlFor="terms">
            I agree to the <a className="text-white hover:text-[#ccff00] underline decoration-[#ccff00]/30 underline-offset-2 transition-colors" href="#">Terms of Service</a> & <a className="text-white hover:text-[#ccff00] underline decoration-[#ccff00]/30 underline-offset-2 transition-colors" href="#">Privacy Policy</a>
          </label>
        </div>

        {/* Submit Button */}
        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={signupMutation.isPending}
          className="btn-neon w-full py-4 mt-2 rounded-xl bg-[#ccff00] text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed text-center relative overflow-hidden"
        >
          {signupMutation.isPending ? (
             <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Sign Up
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-white/30 transition-transform duration-300 ease-out skew-x-12"></div>
            </>
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-400">
          Already have an account?{' '}
          <button onClick={toggleView} className="font-bold text-white hover:text-[#ccff00] transition-colors relative inline-block group">
            Log in
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ccff00] transition-all group-hover:w-full"></span>
          </button>
        </p>
      </div>
    </div>
  );
}