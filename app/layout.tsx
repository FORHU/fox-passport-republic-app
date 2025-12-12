import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/src/components/Navbar"; 
import Footer from "@/src/components/Footer";

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
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}