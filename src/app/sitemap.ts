import type { MetadataRoute } from "next";
import {
  getVenues,
  getCategories,
  getPublicEventTemplates,
  getPublicFoxers,
} from "@/shared/lib/server/data";

// Hourly ISR revalidation for sitemap (3600 seconds)
export const revalidate = 3600;

interface SitemapVenue {
  id: string;
  status?: string;
  updatedAt?: string | Date;
}

interface SitemapCategory {
  id?: string;
  slug?: string;
  updatedAt?: string | Date;
}

interface SitemapEventTemplate {
  id: string;
  status?: string;
  isPublic?: boolean;
  updatedAt?: string | Date;
}

interface SitemapFoxer {
  id: string;
  updatedAt?: string | Date;
}

/**
 * Dynamic Sitemap Handler
 *
 * NOTE ON SCALABILITY:
 * The initial implementation fetches the current active public catalog (up to 100 items per entity).
 * As the public catalog expands, this should be partitioned using Next.js `generateSitemaps`
 * or sitemap index files (e.g. `/sitemap/events.xml`, `/sitemap/venues.xml`, `/sitemap/foxers.xml`)
 * to handle thousands of entities while staying well below Google's 50,000 URLs / 50MB per sitemap limit.
 *
 * PRIVACY BOUNDARY:
 * Only public EventTemplates, approved Venues, public Categories, and public Foxer profiles
 * are indexed. Private booked Events, customer bookings, checkouts, and admin paths are strictly excluded.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://foxpassport.com"
  ).replace(/\/+$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/republic`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  const [venues, categories, eventTemplates, foxers] = await Promise.all([
    getVenues().catch(() => []),
    getCategories().catch(() => []),
    getPublicEventTemplates(100).catch(() => []),
    getPublicFoxers(100).catch(() => []),
  ]);

  // Public approved Venues only (no drafts or pending)
  const venueRoutes: MetadataRoute.Sitemap = (venues as SitemapVenue[])
    .filter(
      (venue) =>
        venue?.id && venue?.status !== "draft" && venue?.status !== "pending",
    )
    .map((venue) => ({
      url: `${baseUrl}/venues/${venue.id}`,
      lastModified: venue.updatedAt ? new Date(venue.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

  // Public Categories
  const categoryRoutes: MetadataRoute.Sitemap = (
    categories as SitemapCategory[]
  )
    .filter((category) => category?.slug || category?.id)
    .map((category) => ({
      url: `${baseUrl}/categories/${category.slug || category.id}`,
      lastModified: category.updatedAt
        ? new Date(category.updatedAt)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

  // Public indexable EventTemplates only (exclude drafts, non-public, or private bookings)
  const eventRoutes: MetadataRoute.Sitemap = (
    eventTemplates as SitemapEventTemplate[]
  )
    .filter(
      (template) =>
        template?.id &&
        template?.status !== "draft" &&
        template?.status !== "rejected" &&
        template?.isPublic !== false,
    )
    .map((template) => ({
      url: `${baseUrl}/event/${template.id}`,
      lastModified: template.updatedAt
        ? new Date(template.updatedAt)
        : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

  // Public Foxer Profiles
  const foxerRoutes: MetadataRoute.Sitemap = (foxers as SitemapFoxer[])
    .filter((foxer) => foxer?.id)
    .map((foxer) => ({
      url: `${baseUrl}/foxer/${foxer.id}`,
      lastModified: foxer.updatedAt ? new Date(foxer.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [
    ...staticRoutes,
    ...eventRoutes,
    ...venueRoutes,
    ...categoryRoutes,
    ...foxerRoutes,
  ];
}
