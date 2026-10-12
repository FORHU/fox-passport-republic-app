import api from "@/shared/lib/axios";

export async function fetchTemplateAvailability(
  templateId: string,
): Promise<{ bookedDates: string[] }> {
  const resp = await api.get(`/bookings/availability?templateId=${templateId}`);
  return resp.data?.data ?? { bookedDates: [] };
}

export async function fetchServiceAvailability(
  serviceId: string,
  location?: string,
): Promise<{ bookedDates: string[]; travelBlockedDates: string[] }> {
  const resp = await api.get("/service/bookings/availability", {
    params: { serviceId, location: location || undefined },
  });
  const data = resp.data?.data;
  return {
    bookedDates: data?.bookedDates ?? [],
    travelBlockedDates: data?.travelBlockedDates ?? [],
  };
}

export async function fetchAssetAvailability(assetId: string): Promise<{
  bookedRanges: { startDate: string; endDate: string; bookedQty: number }[];
  totalQty: number;
}> {
  const resp = await api.get(`/asset/bookings/availability?assetId=${assetId}`);
  return resp.data?.data ?? { bookedRanges: [], totalQty: 0 };
}
