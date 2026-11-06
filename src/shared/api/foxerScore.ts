import api from "@/shared/lib/axios";

export interface FoxerScoreBreakdown {
  ratingScore: number; // 0 to 45
  volumeScore: number; // 0 to 20
  responsivenessScore: number; // 0 to 15
  reliabilityScore: number; // 0 to 15
  trustScore: number; // 0 to 5
}

export interface FoxerOperationalMetrics {
  starRating: number;
  rawReviewCount: number;
  isNew: boolean;
  bayesianRating: number;
  completedBookings: number;
  responsivenessRate: number;
  cancellationRate: number;
  isIdentityVerified: boolean;
  foxerLevel: number;
}

export interface FoxerScoreData {
  foxerScore: number; // 0 to 100
  breakdown: FoxerScoreBreakdown;
  operationalMetrics: FoxerOperationalMetrics;
}

export interface PublicFoxerProfileReputation {
  starRating: number | null;
  reviewCount: number;
  isNew: boolean;
  completedBookings: number;
  responseRatePercent: number;
  cancellationRatePercent: number;
  isIdentityVerified: boolean;
  labels: string[];
}

export async function getMyFoxerScore(): Promise<FoxerScoreData> {
  const res = await api.get<{ success: boolean; data: FoxerScoreData }>(
    "/v1/foxer-score/me",
  );
  return res.data.data;
}

export async function getPublicFoxerReputation(
  userId: string,
): Promise<PublicFoxerProfileReputation> {
  const res = await api.get<{
    success: boolean;
    data: PublicFoxerProfileReputation;
  }>(`/v1/foxer-score/${userId}`);
  return res.data.data;
}

