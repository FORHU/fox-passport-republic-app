import api from "@/shared/lib/axios";

/** Mirrors the API's ID_TYPES (identity-verification.service.ts). */
export const ID_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's license" },
  { value: "national_id", label: "National ID card" },
  { value: "other", label: "Other government ID" },
] as const;
export type IdType = (typeof ID_TYPES)[number]["value"];

export const idTypeLabel = (value: string) =>
  ID_TYPES.find((t) => t.value === value)?.label ?? value;

export type IdentityStatus =
  "pending" | "approved" | "rejected" | "revision_requested";

export interface IdentitySubmission {
  id: string;
  idType: IdType;
  status: IdentityStatus;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface MyIdentity {
  /** Set once an admin approved an ID — drives the "Verified" badge. */
  verifiedAt: string | null;
  latest: IdentitySubmission | null;
}

interface StoredFile {
  url: string;
  name: string;
  type: string;
}

/** A submission as the admin queue sees it — with the files to review. */
export interface IdentityReviewItem extends IdentitySubmission {
  user: { id: string; name: string; email: string; username: string | null };
  idFile: StoredFile;
  selfieFile: StoredFile | null;
  reviewer: { id: string; name: string } | null;
}

/** Root of every identity query — the `identity` socket topic invalidates it. */
export const IDENTITY_QUERY_KEY = ["identity"] as const;

export async function fetchMyIdentity(): Promise<MyIdentity> {
  const res = await api.get("/identity-verification/me");
  return res.data.data;
}

export async function submitIdentity(input: {
  idType: IdType;
  idFile: File;
  selfieFile?: File | null;
}): Promise<IdentitySubmission> {
  const form = new FormData();
  form.append("idType", input.idType);
  form.append("idFile", input.idFile);
  if (input.selfieFile) form.append("selfieFile", input.selfieFile);
  // No Content-Type: axios lets the browser set it, with the boundary.
  const res = await api.post("/identity-verification", form);
  return res.data.data;
}

export async function fetchIdentityQueue(
  status?: IdentityStatus,
): Promise<IdentityReviewItem[]> {
  const res = await api.get("/identity-verification", {
    params: status ? { status } : {},
  });
  return res.data.data ?? [];
}

export async function reviewIdentity(
  id: string,
  decision: "approved" | "rejected",
  reason?: string,
): Promise<void> {
  await api.patch(`/identity-verification/${id}/review`, { decision, reason });
}
