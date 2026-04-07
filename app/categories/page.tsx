import { getCategories, getEventsByCategory, getVenuesByCategory } from '@/lib/server/data';
import CategoriesClient from '@/components/categories/CategoriesClient';

// Skip static generation for this page - it fetches dynamic data
export const dynamic = 'force-dynamic';

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const type = searchParams.type;
  const categories = await getCategories();
  const events = type ? await getEventsByCategory(type) : [];
  const venues = type ? await getVenuesByCategory(type) : [];

  return (
    <CategoriesClient
      initialCategories={categories}
      initialEvents={events}
      initialVenues={venues}
      initialType={type}
    />
  );
}
