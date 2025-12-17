"use client";

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { useLogin } from '@/src/hooks/useAuth';
import { loginSchema, LoginFormData } from '@/src/lib/schema';
import { AuthInput } from './AuthInput';

export default function LoginForm() {
  const loginMutation = useLogin();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onLogin: SubmitHandler<LoginFormData> = (data) => loginMutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
      {/* UPDATED FIELD: Username instead of Email */}
      <AuthInput 
        label="Username" 
        name="username" 
        type="text" 
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

      <button 
        type="submit" 
        disabled={loginMutation.isPending} 
        className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-md text-sm font-bold transition flex justify-center items-center gap-2 mt-2 shadow-sm"
      >
        {loginMutation.isPending && <Loader2 className="animate-spin" size={18} />} 
        Log In
      </button>
    </form>
  );
}