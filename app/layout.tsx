import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/src/components/Navbar"; 
import Footer from "@/src/components/Footer";

export const metadata: Metadata = {
  title: "FoxPassport - Yelp Clone",
  description: "Find the best businesses in town",
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