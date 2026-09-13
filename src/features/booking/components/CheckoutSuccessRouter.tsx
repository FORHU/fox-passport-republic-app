"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import CheckoutSuccessClient from "@/features/booking/components/CheckoutSuccessClient";
import MobileBookingSuccess from "@/features/booking/components/MobileBookingSuccess";
import { CentralPaymentStatusClient } from "@/shared/components/payment/CentralPaymentStatusClient";

export function CheckoutSuccessRouter() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId");

  if (invoiceId) {
    return <CentralPaymentStatusClient invoiceId={invoiceId} />;
  }

  return (
    <>
      {/* Mobile view */}
      <div className="lg:hidden">
        <MobileBookingSuccess />
      </div>
      {/* Desktop view */}
      <div className="hidden lg:block">
        <CheckoutSuccessClient />
      </div>
    </>
  );
}
