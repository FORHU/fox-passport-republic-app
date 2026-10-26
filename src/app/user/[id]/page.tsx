import React from "react";
import type { Metadata } from "next";
import { publicServerFetch } from "@/shared/lib/server/data";
import PublicCitizenProfileClient from "./PublicCitizenProfileClient";

export const dynamic = "force-dynamic";

/**
 * A citizen's profile is public: anyone can open a shared link, and it can be
 * indexed. The API shows others where someone has a stamp, not when or for
 * which event, and never their email or role (GET /users/profile/:id).
 */

type Props = { params: Promise<{ id: string }> };

type ProfileSummary = {
  data?: {
    name?: string | null;
    username?: string | null;
    city?: string | null;
    passport?: { stamps?: unknown[] } | null;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const body = await publicServerFetch<ProfileSummary>(
    `/users/profile/${encodeURIComponent(id)}`,
  );
  const profile = body?.data;
  if (!profile) {
    return {
      title: "Citizen not found",
      robots: { index: false, follow: false },
    };
  }

  const name = profile.name || profile.username || "A citizen";
  const stamps = profile.passport?.stamps?.length ?? 0;
  const where = profile.city ? ` from ${profile.city}` : "";
  const description = `${name}${where} on FoxPassport${
    stamps > 0 ? `, with ${stamps} venue ${stamps === 1 ? "stamp" : "stamps"}` : ""
  }.`;

  return {
    title: name,
    description,
    alternates: { canonical: `/user/${id}` },
    openGraph: { title: name, description, url: `/user/${id}`, type: "profile" },
  };
}

export default function UserPublicProfilePage() {
  return <PublicCitizenProfileClient />;
}
