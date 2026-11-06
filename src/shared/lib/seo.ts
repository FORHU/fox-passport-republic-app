import type { Metadata } from "next";

/**
 * Whether this build asks search engines to stay away. Set
 * `NEXT_PUBLIC_DISABLE_INDEXING=true` for dev/staging builds (deploy-dev.yml
 * does); unset, the site is indexable, so production can never be hidden by
 * a forgotten variable. `NEXT_PUBLIC_` because it is inlined at `next build`,
 * which is when static pages render their `<meta name="robots">`.
 */
export const indexingDisabled =
  process.env.NEXT_PUBLIC_DISABLE_INDEXING === "true";

/** The root layout's `robots` metadata for an indexable or a hidden build. */
export function robotsMetadata(disabled: boolean): Metadata["robots"] {
  if (disabled) {
    return {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    };
  }
  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  };
}

// dev.foxpassport.com (staging), Vercel previews and localhost answer
// `noindex`, so search engines never list their seed data or treat them as
// duplicates of foxpassport.com. A deny-list, not an allow-list: behind a
// reverse proxy that rewrites Host, an allow-list would noindex production.
// robots.txt must stay crawlable there: a crawler has to fetch a page to see
// this header. This covers hosts whose build lacks the flag above.
export function isNonProductionHost(headers: Headers): boolean {
  const host = (headers.get("x-forwarded-host") ?? headers.get("host") ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
  return (
    host === "dev.foxpassport.com" ||
    host.endsWith(".vercel.app") ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
}
