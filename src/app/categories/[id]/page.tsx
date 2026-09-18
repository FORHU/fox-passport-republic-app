export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getEventsByCategory,
  getTrendingEventsByCategory,
} from "@/shared/lib/server/data";
import CategoryDetailClient from "@/features/category/components/CategoryDetailClient";

const CATEGORY_GRADIENTS: Record<string, string> = {
  birthday: "from-lime-300 via-green-400 to-emerald-500",
  wedding: "from-pink-300 via-rose-400 to-red-400",
  corporate: "from-emerald-400 via-teal-500 to-cyan-500",
  social: "from-indigo-400 via-purple-500 to-pink-500",
  other: "from-amber-200 via-yellow-400 to-orange-500",
};

interface CategoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const category = await getCategoryBySlug(id);

  if (!category) {
    return {
      title: "Category Not Found",
      robots: { index: false, follow: false },
    };
  }

  const name = category.name || "Experiences";
  const title = `${name} Experiences`;
  const description =
    category.tagline ||
    `Explore ${name} events, venues, and experiences on FoxPassport.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/categories/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `/categories/${id}`,
      type: "website",
      images: ["/foxonlylogo.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/foxonlylogo.png"],
    },
  };
}

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { id } = await params;
  const category = await getCategoryBySlug(id);

  if (!category) {
    notFound();
  }

  // Fetch related data
  const [events, trending] = await Promise.all([
    getEventsByCategory(category.slug),
    getTrendingEventsByCategory(category.slug),
  ]);

  // Enrich category with design data (similar to the hook)
  const categoryWithDesign = {
    ...category,
    title: category.name,
    tagline: category.tagline || "Explore experiences",
    color: category.color || "#ccff00",
    spots: category.spotLabel || "Explore",
    gradient:
      CATEGORY_GRADIENTS[category.name?.toLowerCase()] ||
      category.gradient ||
      "from-white to-gray-500",
    children: (category.subCategories || []).map(
      (sub: { image?: string; [key: string]: unknown }) => ({
        ...sub,
        image:
          sub.image ||
          "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800",
      }),
    ),
    events,
    trending,
  };

  return <CategoryDetailClient category={categoryWithDesign} />;
}
