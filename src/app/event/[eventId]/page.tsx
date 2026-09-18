import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicEventTemplateById } from "@/shared/lib/server/data";
import { EventDetailClient } from "./EventDetailClient";
import EventJsonLd from "@/shared/components/seo/EventJsonLd";

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
      title: "Event Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = template.name || "Event";
  const description =
    template.description?.slice(0, 160) ||
    "Discover curated events and experiences on FoxPassport.";

  const rawImages = template.images ?? [];
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
      canonical: `/event/${eventId}`,
    },
    openGraph: {
      title,
      description,
      url: `/event/${eventId}`,
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

export default async function EventDetailsPage({ params }: EventPageProps) {
  const { eventId } = await params;
  const template = await getPublicEventTemplateById(eventId);

  if (!template) {
    notFound();
  }

  return (
    <>
      <EventJsonLd event={{ ...template, id: eventId }} />
      <EventDetailClient initialTemplate={template} />
    </>
  );
}
