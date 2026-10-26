import type { MetadataRoute } from "next";

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
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
