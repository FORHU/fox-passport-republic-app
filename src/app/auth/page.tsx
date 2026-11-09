import type { Metadata } from "next";
import AuthPageClient from "./_components/AuthPageClient";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in or create your FoxPassport account.",
};

export default function AuthPage() {
  return <AuthPageClient />;
}
