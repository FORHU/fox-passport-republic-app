import { useSearchParams } from "next/navigation";
import { useInventoryBuilder } from "./useInventoryBuilder";
import { useServiceBuilder } from "@/hooks/services/useServiceBuilder";

/**
 * Entry point hook for the listing builder.
 * Delegates to either useInventoryBuilder or useServiceBuilder
 * based on the 'type' query parameter.
 */
export function useListingBuilder() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const inventoryBuilder = useInventoryBuilder();
  const servicesBuilder = useServiceBuilder();

  // Return the appropriate builder interface
  return type === "service" ? servicesBuilder : inventoryBuilder;
}
