import type { Metadata } from "next";
import AppHandoff from "../_components/AppHandoff";

export const metadata: Metadata = {
  title: "Back to FoxPassport",
  robots: { index: false, follow: false },
};

/**
 * Stripe's `refresh_url` for payout setup started in the mobile app: the
 * single-use link expired, so the app opens a new one.
 */
export default function StripeAppRefreshPage() {
  return <AppHandoff step="refresh" />;
}
