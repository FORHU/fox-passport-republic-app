"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";

type Tab = "terms" | "privacy";

interface TermsPrivacyModalProps {
  initialTab?: Tab;
  onClose: () => void;
  onAccept: () => void;
  /** Fires once, the moment both documents have been scrolled to the end. */
  onBothRead?: () => void;
}

// A tab counts as "read" once its scroll position is within this many
// percentage points of the bottom — 100% is unreachable on some browsers
// due to fractional scroll-height rounding.
const READ_THRESHOLD_PCT = 96;

export function TermsPrivacyModal({
  initialTab = "terms",
  onClose,
  onAccept,
  onBothRead,
}: TermsPrivacyModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [readTerms, setReadTerms] = useState(false);
  const [readPrivacy, setReadPrivacy] = useState(false);
  const [progress, setProgress] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const measure = (el: HTMLDivElement, tab: Tab) => {
    const max = el.scrollHeight - el.clientHeight;
    const pct = max <= 0 ? 100 : Math.min(100, (el.scrollTop / max) * 100);
    setProgress(pct);
    if (pct >= READ_THRESHOLD_PCT) {
      if (tab === "terms") setReadTerms(true);
      else setReadPrivacy(true);
    }
  };

  // Re-measure on every tab switch: a short document may already satisfy
  // the read threshold without the user scrolling at all.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = 0;
    measure(el, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (readTerms && readPrivacy) onBothRead?.();
  }, [readTerms, readPrivacy, onBothRead]);

  const bothRead = readTerms && readPrivacy;

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-[min(640px,84vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#111213] shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <span className="h-2 w-2 flex-shrink-0 rotate-45 rounded-sm bg-[#ccff00]" />
                The Republic Charter
              </h2>
              <p className="mt-1 text-xs text-white/50">
                Read both documents in full to enable acceptance.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex gap-1.5 rounded-xl border border-white/10 bg-black/30 p-1">
            <TabButton
              label="Terms of Service"
              active={activeTab === "terms"}
              read={readTerms}
              onClick={() => setActiveTab("terms")}
            />
            <TabButton
              label="Privacy Policy"
              active={activeTab === "privacy"}
              read={readPrivacy}
              onClick={() => setActiveTab("privacy")}
            />
          </div>
        </div>

        {/* Scroll progress rail */}
        <div className="mx-5 mt-3.5 h-[2px] flex-shrink-0 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-[#ccff00] transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Body */}
        <div className="relative mt-3.5 min-h-0 flex-1">
          <div
            ref={bodyRef}
            onScroll={(e) => measure(e.currentTarget, activeTab)}
            className="h-full overflow-y-auto px-5 pb-7 font-serif text-[14.5px] leading-[1.68] text-white/60"
          >
            {activeTab === "terms" ? <TermsContent /> : <PrivacyContent />}
          </div>
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 flex h-16 items-end justify-center bg-gradient-to-t from-[#111213] to-transparent pb-2 transition-opacity ${
              progress >= READ_THRESHOLD_PCT ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="animate-bounce text-[10.5px] font-semibold uppercase tracking-wider text-white/35">
              ↓ keep scrolling
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-white/10 px-5 py-4">
          <p className="mb-3 flex items-center gap-2 text-[11.5px] text-white/35">
            <span
              className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${readTerms ? "bg-[#ccff00]" : "bg-white/25"}`}
            />
            {readTerms ? "Terms read" : "Reading Terms of Service"}
            <span className="text-white/20">·</span>
            <span
              className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${readPrivacy ? "bg-[#ccff00]" : "bg-white/25"}`}
            />
            {readPrivacy ? "Privacy read" : "Reading Privacy Policy"}
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white"
            >
              Decline
            </button>
            <button
              type="button"
              disabled={!bothRead}
              onClick={() => {
                onAccept();
                onClose();
              }}
              className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                bothRead
                  ? "bg-[#ccff00] text-black shadow-[0_8px_24px_-8px_rgba(204,255,0,0.45)]"
                  : "cursor-not-allowed bg-white/[0.08] text-white/30"
              }`}
            >
              I Accept Both
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function TabButton({
  label,
  active,
  read,
  onClick,
}: {
  label: string;
  active: boolean;
  read: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
        active ? "bg-white/10 text-white" : "text-white/50 hover:text-white/70"
      }`}
    >
      <span
        className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
          read ? "border-[#ccff00] bg-[#ccff00]" : "border-white/30"
        }`}
      >
        {read && <Check className="h-2 w-2 text-black" strokeWidth={4} />}
      </span>
      {label}
    </button>
  );
}

function Clause({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[18px]">
      <span className="mr-1.5 font-mono text-[11px] text-[#ccff00]">
        §{num}
      </span>
      <h4 className="inline font-display text-[13.5px] font-semibold text-white">
        {title}
      </h4>
      <div className="mt-2 space-y-2.5">{children}</div>
    </div>
  );
}

function DocMeta({ label }: { label: string }) {
  return (
    <div className="mb-4 flex gap-3.5 border-b border-white/10 pb-3 font-mono text-[10.5px] uppercase tracking-wide text-white/35">
      <span>Version 1.0</span>
      <span>Effective 1 Jan 2026</span>
      <span>{label}</span>
    </div>
  );
}

function EndMarker({ label }: { label: string }) {
  return (
    <div className="mt-1.5 flex items-center gap-2.5 pt-4 font-mono text-[10.5px] uppercase tracking-wider text-white/35">
      <span className="h-px flex-1 bg-white/10" />
      {label}
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function TermsContent() {
  return (
    <>
      <DocMeta label="Fox Passport Republic, Inc." />

      <Clause num={1} title="What the Republic Is">
        <p>
          Fox Passport Republic (&ldquo;the Republic,&rdquo; &ldquo;we,&rdquo;
          &ldquo;us&rdquo;) operates a marketplace and social platform
          connecting Citizens booking venues, gear, and services with
          Foxers &mdash; independent hosts registered under one or more
          roles: Venue Foxer, Event Foxer, Gear Foxer, Service Foxer, or
          Investor. By creating an account you agree to these Terms,
          regardless of which role you hold.
        </p>
      </Clause>

      <Clause num={2} title="Your Passport">
        <p>
          Every account is issued a <strong className="text-white">Passport</strong>:
          a record of paths, XP, badges, and event stamps earned through
          completed bookings and community participation. Passport progress
          is non-transferable and has no cash value. We may adjust XP or
          revoke a badge awarded in error, but never as a substitute for a
          refund decision, which is governed separately under §6.
        </p>
      </Clause>

      <Clause num={3} title="Bookings & Bidding">
        <p>
          A booking request sent through a venue, asset, or service listing
          is an offer. It becomes a confirmed booking only when the Foxer
          accepts it or, for open listings, when checkout completes. Event
          Service Bids and Event Asset Bids submitted against a published
          Event Template expire if not accepted within the window shown at
          submission.
        </p>
      </Clause>

      <Clause num={4} title="Payments & Invoices">
        <p>
          All charges are collected into a single Invoice per checkout,
          inclusive of any platform fee disclosed before payment. Payments
          are processed by Stripe; the Republic never stores your card
          number. Payouts to Foxers are released on the schedule shown in
          their dashboard, net of the platform fee then in effect.
        </p>
      </Clause>

      <Clause num={5} title="Partnerships & Sponsorship">
        <p>
          Partner accounts may submit Partnership Proposals &mdash;
          investment, sponsorship, resource contribution, or business
          partnership &mdash; against a published event or venue. A
          proposal is non-binding until both parties confirm terms outside
          the expiring-offer window described in §3.
        </p>
      </Clause>

      <Clause num={6} title="Cancellations & Refunds">
        <p>
          Refund eligibility follows the cancellation policy attached to
          the listing at the time of booking. Disputed charges are
          reviewed by Republic Secretariat staff, whose determination is
          binding for platform-fee purposes and does not limit your rights
          under applicable consumer law.
        </p>
      </Clause>

      <Clause num={7} title="Community Conduct on the Feed">
        <p>
          Posts, comments, and reactions on the Republic Feed are public
          by default; you may mark a post limited-visibility at the time
          of posting. We may remove content or suspend posting privileges
          for harassment, fraud, or repeated false reporting, independent
          of any action on your booking history.
        </p>
      </Clause>

      <Clause num={8} title="Changes to These Terms">
        <p>
          We&rsquo;ll notify active accounts at least 14 days before a
          material change takes effect. Continuing to use the Republic
          after that date constitutes acceptance; if you don&rsquo;t agree,
          you may close your account without penalty before the change
          lands.
        </p>
      </Clause>

      <EndMarker label="End of Terms of Service" />
    </>
  );
}

function PrivacyContent() {
  return (
    <>
      <DocMeta label="Fox Passport Republic, Inc." />

      <Clause num={1} title="What We Collect">
        <p>
          Account details you provide (name, username, email, mobile
          number), profile content, booking and messaging activity,
          Passport progress, and device/usage data. When you search
          venues near you, we collect the location you share for that
          search only &mdash; it is not stored against your account unless
          you save it as a default.
        </p>
      </Clause>

      <Clause num={2} title="How We Use It">
        <p>
          To operate bookings, bids, and partnerships; to track Passport
          XP, badges, and stamps; to personalize the Republic Feed; to
          send transactional email (OTP verification, booking updates,
          payout notices); and to detect fraud or abuse across accounts.
        </p>
      </Clause>

      <Clause num={3} title="Sharing With Foxers & Partners">
        <p>
          Booking a venue, asset, or service shares the details needed to
          fulfil it &mdash; your name, contact info, and event
          specifics &mdash; with the Foxer you booked. A Partnership
          Proposal shares your proposal details with the event or venue
          owner it targets. We do not sell this information to anyone
          outside that transaction.
        </p>
      </Clause>

      <Clause num={4} title="Payment Data">
        <p>
          Stripe processes every payment on our behalf; we receive only
          the resulting invoice, status, and a provider reference &mdash;
          never your full card number. Invoice and payout records are
          retained for as long as tax and financial-reporting law
          requires, even after account deletion.
        </p>
      </Clause>

      <Clause num={5} title="Location Data">
        <p>
          Location is used to sort venues and events by distance and to
          power &ldquo;near me&rdquo; search. You can decline location
          access at the browser or device level; distance-based search
          simply won&rsquo;t be available until you grant it again.
        </p>
      </Clause>

      <Clause num={6} title="Cookies & Sessions">
        <p>
          We set two httpOnly session cookies to keep you signed in and to
          rotate your access token &mdash; neither is readable by
          JavaScript, and neither is a third-party advertising or
          tracking cookie. We run no ad-network trackers on the Republic.
        </p>
      </Clause>

      <Clause num={7} title="Retention & Deletion">
        <p>
          Deleting your account removes your profile, feed posts, and
          messages from view immediately. Records we&rsquo;re legally
          required to keep &mdash; invoices, payouts, and dispute
          history &mdash; are retained on the schedule described in §4
          and are not restored to any account afterward.
        </p>
      </Clause>

      <Clause num={8} title="Your Rights & Contact">
        <p>
          You can request a copy of your data, ask us to correct it, or
          ask us to delete what isn&rsquo;t under a legal retention
          requirement, by contacting support from your account settings.
          We aim to respond within 30 days.
        </p>
      </Clause>

      <EndMarker label="End of Privacy Policy" />
    </>
  );
}
