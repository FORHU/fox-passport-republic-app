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
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
