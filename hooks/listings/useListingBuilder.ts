import { useSearchParams } from "next/navigation";
import { useInventoryBuilder } from "./useInventoryBuilder";
import { useServicesBuilder } from "./useServicesBuilder";

/**
 * Entry point hook for the listing builder.
 * Delegates to either useInventoryBuilder or useServicesBuilder
 * based on the 'type' query parameter.
 */
export function useListingBuilder() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const inventoryBuilder = useInventoryBuilder();
  const servicesBuilder = useServicesBuilder();

  // Return the appropriate builder interface
  return type === "service" ? servicesBuilder : inventoryBuilder;
}
