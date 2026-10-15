import React, { Suspense } from "react";
import { CheckoutCancelRouter } from "@/features/booking/components/CheckoutCancelRouter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout Cancelled | FoxPassport",
  description: "Your checkout session was cancelled.",
};

export default function CheckoutCancelPage() {
  return (
    <Suspense>
      <CheckoutCancelRouter />
    </Suspense>
  );
}
