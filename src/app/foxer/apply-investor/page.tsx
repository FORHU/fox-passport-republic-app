import React from "react";
import InvestorApplicationClient from "@/features/role-application/components/InvestorApplicationClient";
import { Metadata } from "next";
import { requireAuth } from "@/shared/lib/server/auth";

export const metadata: Metadata = {
  title: "Apply to be a Partner Foxer",
  description:
    "Apply to become an authorized Investor (Partner Foxer) on FoxPassport.",
};

export default async function InvestorApplicationPage() {
  await requireAuth();
  return <InvestorApplicationClient />;
}
