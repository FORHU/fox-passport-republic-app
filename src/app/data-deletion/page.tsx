import type { Metadata } from "next";
import Link from "next/link";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import LandingFooter from "@/features/landing/components/sections/LandingFooter";
import { Trash2, ArrowLeft, ShieldCheck, Mail, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Data Deletion Instructions | FoxPassport",
  description:
    "Step-by-step instructions on how to request the deletion of your account and personal data from FoxPassport, including Meta/Facebook and Google platform data.",
  openGraph: {
    title: "Data Deletion Instructions | FoxPassport",
    description:
      "How to request deletion of your FoxPassport account and Meta/Google platform data.",
    url: "https://foxpassport.com/data-deletion",
    type: "website",
  },
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-[#070709] text-gray-200 antialiased selection:bg-[#ccff00] selection:text-black">
      {/* Navigation Header */}
      <LandingHeader />

      {/* Main Content Area */}
      <main className="relative pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#ccff00] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
          <span className="text-gray-600">/</span>
          <Link
            href="/privacy"
            className="text-xs text-gray-400 hover:text-[#ccff00] transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-xs text-gray-400">Data Deletion</span>
        </div>

        {/* Hero Section */}
        <div className="border-b border-white/10 pb-8 sm:pb-12 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-xs font-semibold uppercase tracking-wider mb-4">
            <Trash2 className="h-3.5 w-3.5" />
            User Data Controls
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display mb-4">
            Data Deletion Instructions
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            In compliance with Meta Platform Terms, Google API Services User Data Policy, and the
            Philippine Data Privacy Act of 2012, FoxPassport provides transparent instructions on
            how to request the deletion of your account and personal data.
          </p>
        </div>

        {/* Method 1: Email Request */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#ccff00]">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
              1. Direct Account &amp; Data Deletion Request
            </h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-md space-y-4 text-sm sm:text-base leading-relaxed text-gray-300">
            <p>
              You may request complete erasure of your FoxPassport account, profile information, and
              associated records at any time:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                Send an email to{" "}
                <a
                  href="mailto:support@foxpassport.com?subject=Data%20Deletion%20Request"
                  className="font-semibold text-[#ccff00] hover:underline"
                >
                  support@foxpassport.com
                </a>{" "}
                using the email address registered with your FoxPassport account.
              </li>
              <li>
                Include the subject line:{" "}
                <strong className="text-white">&ldquo;Data Deletion Request&rdquo;</strong>.
              </li>
              <li>
                Our data protection team will verify your identity to ensure unauthorized parties cannot
                request deletion on your behalf.
              </li>
              <li>
                Once verified, your account, personal data, and login credentials will be permanently
                purged from our active databases within thirty (30) calendar days. A confirmation receipt
                will be sent to your email.
              </li>
            </ol>
          </div>
        </section>

        {/* Method 2: Meta / Facebook User Data Deletion */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/30 text-[#1877F2]">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
              2. Removing FoxPassport via Facebook / Meta Settings
            </h2>
          </div>
          <div className="rounded-2xl border border-[#1877F2]/20 bg-[#1877F2]/[0.03] p-6 sm:p-8 space-y-4 text-sm sm:text-base leading-relaxed text-gray-300">
            <p>
              If you used Facebook Login to connect with FoxPassport and want to revoke our application&rsquo;s
              access to your Facebook profile:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                Log in to your Facebook account and navigate to{" "}
                <strong className="text-white">Settings &amp; Privacy &rarr; Settings</strong>.
              </li>
              <li>
                In the left-hand menu, select{" "}
                <strong className="text-white">Apps and Websites</strong> to view services linked to your
                Facebook profile.
              </li>
              <li>
                Locate <strong className="text-white">FoxPassport</strong> in the active list.
              </li>
              <li>
                Click <strong className="text-white">Remove</strong>.
              </li>
              <li>
                To also purge historical identity tokens stored in FoxPassport databases, send a note with
                subject <strong className="text-white">&ldquo;Meta Data Deletion Request&rdquo;</strong> to{" "}
                <a
                  href="mailto:support@foxpassport.com?subject=Meta%20Data%20Deletion%20Request"
                  className="font-semibold text-[#ccff00] hover:underline"
                >
                  support@foxpassport.com
                </a>
                .
              </li>
            </ol>
          </div>
        </section>

        {/* Method 3: Google Account Disconnection */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#ccff00]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
              3. Disconnecting Google Sign-In
            </h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-3 text-sm sm:text-base leading-relaxed text-gray-300">
            <p>
              To revoke access granted via Google Sign-In, visit your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#ccff00] hover:underline"
              >
                Google Account Third-Party Permissions
              </a>{" "}
              dashboard and remove FoxPassport.
            </p>
          </div>
        </section>

        {/* What Is Retained */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display mb-4">
            Financial &amp; Legal Retention Exceptions
          </h2>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-3 text-sm sm:text-base leading-relaxed text-gray-300">
            <p>
              Certain transaction records (such as completed booking payments, invoices, and payouts) must
              be retained for the statutory period required under Philippine commercial, accounting, and tax
              laws. When this applies:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All direct personal identifiers are unlinked or anonymized where permitted.</li>
              <li>Only the minimal financial audit records required by law are preserved.</li>
              <li>The retained records are securely archived and never repurposed for marketing.</li>
            </ul>
          </div>
        </section>

        {/* Questions */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <p className="text-sm text-gray-300">
            Need assistance or have questions regarding data privacy? Contact our Data Privacy Officer at{" "}
            <a
              href="mailto:support@foxpassport.com"
              className="text-[#ccff00] font-semibold hover:underline"
            >
              support@foxpassport.com
            </a>
            .
          </p>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
