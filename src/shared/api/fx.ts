import api from "@/shared/lib/axios";

export interface FxRates {
  base: string;
  rates: Record<string, number>;
  fetchedAt: number;
  currencies: string[];
}

export async function fetchExchangeRates(base = "PHP"): Promise<FxRates> {
  const resp = await api.get("/fx/rates", { params: { base } });
  return resp.data?.data ?? resp.data;
}
