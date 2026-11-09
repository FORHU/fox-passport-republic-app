import type { Metadata } from "next";
import Link from "next/link";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import LandingFooter from "@/features/landing/components/sections/LandingFooter";
import { Cookie, Database, LogIn, Settings, Shield } from "lucide-react";
import { BackButton } from "@/shared/components/ui/BackButton";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Which cookies and browser storage FoxPassport uses, what each one is for, how long it lasts, and how to manage or block them.",
  openGraph: {
    title: "Cookie Policy | FoxPassport",
    description:
      "Which cookies FoxPassport uses, what they are for, and how to manage them.",
    url: "https://foxpassport.com/cookies",
    type: "website",
  },
};

const LAST_UPDATED = "November 6, 2026";

// Only what the site actually sets. Keep in step with the code: the session
// cookie names live in `shared/auth/session-cookies.ts`, the storage keys in
// the persisted stores. No analytics or advertising cookies are used.
const COOKIES = [
  {
    name: "__Secure-better-auth.session_token",
    setBy: "FoxPassport",
    purpose:
      "Keeps you signed in and protects your account. Sent only over HTTPS and cannot be read by page scripts (httpOnly).",
    lifetime: "7 days, renewed while you use the site",
    type: "Strictly necessary",
  },
  {
    name: "__stripe_mid, __stripe_sid",
    setBy: "Stripe (our payment processor)",
    purpose:
      "Fraud prevention while you pay or set up payouts. Only on checkout and payout pages.",
    lifetime: "1 year (__stripe_mid), 30 minutes (__stripe_sid)",
    type: "Strictly necessary",
  },
] as const;

const STORAGE = [
  {
    name: "fox_user",
    where: "Local storage",
    purpose:
      "Your profile details for display, so the site shows who is signed in. It is not your session and cannot sign you in.",
  },
  {
    name: "fp_new_user",
    where: "Local storage",
    purpose:
      "Sends you to onboarding once after you create an account, then is removed.",
  },
  {
    name: "map-theme",
    where: "Local storage",
    purpose: "Remembers the map style you picked.",
  },
  {
    name: "fp-event-builder:<account>",
    where: "Local storage",
    purpose: "Saves your unfinished event draft on this device.",
  },
  {
    name: "foxpassport-checkout, foxpassport-item-booking",
    where: "Session storage",
    purpose: "Keeps your booking in progress if you reload. Cleared when you close the tab.",
  },
] as const;

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

const TH = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400";
const TD = "px-4 py-3 align-top text-sm text-gray-300";
const NAME = "px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-xs break-all";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-canvas text-gray-200 antialiased selection:bg-accent selection:text-black">
      <LandingHeader />

      <main className="relative pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-2">
          <BackButton variant="label" href="/" label="Back to Home" />
          <span className="text-gray-600">/</span>
          <span className="text-xs text-gray-400">Legal</span>
        </div>

        <div className="border-b border-white/10 pb-8 sm:pb-12 mb-10 sm:mb-14">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
              <Shield className="h-3.5 w-3.5" />
              Legal Charter
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              Draft, pending legal review
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display mb-4">
            Cookie Policy
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            This page explains the cookies and browser storage FoxPassport
            uses, what each one is for, and how you can control them. It sits
            alongside our{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 font-mono">
            <span>Last updated: {LAST_UPDATED}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/2 p-6 sm:p-8 backdrop-blur-md mb-12">
          <p className="text-sm sm:text-base leading-relaxed text-gray-300">
            <strong className="text-white">In short:</strong> we only use
            cookies that the site needs to work: one to keep you signed in, and
            Stripe&rsquo;s fraud-prevention cookies when you pay. We do not use
            analytics, advertising or cross-site tracking cookies.
          </p>
        </div>

        <Section id="what-are-cookies" title="1. What Cookies Are" icon={Cookie}>
          <p>
            Cookies are small text files a website stores in your browser. The
            site reads them back on later visits, for example to remember that
            you are signed in. Browsers also offer local and session storage,
            which work in a similar way but are never sent to our servers.
          </p>
        </Section>

        <Section id="cookies-we-use" title="2. Cookies We Use" icon={Shield}>
          <p>
            Every cookie below is strictly necessary: the site cannot sign you
            in or take payments safely without it, so it is set without asking
            for consent.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-160 border-collapse">
              <thead className="bg-white/3">
                <tr>
                  <th className={TH}>Name</th>
                  <th className={TH}>Set by</th>
                  <th className={TH}>Purpose</th>
                  <th className={TH}>Lasts</th>
                  <th className={TH}>Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {COOKIES.map((c) => (
                  <tr key={c.name}>
                    <td className={TD}>
                      <code className={`${NAME} whitespace-nowrap`}>
                        {c.name}
                      </code>
                    </td>
                    <td className={TD}>{c.setBy}</td>
                    <td className={TD}>{c.purpose}</td>
                    <td className={TD}>{c.lifetime}</td>
                    <td className={TD}>{c.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            On non-secure (http) development servers the session cookie is
            named <code className={NAME}>better-auth.session_token</code>.
          </p>
        </Section>

        <Section id="browser-storage" title="3. Other Browser Storage" icon={Database}>
          <p>
            These are kept only in your browser and are not sent to us with
            each request. They make the site remember small things on this
            device.
          </p>
          <ul className="list-disc pl-6 space-y-2.5 text-gray-300">
            {STORAGE.map((s) => (
              <li key={s.name}>
                <code className={NAME}>{s.name}</code>{" "}
                <span className="text-gray-500">({s.where})</span>: {s.purpose}
              </li>
            ))}
          </ul>
          <p>
            Signing out removes your profile details from this device. Event
            drafts stay, kept separately for each account, until you publish
            or discard them or clear your browser data.
          </p>
        </Section>

        <Section id="sign-in-providers" title="4. Google & Facebook Sign-In" icon={LogIn}>
          <p>
            If you sign in with Google or Facebook, you are sent to their site
            to confirm it is you. Any cookies they use are set on their own
            domains under their own policies, not by FoxPassport.
          </p>
        </Section>

        <Section id="manage-cookies" title="5. Managing or Blocking Cookies" icon={Settings}>
          <p>
            You can see, delete or block cookies and site data in your browser
            settings, usually under <em>Privacy</em> or <em>Site settings</em>.
            Most browsers also let you clear them for one site only.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>
              Blocking or deleting the session cookie signs you out, and you
              will not be able to stay signed in.
            </li>
            <li>
              Blocking Stripe&rsquo;s cookies can stop card payments from
              going through.
            </li>
            <li>
              Clearing local storage removes saved drafts and your map style
              on that device.
            </li>
          </ul>
        </Section>

        <Section id="changes" title="6. Changes to This Policy">
          <p>
            If we add or change a cookie, we will update this page and the
            &ldquo;Last updated&rdquo; date above.
          </p>
        </Section>

        <Section id="contact-us" title="7. Contact Us">
          <p>Questions about cookies or your data? Contact us:</p>
          <div className="rounded-xl border border-white/10 bg-white/3 p-5 mt-4">
            <p className="font-semibold text-white">Fox Passport Republic, Inc.</p>
            <p className="text-gray-400 text-sm mt-1">Data Privacy &amp; Compliance</p>
            <p className="text-sm mt-3">
              Email:{" "}
              <a
                href="mailto:support@foxpassport.com"
                className="text-accent font-medium hover:underline"
              >
                support@foxpassport.com
              </a>
            </p>
          </div>
        </Section>
      </main>

      <LandingFooter />
    </div>
  );
}
