import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import LandingFooter from "@/features/landing/components/sections/LandingFooter";
import RoleDocs from "@/features/landing/journey/RoleDocs";
import { ROLES } from "@/features/onboarding/roleCatalog";

// Public on purpose: /earn is not in proxy.ts's PROTECTED_ROUTES.
interface RolePageProps {
  params: Promise<{ role: string }>;
}

const findRole = (slug: string) => ROLES.find((r) => r.slug === slug);

export const dynamicParams = false;

export function generateStaticParams() {
  return ROLES.map((r) => ({ role: r.slug }));
}

export async function generateMetadata({
  params,
}: RolePageProps): Promise<Metadata> {
  const role = findRole((await params).role);
  if (!role) return { title: "Role not found" };
  return { title: role.title, description: role.desc };
}

export default async function RolePage({ params }: RolePageProps) {
  const { role: slug } = await params;
  if (!findRole(slug)) notFound();

  return (
    <div className="min-h-screen bg-canvas text-white antialiased selection:bg-accent selection:text-black">
      <LandingHeader />
      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-8">
        <RoleDocs slug={slug} />
      </main>
      <LandingFooter />
    </div>
  );
}
