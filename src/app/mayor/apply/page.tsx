import React from "react";
import MayorApplicationClient from "@/features/role-application/components/MayorApplicationClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Apply to be a Venue Foxer | FoxPassport',
  description: 'Apply to become an authorized Space Provider (Venue Foxer) on FoxPassport.',
};

export default function MayorApplicationPage() {
  return <MayorApplicationClient />;
}
