"use client";

import { useEffect, useState } from "react";
import QueryProvider from "./QueryProvider";
import { AuthStoreProvider } from "./AuthStoreProvider";
import { SocketProvider } from "./SocketProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
      import("@/shared/mocks/browser").then(({ worker }) => {
        worker.start({ onUnhandledRequest: "bypass" }).then(() => setReady(true));
      });
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return null;

  return (
    <QueryProvider>
      <AuthStoreProvider>
        <SocketProvider>{children}</SocketProvider>
      </AuthStoreProvider>
    </QueryProvider>
  );
}