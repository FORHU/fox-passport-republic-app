"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Loader2 } from "lucide-react";

export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  const login = useAuthStore((state) => state.login);
  const setLoading = useAuthStore((state) => state.setLoading);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    const checkSession = () => {
      const storedUser = localStorage.getItem('fox_user');
      
      if (storedUser) {
        try {
            // If user exists, log them in
            login(JSON.parse(storedUser));
        } catch (e) {
            console.error("Failed to parse user", e);
        }
      } 
      
      setLoading(false);
    };

    checkSession();
  }, [login, setLoading]);

  // While checking, show the loader
  if (isLoading) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-pink-600" size={40} />
        </div>
    );
  }

  // Once done, show the app
  return <>{children}</>;
}