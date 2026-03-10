"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { LoginFormData, SignupFormData } from "@/lib/schema";
import { LoginResponse } from "@/types/auth";
import { config } from "@/lib/config";

// --- AXIOS SETUP ---
const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- REAL API FUNCTIONS ---

const realLogin = async (data: LoginFormData): Promise<LoginResponse> => {
  const payload = {
    username: data.username,
    password: data.password,
  };
  const response = await api.post<LoginResponse>("/v1/auth/login", payload);
  return response.data;
};

const realSignup = async (data: SignupFormData) => {
  const payload = {
    ...data,
    name: data.name || undefined,
    mobileNumber: data.mobileNumber || undefined,
  };
  const response = await api.post("/v1/auth/register", payload);
  return response.data;
};

// --- HOOKS ---

export const useLogin = () => {
  const router = useRouter();
  const { login, close } = useAuthStore();

  return useMutation({
    mutationFn: realLogin,
    onSuccess: (data) => {
      console.log("Login Success:", data);

      // Save user to store
      login(data);

      toast.success("Welcome back!");

      // Close modal and redirect
      close();
      router.push("/");
    },
    onError: (error: any) => {
      console.error("Login Error:", error);
      const msg =
        error.response?.data?.message ||
        "Login Failed. Please check your credentials.";
      toast.error(msg);
    },
  });
};

export const useSignup = () => {
  const { toggleView, close } = useAuthStore();

  return useMutation({
    mutationFn: realSignup,
    onSuccess: (data) => {
      console.log("Signup Success:", data);

      toast.success("Thanks for signing up! You can now Log In.");

      // Switch to login view after successful signup
      toggleView();
    },
    onError: (error: any) => {
      console.error("Signup Error:", error);
      const msg =
        error.response?.data?.message || "Signup Failed. Please try again.";
      toast.error(msg);
    },
  });
};
