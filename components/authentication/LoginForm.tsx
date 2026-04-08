'use client';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react'; 

import { useLogin } from '@/hooks/auth/useAuth';
import { loginSchema, LoginFormData } from '@/lib/schema';
import { useAuthStore } from '@/store/useAuthStore';

// Social buttons component (inline for simplicity or extracted if reused)
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

export default function LoginForm() {
  const loginMutation = useLogin();
  const { toggleView } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange"
  });

  React.useEffect(() => {
    reset();
  }, [reset]);

  const onLogin: SubmitHandler<LoginFormData> = (data) => loginMutation.mutate(data);

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#ccff00] to-green-500 text-black shadow-[0_0_20px_rgba(204,255,0,0.3)] rotate-3 hover:rotate-12 transition-transform duration-500">
          <span className="material-symbols-outlined text-[32px]">waving_hand</span>
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">
          Vibe <span className="text-[#ccff00]">Check In</span>
        </h2>
        <p className="text-gray-400 text-sm">Unlock your core memories. Enter the portal.</p>
      </div>

      {/* Social Button */}
      <SocialButtons />

      {/* Divider */}
      <div className="relative flex py-2 items-center mb-6">
        <div className="grow border-t border-white/10"></div>
        <span className="shrink-0 mx-4 text-xs font-medium text-white/30 uppercase tracking-widest">Or use email</span>
        <div className="grow border-t border-white/10"></div>
      </div>

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit(onLogin)}>
        
        {/* Username/Email Field */}
        <div className="space-y-1">
          <label className="sr-only" htmlFor="email">Email</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-[#ccff00] transition-colors">
              <span className="material-symbols-outlined text-[20px]">alternate_email</span>
            </div>
            <input 
              {...register('username')}
              className="block w-full rounded-2xl bg-black/30 border border-white/10 pl-11 pr-4 py-3.5 text-white placeholder-white/30 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] sm:text-sm transition-all hover:border-white/20 outline-none" 
              id="email" 
              placeholder="foxer@example.com" 
              type="text" // Using text to allow username or email
            />
          </div>
          {errors.username && <span className="text-xs text-red-500 pl-1">{errors.username.message}</span>}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label className="sr-only" htmlFor="password">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-[#ccff00] transition-colors">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <input 
              {...register('password')}
              className="block w-full rounded-2xl bg-black/30 border border-white/10 pl-11 pr-12 py-3.5 text-white placeholder-white/30 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] sm:text-sm transition-all hover:border-white/20 outline-none" 
              id="password" 
              placeholder="••••••••" 
              type={showPassword ? "text" : "password"} 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.password && <span className="text-xs text-red-500 pl-1">{errors.password.message}</span>}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#ccff00] focus:ring-[#ccff00] focus:ring-offset-0 transition-colors" type="checkbox" />
            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Remember me</span>
          </label>
          <a className="text-xs font-bold text-[#ccff00] hover:text-white hover:underline decoration-[#ccff00] underline-offset-4 transition-all" href="#">Forgot password?</a>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={loginMutation.isPending}
          className="relative w-full overflow-hidden rounded-xl bg-[#ccff00] py-4 text-sm font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? (
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin w-5 h-5" />
              Processing...
            </span>
          ) : (
            <>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Log In
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-white/30 transition-transform duration-300 ease-out skew-x-12"></div>
            </>
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="relative z-10 mt-8 text-center">
        <p className="text-sm text-gray-400">
          New to FoxPassport?{' '}
          <button onClick={toggleView} className="font-bold text-white hover:text-[#ccff00] transition-colors relative inline-block group">
            Create an account
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ccff00] transition-all group-hover:w-full"></span>
          </button>
        </p>
      </div>
    </div>
  );
}