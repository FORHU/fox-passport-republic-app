export default function WebsiteJsonLd() {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://foxpassport.com"
  ).replace(/\/+$/, "");

  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "FoxPassport",
        description:
          "FoxPassport returns the power of Happiness & Experience to You",
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "FoxPassport",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/foxonlylogo.png`,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
  );
}
