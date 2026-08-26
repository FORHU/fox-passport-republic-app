import {
  getCategories,
  getEventsByCategory,
  getVenuesByCategory,
} from "@/shared/lib/server/data";
import CategoriesClient from "@/features/category/components/CategoriesClient";
import MobileCategoryGrid from "@/features/category/components/MobileCategoryGrid";

// Skip static generation for this page - it fetches dynamic data
export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const type = params.type;
  // Independent of each other, so awaiting them in sequence made three round
  // trips wait on each other for no reason.
  const [categories, events, venues] = await Promise.all([
    getCategories(),
    type ? getEventsByCategory(type) : Promise.resolve([]),
    type ? getVenuesByCategory(type) : Promise.resolve([]),
  ]);

  return (
    <>
      <MobileCategoryGrid />
      <div className="hidden lg:block">
        <CategoriesClient
          initialCategories={categories}
          initialEvents={events}
          initialVenues={venues}
          initialType={type}
        />
      </div>
    </>
  );
}
