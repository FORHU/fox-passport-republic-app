"use client";

import React from 'react';
import RequireAuth from "@/src/components/auth/RequireAuth";
import Navbar from "@/src/components/foxer/Navbar";

export default function FoxerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      {/* Full height container with background color.
        Flex-col ensures the Footer pushes to the bottom.
      */}
      <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-sans">
        
        {/* Top Navigation Bar (Matches Images 1 & 2) */}
        <Navbar />

        {/* Main Content Area (Matches the full width content area) */}
        <main className="flex-1 w-full max-w-7xl mx-auto">
          {children}
        </main>
        
      </div>
    </RequireAuth>
  );
}