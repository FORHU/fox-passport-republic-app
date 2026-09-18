interface PlaceJsonLdProps {
  venue: {
    id: string;
    title?: string;
    name?: string;
    description?: string;
    location?: string;
    city?: string;
    province?: string;
    country?: string;
    postalCode?: string;
    price?: number;
    rating?: number;
    reviews?: number;
    images?: Array<{ url: string } | string>;
    lat?: number | null;
    lng?: number | null;
    capacity?: number;
    guestCount?: number;
    host?: {
      id?: string;
      name?: string;
      avatar?: string;
    } | null;
  };
}

export default function PlaceJsonLd({ venue }: PlaceJsonLdProps) {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://foxpassport.com"
  ).replace(/\/+$/, "");

  const venueName = venue.title || venue.name;
  if (!venueName) return null;

  const images = (venue.images || [])
    .map((img) => (typeof img === "string" ? img : img?.url))
    .filter(Boolean);

  const venueUrl = `${baseUrl}/venues/${venue.id}`;

  const venueNode: Record<string, unknown> = {
    "@type": "Place",
    "@id": `${venueUrl}#venue`,
    name: venueName,
    url: venueUrl,
  };

  if (venue.description) {
    venueNode.description = venue.description;
  }

  if (images.length > 0) {
    venueNode.image = images;
  }

  const capacity = venue.capacity || venue.guestCount;
  if (capacity && capacity > 0) {
    venueNode.maximumAttendeeCapacity = capacity;
  }

  const hasAddress = Boolean(venue.location || venue.city || venue.province);
  if (hasAddress) {
    venueNode.address = {
      "@type": "PostalAddress",
      ...(venue.location ? { streetAddress: venue.location } : {}),
      ...(venue.city ? { addressLocality: venue.city } : {}),
      ...(venue.province ? { addressRegion: venue.province } : {}),
      ...(venue.postalCode ? { postalCode: venue.postalCode } : {}),
      addressCountry: venue.country || "PH",
    };
  }

  if (
    typeof venue.lat === "number" &&
    !isNaN(venue.lat) &&
    typeof venue.lng === "number" &&
    !isNaN(venue.lng)
  ) {
    venueNode.geo = {
      "@type": "GeoCoordinates",
      latitude: venue.lat,
      longitude: venue.lng,
    };
  }

  if (
    typeof venue.rating === "number" &&
    venue.rating > 0 &&
    typeof venue.reviews === "number" &&
    venue.reviews > 0
  ) {
    venueNode.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: venue.rating,
      reviewCount: venue.reviews,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "FoxPassport",
      url: baseUrl,
      logo: `${baseUrl}/foxonlylogo.png`,
    },
    venueNode,
  ];

  const schema = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
