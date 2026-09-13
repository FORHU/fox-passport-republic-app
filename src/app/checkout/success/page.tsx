import React, { Suspense } from "react";
import { CheckoutSuccessRouter } from "@/features/booking/components/CheckoutSuccessRouter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Confirmed | FoxPassport",
  description: "Your premium venue reservation has been confirmed.",
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessRouter />
    </Suspense>
  );
}
