import { Suspense } from "react";
import type { Metadata } from "next";
import { VerificationClient } from "./_components/VerificationClient";

export const metadata: Metadata = {
  title: "Verification | Fox Passport Republic",
  description:
    "Verify your email to book, verify your ID for a Verified badge, and track the documents on your role applications.",
};

// Replaced a static mock (hardcoded "Verified" / "In Review" rows on mobile,
// "verify from your role application" on desktop) that every booking was
// redirected to — a dead end for anyone not applying for a role.
export default function KYCPage() {
  return (
    <Suspense fallback={null}>
      <VerificationClient />
    </Suspense>
  );
}
