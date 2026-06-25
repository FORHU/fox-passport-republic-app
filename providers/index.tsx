"use client";

import QueryProvider from "./QueryProvider";
import { AuthStoreProvider } from "./AuthStoreProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthStoreProvider>
        {children}
      </AuthStoreProvider>
    </QueryProvider>
  );
}