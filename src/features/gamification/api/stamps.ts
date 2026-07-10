import api from '@/shared/lib/axios';

export interface Stamp {
  id: string;
  bookingId?: string;
  userId?: string;
  eventName: string;
  imageUrl?: string;
  earnedAt: string; // ISO date string
  // Optional enrichment returned by the API
  eventDate?: string;
  location?: string;
  xpEarned?: number;
}

export async function fetchStamps(userId: string): Promise<Stamp[]> {
  const resp = await api.get(`/stamps?userId=${encodeURIComponent(userId)}`);
  return resp.data?.data ?? resp.data ?? [];
}

export async function createStamp(bookingId: string): Promise<Stamp | null> {
  try {
    const resp = await api.post('/stamps', { bookingId });
    return resp.data?.data ?? null;
  } catch (e: any) {
    // Duplicate stamp (or already-earned) is handled by the backend constraint.
    // Treat 409 / 400 as a no-op so the flow stays smooth.
    const status = e?.response?.status;
    if (status === 409 || status === 400) {
      return null;
    }
    throw e;
  }
}
