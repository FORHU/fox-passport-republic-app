"use client";

import RequireAuth from "@/src/components/auth/RequireAuth";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        {/* You can add a Sidebar or TopNav specific to logged in users here */}
        <main className="w-full">
            {children}
        </main>
      </div>
    </RequireAuth>
  );
}