import type { Metadata } from "next";
import Link from "next/link";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import LandingFooter from "@/features/landing/components/sections/LandingFooter";
import { Shield, Lock, Eye, FileText, Trash2, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | FoxPassport",
  description:
    "Learn how FoxPassport collects, uses, protects, and manages your personal data, including Google and Meta/Facebook platform information.",
  openGraph: {
    title: "Privacy Policy | FoxPassport",
    description:
      "Learn how FoxPassport collects, uses, protects, and manages your personal data.",
    url: "https://foxpassport.com/privacy",
    type: "website",
  },
};

const LAST_UPDATED = "October 1, 2026";

function Section({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 mb-12 sm:mb-16">
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-accent">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
          {title}
        </h2>
      </div>
      <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-300">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-canvas text-gray-200 antialiased selection:bg-accent selection:text-black">
      {/* Navigation Header */}
      <LandingHeader />

      {/* Main Content Area */}
      <main className="relative pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6 flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-xs text-gray-400">Legal</span>
        </div>

        {/* Hero Section */}
        <div className="border-b border-white/10 pb-8 sm:pb-12 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
            <Shield className="h-3.5 w-3.5" />
            Legal Charter
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Fox Passport Republic, Inc. (&ldquo;FoxPassport&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is
            committed to protecting your privacy and being transparent about our
            data practices.
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 font-mono">
            <span>Last updated: {LAST_UPDATED}</span>
            <span>&bull;</span>
            <Link
              href="/data-deletion"
              className="text-accent hover:underline"
            >
              Data Deletion Instructions &rarr;
            </Link>
          </div>
        </div>

        {/* Introduction Box */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-md mb-12">
          <p className="text-sm sm:text-base leading-relaxed text-gray-300">
            This Privacy Policy governs your use of the FoxPassport website,
            mobile applications, and Republic services (collectively, the
            &ldquo;Service&rdquo;). FoxPassport is an experience discovery and
            booking platform operating in the Philippines and globally. We
            adhere to the{" "}
            <strong>Philippine Data Privacy Act of 2012 (RA 10173)</strong>,
            international data privacy principles, and{" "}
            <strong>Meta / Facebook Platform Terms &amp; Policies</strong>.
          </p>
        </div>

        {/* Section 1: Information We Collect */}
        <Section
          id="info-we-collect"
          title="1. Information We Collect"
          icon={Eye}
        >
          <p>
            We collect personal information necessary to deliver, secure, and
            personalize the FoxPassport experience:
          </p>
          <ul className="list-disc pl-6 space-y-2.5 text-gray-300">
            <li>
              <strong className="text-white">Account Details:</strong> When you
              register or update your profile, we collect your name, username,
              email address, mobile phone number, avatar, and optional bio
              details.
            </li>
            <li>
              <strong className="text-white">Google Sign-In Data:</strong> If
              you sign in using Google, we receive your verified email address,
              full name, profile photo, and unique Google account ID solely to
              verify your identity and manage your session.
            </li>
            <li>
              <strong className="text-white">
                Facebook / Meta Platform Data:
              </strong>{" "}
              When you choose to authenticate with Facebook Login, we request
              standard permissions only (specifically,{" "}
              <code className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-xs">
                public_profile
              </code>{" "}
              and{" "}
              <code className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-xs">
                email
              </code>
              ). We receive your name, verified email address, profile picture,
              and the application-scoped ID assigned by Meta. We do not request
              unnecessary permissions or access your friend lists, private
              feeds, or messages.
            </li>
            <li>
              <strong className="text-white">Location Data:</strong> With your
              permission, we use your device location to suggest nearby events,
              venues, and experiences on the live Republic map. You can enable
              or disable location permissions at any time via your browser or
              device settings.
            </li>
            <li>
              <strong className="text-white">
                Booking, Activity &amp; Passport Progress:
              </strong>{" "}
              We record your event bookings, venue reservations, Passport
              stamps, XP achievements, and interactions on the Republic feed.
            </li>
            <li>
              <strong className="text-white">
                Payment &amp; Transaction History:
              </strong>{" "}
              Payments are securely processed by third-party PCI-DSS certified
              payment processors (such as Stripe). FoxPassport never stores your
              full credit or debit card numbers on our servers.
            </li>
          </ul>
        </Section>

        {/* Section 2: Meta Platform Data Commitment */}
        <Section
          id="meta-data-commitment"
          title="2. Meta / Facebook Data Use & Protection"
          icon={Lock}
        >
          <div className="rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/5 p-5 mb-4">
            <h3 className="font-bold text-white text-base mb-2">
              Our Meta Platform Commitment
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              In strict accordance with Meta&rsquo;s Platform Terms and
              Developer Policies:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm text-gray-300">
              <li>
                We use Facebook user data exclusively to authenticate users,
                prevent fraud, and establish your FoxPassport account profile.
              </li>
              <li>
                We <strong>never sell, rent, or transfer</strong> Facebook user
                data to data brokers, advertising aggregators, or third parties.
              </li>
              <li>
                We do not use Facebook user data to build tracking profiles or
                serve targeted advertising across unaffiliated platforms.
              </li>
              <li>
                You can revoke access and delete your Meta data at any time (see
                Section 6 and our{" "}
                <Link
                  href="/data-deletion"
                  className="text-accent underline font-medium"
                >
                  Data Deletion Page
                </Link>
                ).
              </li>
            </ul>
          </div>
        </Section>

        {/* Section 3: How We Use Your Information */}
        <Section
          id="how-we-use-info"
          title="3. How We Use Your Information"
          icon={FileText}
        >
          <p>
            We process your personal information for the following legitimate
            purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>
              Creating and managing your FoxPassport account and authentication
              sessions.
            </li>
            <li>
              Facilitating bookings, venue reservations, event ticket
              fulfillment, and bids.
            </li>
            <li>
              Tracking Passport stamps, XP, levels, and Republic achievements.
            </li>
            <li>
              Providing transactional notifications, including booking
              confirmations, receipts, and security alerts.
            </li>
            <li>
              Detecting and mitigating fraud, abuse, harassment, and security
              incidents.
            </li>
            <li>
              Maintaining service reliability, performance monitoring, and
              debugging.
            </li>
          </ul>
        </Section>

        {/* Section 4: Who We Share Data With */}
        <Section
          id="data-sharing"
          title="4. Sharing of Information"
          icon={Shield}
        >
          <p>
            We do not sell your personal data. We only share information with
            third parties in the limited circumstances described below:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>
              <strong className="text-white">Foxers &amp; Venue Hosts:</strong>{" "}
              When you book an event or venue, necessary booking details (such
              as attendee name and contact info) are shared with the host to
              fulfill your reservation.
            </li>
            <li>
              <strong className="text-white">Payment Processors:</strong> We
              partner with trusted payment gateways (Stripe) to process
              financial transactions securely.
            </li>
            <li>
              <strong className="text-white">Cloud Infrastructure:</strong> We
              utilize secure cloud infrastructure providers (such as AWS) for
              database hosting, asset storage, and server operations.
            </li>
            <li>
              <strong className="text-white">Legal Obligations:</strong> We may
              disclose information if required by applicable law, regulation,
              subpoena, or lawful request by government authorities.
            </li>
          </ul>
        </Section>

        {/* Section 5: Cookies and Session Storage */}
        <Section id="cookies" title="5. Cookies &amp; Storage">
          <p>
            FoxPassport uses secure,{" "}
            <code className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-xs">
              httpOnly
            </code>{" "}
            session tokens to keep you logged in and protect your account. These
            tokens are strictly necessary for system operation and
            authentication. We do not use intrusive third-party cross-site
            advertising trackers.
          </p>
        </Section>

        {/* Section 6: Data Retention & Deletion */}
        <Section
          id="data-retention-deletion"
          title="6. Data Retention &amp; User Deletion"
          icon={Trash2}
        >
          <p>
            We retain personal information only for as long as your account
            remains active or as required by law (e.g., accounting and tax
            records required under Philippine commercial regulations).
          </p>
          <p>
            You have the right to request deletion of your account and personal
            data at any time. For detailed instructions on deleting your data or
            revoking Google/Facebook permissions, please visit our{" "}
            <Link
              href="/data-deletion"
              className="text-accent font-semibold underline hover:text-accent-hover"
            >
              Data Deletion Instructions Page
            </Link>
            .
          </p>
        </Section>

        {/* Section 7: Security */}
        <Section id="security" title="7. Security">
          <p>
            We employ industry-standard security safeguards including TLS 1.3
            encryption in transit, hashed passwords, role-based access control,
            and strict database firewalls. While no online service can guarantee
            absolute invulnerability, we continually monitor and strengthen our
            security posture.
          </p>
        </Section>

        {/* Section 8: Your Rights */}
        <Section id="your-rights" title="8. Your Rights">
          <p>
            Under RA 10173 and international privacy standards, you are entitled
            to:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-gray-300">
            <li>
              The right to be informed about how your data is collected and
              processed.
            </li>
            <li>
              The right to access and receive a copy of your personal data.
            </li>
            <li>
              The right to dispute inaccuracies and have your data rectified.
            </li>
            <li>
              The right to object to processing and request erasure or blocking
              of your data.
            </li>
          </ul>
        </Section>

        {/* Section 9: Contact Us */}
        <Section id="contact-us" title="9. Contact Us">
          <p>
            If you have questions, comments, or requests regarding this Privacy
            Policy or your personal information, please reach out to our Data
            Protection and Support Team:
          </p>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 mt-4">
            <p className="font-semibold text-white">
              Fox Passport Republic, Inc.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Data Privacy &amp; Compliance
            </p>
            <p className="text-sm mt-3">
              Email:{" "}
              <a
                href="mailto:support@foxpassport.com"
                className="text-accent font-medium hover:underline"
              >
                support@foxpassport.com
              </a>
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Website:{" "}
              <a
                href="https://foxpassport.com"
                className="text-gray-300 hover:underline"
              >
                https://foxpassport.com
              </a>
            </p>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
