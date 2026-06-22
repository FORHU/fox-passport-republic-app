import type { Metadata } from "next";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./globals.css";
import { Toaster } from 'sonner';

// Import the Modal Component
import AuthModal from "@/features/auth/components/AuthModal"; 

// Import the Master Provider
import Providers from "@/shared/providers";

export const metadata: Metadata = {
  title: "FoxPassport - Let's Make Life an Event",
  description: "FoxPassport returns the power of Happiness & Experience to You",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-body text-text-main bg-background overflow-x-hidden flex flex-col min-h-screen bg-gradient-dark">
        <Providers>
          {/* 2. Add the Toaster here. 'richColors' gives you green for success/red for error automatically. */}
          <Toaster position="top-center" richColors />

          {/* 3. Your Auth Modal sits here */}
          <AuthModal />
          <main className="grow">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}