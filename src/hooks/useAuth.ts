"use client";

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner'; 
import { useAuthStore } from '../store/useAuthStore';
import { LoginFormData, SignupFormData } from '../lib/schema';

// --- AXIOS SETUP ---
const api = axios.create({
  baseURL: 'http://localhost:3002/api', 
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- API FUNCTIONS ---

const realLogin = async (data: LoginFormData) => {
  const payload = {
    username: data.username, 
    password: data.password
  };
  const response = await api.post('/v1/auth/login', payload);
  return response.data;
};

const realSignup = async (data: SignupFormData) => {
  const payload = {
    ...data,
    name: data.name || undefined,
    mobileNumber: data.mobileNumber || undefined,
  };
  const response = await api.post('/v1/auth/register', payload);
  return response.data;
};

// --- HOOKS ---

export const useLogin = () => {
  const router = useRouter();
  const { login } = useAuthStore(); 

  return useMutation({
    mutationFn: realLogin,
    onSuccess: (data) => {
      console.log("Login Success:", data);
      
      // Save user to store
      login(data.user || data); 

      toast.success("Welcome back!");
      
      router.push('/authenticatedUser'); 
    },
    onError: (error: any) => {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || "Login Failed";
      toast.error(msg);
    },
  });
};

export const useSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: realSignup,
    onSuccess: (data) => {
      console.log("Signup Success:", data);
      
      toast.success("Thanks for signing up! You can now Log In.");
      
      setTimeout(() => {
         window.location.reload(); 
      }, 2000);
    },
    onError: (error: any) => {
      console.error("Signup Error:", error);
      const msg = error.response?.data?.message || "Signup Failed";
      toast.error(msg);
    },
  });
};