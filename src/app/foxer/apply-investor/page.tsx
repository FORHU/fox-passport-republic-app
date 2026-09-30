import React from "react";
import InvestorApplicationClient from "@/features/role-application/components/InvestorApplicationClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply to be a Partner Foxer | FoxPassport",
  description:
    "Apply to become an authorized Investor (Partner Foxer) on FoxPassport.",
};

export default function InvestorApplicationPage() {
  return <InvestorApplicationClient />;
}
