interface EventJsonLdProps {
  event: {
    id: string;
    name?: string;
    description?: string;
    targetCity?: string;
    targetState?: string;
    targetCountry?: string;
    price?: number;
    currency?: string;
    images?: Array<{ url: string } | string>;
    eventDate?: string;
    publicOpenAt?: string;
    endDate?: string;
    creator?: {
      id?: string;
      name?: string;
      avatar?: string;
      isOrganization?: boolean;
    };
    owner?: {
      id?: string;
      name?: string;
      avatar?: string;
      isOrganization?: boolean;
    };
    lat?: number | null;
    lng?: number | null;
    venueName?: string;
  };
}

export default function EventJsonLd({ event }: EventJsonLdProps) {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://foxpassport.com"
  ).replace(/\/+$/, "");

  if (!event?.id || !event?.name) return null;

  const images = (event.images || [])
    .map((img) => (typeof img === "string" ? img : img?.url))
    .filter(Boolean);

  const eventUrl = `${baseUrl}/event/${event.id}`;
  const organizer = event.creator || event.owner;

  // Determine valid startDate
  const rawStartDate = event.eventDate || event.publicOpenAt;
  let validStartDate: string | undefined;
  if (rawStartDate) {
    const d = new Date(rawStartDate);
    if (!isNaN(d.getTime())) {
      validStartDate = d.toISOString();
    }
  }

  let validEndDate: string | undefined;
  if (event.endDate) {
    const d = new Date(event.endDate);
    if (!isNaN(d.getTime())) {
      validEndDate = d.toISOString();
    }
  }

  // Build location only if location data is present
  const locationName =
    event.venueName ||
    [event.targetCity, event.targetState].filter(Boolean).join(", ");

  let locationNode: Record<string, unknown> | undefined;
  if (locationName) {
    locationNode = {
      "@type": "Place",
      name: locationName,
    };

    if (event.targetCity || event.targetState) {
      locationNode.address = {
        "@type": "PostalAddress",
        ...(event.targetCity ? { addressLocality: event.targetCity } : {}),
        ...(event.targetState ? { addressRegion: event.targetState } : {}),
        addressCountry: event.targetCountry || "PH",
      };
    }

    if (
      typeof event.lat === "number" &&
      !isNaN(event.lat) &&
      typeof event.lng === "number" &&
      !isNaN(event.lng)
    ) {
      locationNode.geo = {
        "@type": "GeoCoordinates",
        latitude: event.lat,
        longitude: event.lng,
      };
    }
  }

  const eventNode: Record<string, unknown> = {
    "@type": "Event",
    "@id": `${eventUrl}#event`,
    name: event.name,
    url: eventUrl,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
  };

  if (event.description) {
    eventNode.description = event.description;
  }

  if (images.length > 0) {
    eventNode.image = images;
  }

  if (validStartDate) {
    eventNode.startDate = validStartDate;
  }

  if (validEndDate) {
    eventNode.endDate = validEndDate;
  }

  if (locationNode) {
    eventNode.location = locationNode;
  }

  if (typeof event.price === "number" && event.price >= 0) {
    eventNode.offers = {
      "@type": "Offer",
      url: eventUrl,
      price: String(event.price),
      priceCurrency: event.currency || "PHP",
      availability: "https://schema.org/InStock",
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
  ];

  if (organizer?.id && organizer?.name) {
    const organizerUrl = `${baseUrl}/foxer/${organizer.id}`;
    const isOrg = organizer.isOrganization ?? false;
    eventNode.organizer = { "@id": organizerUrl };
    graph.push({
      "@type": isOrg ? "Organization" : "Person",
      "@id": organizerUrl,
      name: organizer.name,
      url: organizerUrl,
      ...(organizer.avatar ? { image: organizer.avatar } : {}),
    });
  }

  graph.push(eventNode);

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
