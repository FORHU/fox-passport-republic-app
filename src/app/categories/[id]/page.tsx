export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getCategoryBySlug, getEventsByCategory, getTrendingEventsByCategory } from '@/shared/lib/server/data'
import CategoryDetailClient from '@/features/category/components/CategoryDetailClient'

const CATEGORY_GRADIENTS: Record<string, string> = {
  birthday:  "from-lime-300 via-green-400 to-emerald-500",
  wedding:   "from-pink-300 via-rose-400 to-red-400",
  corporate: "from-emerald-400 via-teal-500 to-cyan-500",
  social:    "from-indigo-400 via-purple-500 to-pink-500",
  other:     "from-amber-200 via-yellow-400 to-orange-500",
};

interface CategoryDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { id } = await params
  const category = await getCategoryBySlug(id)

  if (!category) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-3xl font-bold text-white mb-4">Category Not Found</h1>
        <Link href="/" className="px-6 py-3 rounded-xl bg-[#ccff00] text-black font-bold hover:bg-[#b3e600] transition-colors">
          Go Home
        </Link>
      </div>
    )
  }

  // Fetch related data
  const [events, trending] = await Promise.all([
    getEventsByCategory(category.slug),
    getTrendingEventsByCategory(category.slug),
  ])

  // Enrich category with design data (similar to the hook)
  const categoryWithDesign = {
    ...category,
    title: category.name,
    tagline: category.tagline || "Explore experiences",
    color: category.color || "#ccff00",
    spots: category.spotLabel || "Explore",
    gradient: CATEGORY_GRADIENTS[category.name?.toLowerCase()] || category.gradient || "from-white to-gray-500",
    children: (category.subCategories || []).map((sub: any) => ({
      ...sub,
      image: sub.image || "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800",
    })),
    events,
    trending,
  }

  return <CategoryDetailClient category={categoryWithDesign} />
}
