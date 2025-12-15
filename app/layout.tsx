import type { Metadata } from "next";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./globals.css";
import Navbar from "@/src/components/Navbar"; 
import Footer from "@/src/components/Footer";

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
      <body className="antialiased text-gray-900 bg-white">
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}