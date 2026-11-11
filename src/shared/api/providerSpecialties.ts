import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

export interface ProviderSpecialty {
  slug: string;
  name: string;
}

/**
 * Every specialty a Provider can declare, from the API's catalog: the same list
 * the API checks applications and profile edits against, so a form never
 * offers a value it would refuse.
 */
export async function getProviderSpecialties(): Promise<ProviderSpecialty[]> {
  const res = await api.get("/categories/provider-specialties");
  return res.data?.data ?? [];
}

export function useProviderSpecialties() {
  return useQuery<ProviderSpecialty[]>({
    queryKey: ["categories", "provider-specialties"],
    queryFn: getProviderSpecialties,
    staleTime: 1000 * 60 * 5,
  });
}
