"use client";

import RequireAuth from "@/components/authentication/RequireAuth";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <main className="w-full">
            {children}
        </main>
      </div>
    </RequireAuth>
  );
}