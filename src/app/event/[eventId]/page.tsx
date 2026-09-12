import type { Metadata } from "next";
import { getPublicEventTemplateById } from "@/shared/lib/server/data";
import { EventDetailClient } from "./EventDetailClient";

interface EventPageProps {
  params: Promise<{ eventId: string }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { eventId } = await params;
  const template = await getPublicEventTemplateById(eventId);

  if (!template) {
    return {
      title: "Event Details | FoxPassport",
      description: "Discover curated events and experiences on FoxPassport.",
    };
  }

  const title = `${template.name || "Event"} | FoxPassport`;
  const description =
    template.description?.slice(0, 160) ||
    "Discover curated events and experiences on FoxPassport.";

  const images = (template.images ?? [])
    .map((img: any) => img.url)
    .filter(Boolean);

  const ogImages =
    images.length > 0
      ? images
      : ["/foxonlylogo.png"];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
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

export default function EventDetailsPage() {
  return <EventDetailClient />;
}
