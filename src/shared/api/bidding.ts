import api from "@/shared/lib/axios";

export const getOpenSlots = async (categoryId?: string) => {
  const params = categoryId ? { categoryId } : {};
  const response = await api.get("/bids/open-slots", { params });
  return response.data;
};

export const getEventBids = async (eventId: string) => {
  const response = await api.get(`/bids/event/${eventId}`);
  return response.data;
};

export const submitBid = async (data: {
  eventId: string;
  proposedServiceId: string;
  proposedPrice: number;
  message?: string;
  targetServiceId?: string;
}) => {
  const response = await api.post("/bids", data);
  return response.data;
};

export const acceptBid = async (bidId: string) => {
  const response = await api.post(`/bids/${bidId}/accept`);
  return response.data;
};
