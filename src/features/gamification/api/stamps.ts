import { getUserPassport } from "./passport";

export interface Stamp {
  id: string;
  eventName: string;
  earnedAt: string;
  imageUrl: string | null;
}

export async function fetchStamps(userId: string): Promise<Stamp[]> {
  const passport = await getUserPassport(userId);
  if (!passport || !passport.stamps) return [];
  
  return passport.stamps.map((s) => ({
    id: s.id,
    eventName: s.eventName,
    earnedAt: s.eventDate, // eventDate is the ISO string from the API
    imageUrl: s.imageUrl,
  }));
}
