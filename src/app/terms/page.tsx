import type { Metadata } from "next";
import Link from "next/link";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import LandingFooter from "@/features/landing/components/sections/LandingFooter";
import { FileText, ArrowLeft, Shield, CheckCircle, Scale, CreditCard, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | FoxPassport",
  description:
    "Terms of Service and The Republic Charter governing your use of FoxPassport, bookings, venue reservations, and community conduct.",
  openGraph: {
    title: "Terms of Service | FoxPassport",
    description: "The Republic Charter governing your use of FoxPassport.",
    url: "https://foxpassport.com/terms",
    type: "website",
  },
};

const EFFECTIVE_DATE = "January 1, 2026";
const LAST_UPDATED = "October 1, 2026";

function Clause({
  num,
  title,
  icon: Icon,
  children,
}: {
  num: number;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-28 mb-10 sm:mb-14">
      <div className="flex items-center gap-3 mb-3">
        {Icon ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#ccff00]">
            <Icon className="h-4 w-4" />
          </div>
        ) : (
          <span className="font-mono text-xs text-[#ccff00] px-2 py-0.5 rounded bg-[#ccff00]/10 border border-[#ccff00]/20">
            §{num}
          </span>
        )}
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-display">
          §{num}. {title}
        </h2>
      </div>
      <div className="space-y-3 text-sm sm:text-base leading-relaxed text-gray-300">
        {children}
      </div>
    </section>
  );
}

export default function TermsOfServicePage() {
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
          <span className="text-xs text-gray-400">Legal</span>
          <span className="text-gray-600">/</span>
          <span className="text-xs text-gray-400">Terms of Service</span>
        </div>

        {/* Hero Section */}
        <div className="border-b border-white/10 pb-8 sm:pb-12 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-xs font-semibold uppercase tracking-wider mb-4">
            <Scale className="h-3.5 w-3.5" />
            The Republic Charter
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            These terms form a legally binding agreement between you and Fox Passport Republic, Inc.
            Please read them carefully before creating an account or making bookings.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500 font-mono">
            <span>Version 1.0</span>
            <span>&bull;</span>
            <span>Effective: {EFFECTIVE_DATE}</span>
            <span>&bull;</span>
            <span>Last updated: {LAST_UPDATED}</span>
            <span>&bull;</span>
            <Link href="/privacy" className="text-[#ccff00] hover:underline">
              Privacy Policy &rarr;
            </Link>
          </div>
        </div>

        {/* Introduction Box */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-md mb-12">
          <p className="text-sm sm:text-base leading-relaxed text-gray-300">
            Welcome to FoxPassport. By accessing our platform via web, mobile application, or API, you
            agree to comply with and be bound by the following Terms of Service. If you do not agree to
            these terms, you may not access or use the Service.
          </p>
        </div>

        {/* Clause 1 */}
        <Clause num={1} title="What the Republic Is" icon={Shield}>
          <p>
            Fox Passport Republic, Inc. (&ldquo;the Republic,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) operates a
            marketplace and social platform connecting Citizens booking venues, gear, and services with Foxers
            &mdash; independent hosts registered under one or more roles: Venue Foxer, Event Foxer, Gear Foxer,
            Service Foxer, or Investor. By creating an account you agree to these Terms, regardless of which role
            you hold.
          </p>
        </Clause>

        {/* Clause 2 */}
        <Clause num={2} title="Your Passport & Progression" icon={CheckCircle}>
          <p>
            Every account is issued a <strong className="text-white">Passport</strong>: a digital record of paths,
            XP, badges, and event stamps earned through completed bookings and community participation.
            Passport progress is personal, non-transferable, and holds no cash or monetary value. We reserve the
            right to adjust XP or revoke badges awarded in technical error, but never as an arbitrary substitute for
            a refund determination, which is strictly governed under §6.
          </p>
        </Clause>

        {/* Clause 3 */}
        <Clause num={3} title="Bookings & Bidding" icon={FileText}>
          <p>
            A booking request submitted through a venue, asset, or service listing is an offer. It becomes a binding,
            confirmed booking only when the host Foxer explicitly accepts it or, for instant-book listings, when
            checkout successfully completes.
          </p>
          <p>
            Event Service Bids and Event Asset Bids submitted against a published Event Template expire automatically
            if not accepted within the specified offer window.
          </p>
        </Clause>

        {/* Clause 4 */}
        <Clause num={4} title="Payments, Fees & Invoices" icon={CreditCard}>
          <p>
            All charges are collected into a single Invoice per checkout, inclusive of applicable taxes and any
            platform fee clearly disclosed prior to payment. Payments are processed by certified third-party payment
            gateways (including Stripe); FoxPassport never stores or has access to your full credit or debit card number.
          </p>
          <p>
            Payouts to Foxers and venue hosts are released on the schedule shown in their dashboard, net of the
            applicable platform fee in effect at booking confirmation.
          </p>
        </Clause>

        {/* Clause 5 */}
        <Clause num={5} title="Partnerships & Sponsorships">
          <p>
            Partner accounts may submit Partnership Proposals &mdash; investment, sponsorship, resource contribution,
            or co-marketing partnerships &mdash; against published events or venues. A proposal remains non-binding
            until both parties formally confirm terms outside the expiring-offer window.
          </p>
        </Clause>

        {/* Clause 6 */}
        <Clause num={6} title="Cancellations & Refunds" icon={RefreshCw}>
          <p>
            Refund eligibility strictly follows the cancellation policy attached to the listing at the time of
            booking. Disputed transactions are reviewed by Republic Secretariat staff, whose determination is
            binding for platform-fee purposes and does not limit your statutory rights under applicable consumer
            protection law.
          </p>
        </Clause>

        {/* Clause 7 */}
        <Clause num={7} title="Community Conduct on the Republic Feed">
          <p>
            Posts, comments, and media shared on the Republic Feed are public by default unless marked with limited
            visibility at publication. We reserve the right to remove prohibited content or suspend posting privileges
            for harassment, hate speech, fraudulent claims, or repeated false reporting.
          </p>
        </Clause>

        {/* Clause 8 */}
        <Clause num={8} title="Changes to These Terms">
          <p>
            We will notify active account holders at least fourteen (14) calendar days before any material changes to
            these Terms take effect. Continued use of FoxPassport after that date constitutes your acceptance of the
            revised Terms. If you do not agree with the updates, you may close your account without penalty prior to
            the effective date.
          </p>
        </Clause>

        {/* Contact info */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center mt-12">
          <p className="text-sm text-gray-300">
            Questions regarding these Terms? Contact us at{" "}
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
