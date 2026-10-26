import {
  getCategories,
  getEventsByCategory,
  getVenuesByCategory,
} from "@/shared/lib/server/data";
import type { Metadata } from "next";
import CategoriesClient from "./_components/CategoriesClient";
import MobileCategoryGrid from "@/features/category/components/MobileCategoryGrid";

export const metadata: Metadata = {
  title: "Event categories",
  description:
    "Browse every kind of event on FoxPassport: weddings, birthdays, corporate nights, concerts and more, with the venues, gear and crew to book for each.",
  // `?type=` filters this same page.
  alternates: { canonical: "/categories" },
};

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
