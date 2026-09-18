interface FoxerJsonLdProps {
  foxer: {
    id: string;
    name?: string;
    avatar?: string;
    role?: string;
    city?: string;
    state?: string;
    isOrganization?: boolean;
  };
}

export default function FoxerJsonLd({ foxer }: FoxerJsonLdProps) {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://foxpassport.com"
  ).replace(/\/+$/, "");

  const profileUrl = `${baseUrl}/foxer/${foxer.id}`;
  const isOrg = foxer.isOrganization ?? false;

  const foxerNode: Record<string, unknown> = {
    "@type": isOrg ? "Organization" : "Person",
    "@id": profileUrl,
    name: foxer.name || "FoxPassport Creator",
    url: profileUrl,
  };

  if (foxer.avatar) {
    foxerNode.image = foxer.avatar;
  }

  if (foxer.role) {
    foxerNode.jobTitle = foxer.role;
  }

  if (foxer.city || foxer.state) {
    foxerNode.address = {
      "@type": "PostalAddress",
      ...(foxer.city ? { addressLocality: foxer.city } : {}),
      ...(foxer.state ? { addressRegion: foxer.state } : {}),
      addressCountry: "PH",
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
    foxerNode,
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
