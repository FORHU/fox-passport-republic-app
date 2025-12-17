"use client";

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { useSignup } from '@/src/hooks/useAuth';
import { signupSchema, SignupFormData } from '@/src/lib/schema';
import { AuthInput } from './AuthInput';

export default function SignupForm() {
  const signupMutation = useSignup();
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  const onSignup: SubmitHandler<SignupFormData> = (data) => signupMutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSignup)} className="space-y-3">
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
      
      <div className="pt-2 border-t border-gray-100 mt-2">
         <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Optional Details</p>
         <div className="space-y-3">
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
        className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-md text-sm font-bold transition flex justify-center items-center gap-2 mt-4 shadow-sm"
      >
        {signupMutation.isPending && <Loader2 className="animate-spin" size={18} />} 
        Create Account
      </button>
    </form>
  );
}