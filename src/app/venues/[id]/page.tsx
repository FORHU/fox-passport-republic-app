export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getVenueById } from "@/shared/lib/server/data";
import { notFound } from "next/navigation";
import VenueDetailPageClient from "./_components/VenueDetailPageClient";
import PlaceJsonLd from "@/shared/components/seo/PlaceJsonLd";

interface VenueDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: VenueDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const venue = await getVenueById(id);

  if (!venue) {
    return {
      title: "Venue Not Found",
      robots: { index: false, follow: false },
    };
  }

  const name = venue.title || venue.name || "Venue";
  const city = venue.city ? ` in ${venue.city}` : "";
  const title = `${name}${city}`;
  const description =
    venue.description?.slice(0, 160) ||
    `Book ${name} on FoxPassport. Perfect for curated experiences, private gatherings, and events.`;

  const rawImages = venue.images ?? [];
  const images: string[] = rawImages
    .map((img: string | { url?: string }) =>
      typeof img === "string" ? img : (img?.url ?? ""),
    )
    .filter((url: string) => url.length > 0);

  const ogImages = images.length > 0 ? images : ["/foxonlylogo.png"];

  return {
    title,
    description,
    alternates: {
      canonical: `/venues/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `/venues/${id}`,
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
  };
}

export default async function VenueDetailPage({
  params,
}: VenueDetailPageProps) {
  const { id } = await params;
  const venue = await getVenueById(id);

  if (!venue) {
    notFound();
  }

  const host = venue.host ?? { name: "Venue Foxer", avatar: "", bio: "" };

  return (
    <>
      <PlaceJsonLd venue={venue} />
      <VenueDetailPageClient venue={venue} host={host} />
    </>
  );
}
