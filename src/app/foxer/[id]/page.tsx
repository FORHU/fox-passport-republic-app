import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFoxerById } from "@/shared/lib/server/data";
import FoxerProfile from "@/features/match/components/FoxerProfile";
import FoxerJsonLd from "@/shared/components/seo/FoxerJsonLd";
import { assetUrl } from "@/shared/lib/assets";

interface FoxerProfilePageProps {
  params: Promise<{ id: string }>;
}

function getFoxerRoleLabel(roleType?: string[]): string {
  const roles = roleType ?? [];
  if (roles.includes("eventFoxer")) return "Event Foxer";
  if (roles.includes("venueFoxer")) return "Venue Foxer";
  if (roles.includes("providerFoxer")) return "Provider";
  if (roles.includes("investor")) return "Partner Foxer";
  return "Foxer";
}

export async function generateMetadata({
  params,
}: FoxerProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const foxer = await getFoxerById(id);

  if (!foxer) {
    return {
      title: "Foxer Not Found",
      robots: { index: false, follow: false },
    };
  }

  const name = foxer.name || "Foxer";
  const roleLabel = getFoxerRoleLabel(foxer.roleType);
  const location = [foxer.city, foxer.state].filter(Boolean).join(", ");
  const locationSuffix = location ? ` in ${location}` : "";
  const title = `${name} (${roleLabel})${locationSuffix}`;
  const description = `${name} is a ${roleLabel} on FoxPassport${locationSuffix}. Explore public services, venues, and experiences.`;

  const ogImages = foxer.imgId ? [foxer.imgId] : [assetUrl("foxonlylogo.png")];

  return {
    title,
    description,
    alternates: {
      canonical: `/foxer/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `/foxer/${id}`,
      type: "profile",
      images: ogImages,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ogImages,
    },
  };
}

/**
 * A Foxer's profile is public: anyone can open a shared link, and it can be
 * indexed (robots.txt allows `/foxer/`). `proxy.ts` lets `/foxer/<id>` through;
 * the other `/foxer` pages are signed-in and guard themselves.
 */
export default async function FoxerProfilePage({
  params,
}: FoxerProfilePageProps) {
  const { id } = await params;
  const foxer = await getFoxerById(id);

  if (!foxer) {
    notFound();
  }

  return (
    <>
      <FoxerJsonLd
        foxer={{
          id,
          name: foxer.name,
          avatar: foxer.imgId ?? undefined,
          role: getFoxerRoleLabel(foxer.roleType),
          city: foxer.city ?? undefined,
          state: foxer.state ?? undefined,
        }}
      />
      <FoxerProfile initialFoxer={foxer} />
    </>
  );
}
