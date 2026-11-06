import type { MetadataRoute } from "next";
import { indexingDisabled } from "@/shared/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://foxpassport.com"
  ).replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/event/",
          "/venues/",
          "/categories/",
          "/search",
          "/foxer/",
          "/republic",
        ],
        disallow: [
          "/admin/",
          "/creator-dashboard/",
          "/booking/",
          "/checkout/",
          "/messages/",
          "/notifications/",
          "/kyc/",
          "/api/",
          "/user/settings",
          "/scanner/",
          // Signed-in pages (proxy.ts redirects signed-out visitors anyway).
          // Public /foxer/<id> profiles stay allowed: the longest matching
          // rule wins, so these beat `Allow: /foxer/`.
          "/onboarding",
          "/progress",
          "/wishlists",
          "/calendar",
          "/reviews/",
          "/match/",
          "/mayor",
          "/host",
          "/venue-foxer",
          "/user/passport",
          "/user/*/connections",
          "/republic/saved",
          "/foxer/create-",
          "/foxer/apply",
          "/foxer/affiliations",
          "/foxer/marketplace-requests",
          "/foxer/resubmit/",
          "/auth/",
        ],
      },
    ],
    // A hidden build keeps `Allow` (crawlers must fetch pages to see their
    // noindex) but stops pointing them at production's sitemap.
    ...(indexingDisabled ? {} : { sitemap: `${baseUrl}/sitemap.xml` }),
  };
}
