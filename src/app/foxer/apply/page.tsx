import React from "react";
import FoxerApplicationClient from "@/features/role-application/components/FoxerApplicationClient";
import { Metadata } from "next";
import { requireAuth } from "@/shared/lib/server/auth";

export const metadata: Metadata = {
  title: "Apply to be a Foxer",
  description:
    "Apply to become an authorized Service or Equipment Provider on FoxPassport.",
};

export default async function FoxerApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  // Signed in, not a Foxer yet: this form is how someone becomes one.
  await requireAuth();
  const { type } = await searchParams;
  // Gear, Talent and Performer applications were folded into Provider; old
  // ?type=asset|service|performer links open the Provider form.
  const initialType = type === "organizer" ? "organizer" : "provider";
  // One responsive form for every screen size. There used to be a separate
  // phone version that never submitted anything.
  return <FoxerApplicationClient initialType={initialType} />;
}
