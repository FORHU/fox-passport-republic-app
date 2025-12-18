"use client";

import React from 'react';
import RequireAuth from "@/src/components/auth/RequireAuth";
import Sidebar from "@/src/components/foxer/Sidebar"; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex h-screen w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}