"use client";

import Link from "next/link";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { signInThen } from "@/shared/auth/returnTo";
import { ROLES as CATALOG } from "@/features/onboarding/roleCatalog";
import { ROLES } from "./data";

const APPLY_CTA =
  "mt-12 inline-block rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-black";
const LIST =
  "mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-white/80 marker:text-(--accent-text)";

/**
 * A role's public documentation (/earn/<slug>), laid out like a docs site:
 * roles in a sidebar, the role's copy beside it. The copy is onboarding's
 * role catalog, the same text the apply flow shows. The landing Earn cards
 * link here.
 */
export default function RoleDocs({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user);
  const doc = CATALOG.find((c) => c.slug === slug) ?? CATALOG[0];

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
      {/* Phone: a scrolling row above the docs. Desktop: a sticky sidebar. */}
      <nav
        aria-label="Explore roles"
        className="min-w-0 lg:sticky lg:top-32 lg:self-start"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Explore roles
        </p>
        <ul className="mt-3 flex gap-6 overflow-x-auto border-b border-white/10 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-b-0 lg:border-l">
          {ROLES.map((r) => {
            const active = r.key === doc.slug;
            return (
              <li key={r.key} className="shrink-0">
                <Link
                  href={`/earn/${r.key}`}
                  aria-current={active ? "page" : undefined}
                  className={`-mb-px block whitespace-nowrap border-b-2 py-3 text-sm transition-colors lg:-ml-px lg:mb-0 lg:border-b-0 lg:border-l-2 lg:py-2 lg:pl-4 ${
                    active
                      ? "border-accent font-semibold text-(--accent-text)"
                      : "border-transparent text-white/60 hover:text-white"
                  }`}
                >
                  {r.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <article className="min-w-0 max-w-3xl">
        <Link
          href="/#earn"
          className="text-sm text-white/50 transition-colors hover:text-white"
        >
          ← All roles
        </Link>

        <h1 className="font-landing-display mt-6 text-4xl text-white sm:text-5xl">
          {doc.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-white/70">{doc.desc}</p>

        <h2 className="mt-12 text-xl font-semibold text-white">
          What you&apos;ll do
        </h2>
        <ul className={LIST}>
          {doc.responsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="mt-12 text-xl font-semibold text-white">
          What you&apos;ll need to apply
        </h2>
        <ul className={LIST}>
          {doc.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        {/* Apply routes are protected: signed out, sign in here and continue
            to the form after, instead of being bounced to the landing page. */}
        {user ? (
          <Link href={doc.href} className={APPLY_CTA}>
            Apply as {doc.title}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => signInThen(doc.href)}
            className={`${APPLY_CTA} cursor-pointer`}
          >
            Apply as {doc.title}
          </button>
        )}
        <p className="mt-4 text-sm text-white/50">
          Our team reviews every application. If a document needs fixing,
          we&apos;ll flag just that one so you can resubmit it.
        </p>
      </article>
    </div>
  );
}
