export const dynamic = 'force-dynamic';

import { getCategoryBySlug, getEventsByCategory, getVenuesByCategory } from '@/lib/server/data'
import CategoryDetailClient from '@/components/categories/CategoryDetailClient'

interface CategoryDetailPageProps {
  params: { id: string }
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const category = await getCategoryBySlug(params.id)

  if (!category) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-3xl font-bold text-white mb-4">Category Not Found</h1>
        <a href="/" className="px-6 py-3 rounded-xl bg-[#ccff00] text-black font-bold hover:bg-[#b3e600] transition-colors">
          Go Home
        </a>
      </div>
    )
  }

  // Fetch related data
  const events = await getEventsByCategory(category.slug)
  const venues = await getVenuesByCategory(category.slug)

  // Enrich category with design data (similar to the hook)
  const categoryWithDesign = {
    ...category,
    title: category.name,
    tagline: category.tagline || "Explore experiences",
    color: category.color || "#ccff00",
    spots: category.spotLabel || "Explore",
    children: (category.subCategories || []).map((sub: any) => ({
      ...sub,
      image: sub.image || "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800",
    })),
    events,
    venues,
  }

  return <CategoryDetailClient category={categoryWithDesign} />
}
