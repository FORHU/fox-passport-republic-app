import React from "react";
import CheckoutClient from "@/features/booking/components/CheckoutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout | Fox Passport Republic",
  description: "Complete your premium venue reservation securely.",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background bg-gradient-dark text-text-main font-body selection:bg-accent selection:text-black">
      <CheckoutClient />
    </div>
  );
}
