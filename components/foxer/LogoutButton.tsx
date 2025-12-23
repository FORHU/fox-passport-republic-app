"use client";

import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore'; 
import { toast } from 'sonner';

export default function LogoutButton() {
  const router = useRouter();
  const { user, logout } = useAuthStore(); 

  const handleLogout = () => {
    logout(); 
    toast.success("Logged out successfully");
    router.push('/'); 
  };

  // If not logged in, don't render anything
  if (!user) return null;

  return (
    <div className="space-y-2 w-full">
      {/* User Info Card */}
      <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg mx-2">
        <div className="p-1 bg-white rounded-full shadow-sm">
           <User className="h-4 w-4 text-gray-500" />
        </div>
        <div className="flex flex-col overflow-hidden">
            <span className="font-medium text-gray-900 truncate">{user.username}</span>
            <span className="text-xs text-gray-500 truncate">{user.email}</span>
        </div>
      </div>

      {/* The Actual Button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors rounded-md"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );
}