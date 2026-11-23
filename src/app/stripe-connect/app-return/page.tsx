import type { Metadata } from "next";
import AppHandoff from "../_components/AppHandoff";

export const metadata: Metadata = {
  title: "Back to FoxPassport",
  robots: { index: false, follow: false },
};

/** Stripe's `return_url` for payout setup started in the mobile app. */
export default function StripeAppReturnPage() {
  return <AppHandoff step="return" />;
}
