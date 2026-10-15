"use client";

import { useEffect, useState } from "react";
import QueryProvider from "./QueryProvider";
import { AuthStoreProvider } from "./AuthStoreProvider";
import { SocketProvider } from "./SocketProvider";
import { CurrencyProvider } from "./CurrencyProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(
    process.env.NEXT_PUBLIC_API_MOCKING !== "enabled",
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
      import("@/shared/mocks/browser").then(({ worker }) => {
        worker
          .start({ onUnhandledRequest: "bypass" })
          .then(() => setReady(true));
      });
    }
  }, []);

  if (!ready) return null;

  return (
    <QueryProvider>
      <AuthStoreProvider>
        <CurrencyProvider>
          <SocketProvider>{children}</SocketProvider>
        </CurrencyProvider>
      </AuthStoreProvider>
    </QueryProvider>
  );
}
