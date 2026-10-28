import ListingBuilderClient from "./_components/ListingBuilderClient";
import { studioAccessDenied } from "@/shared/lib/server/studioAccess";

export default async function ListingBuilder({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  // One page, two Studios: `?type=service` builds a service, anything else
  // gear (the same choice ListingBuilderClient makes).
  const { type } = await searchParams;
  const denied = await studioAccessDenied(
    type === "service" ? "service" : "gear",
  );
  return denied ?? <ListingBuilderClient />;
}
