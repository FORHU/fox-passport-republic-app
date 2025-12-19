import type { Metadata } from "next";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./globals.css";
import Footer from "@/src/components/Footer";
import { Toaster } from 'sonner';

// Import the Modal Component
import AuthModal from "@/src/components/AuthModal"; 

// Import the Master Provider
import Providers from "@/src/providers"; 

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
    <html lang="en">
      <body className="antialiased text-gray-900 bg-white flex flex-col min-h-screen">
        <Providers>
          {/* 2. Add the Toaster here. 'richColors' gives you green for success/red for error automatically. */}
          <Toaster position="top-center" richColors />

          {/* 3. Your Auth Modal sits here */}
          <AuthModal />
          <main className="grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}