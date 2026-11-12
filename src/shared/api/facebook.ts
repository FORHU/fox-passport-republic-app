import api from "@/shared/lib/axios";

/**
 * Sharing FoxPassport video posts to a Facebook Page the Foxer manages. The
 * API holds every Facebook token; nothing here ever sees one.
 */

export interface FacebookConnection {
  /** False when the server has no Meta app configured: hide or explain the feature. */
  available: boolean;
  connected: boolean;
  status: "active" | "needs_reconnect" | null;
  facebookUserName: string | null;
  page: { id: string; name: string | null } | null;
  userTokenExpiresAt: string | null;
}

export interface FacebookPage {
  id: string;
  name: string;
  /** The Foxer may post on this Page (Meta's CREATE_CONTENT task). */
  canPublish: boolean;
}

export type FacebookShareStatus =
  | "publishing"
  | "processing"
  | "published"
  | "failed";

export interface FacebookShare {
  id: string;
  postId: string;
  pageId: string;
  pageName: string | null;
  status: FacebookShareStatus;
  permalinkUrl: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  attempts: number;
  canRetry: boolean;
}

const BASE = "/integrations/facebook";

export const getFacebookConnection = async (): Promise<FacebookConnection> =>
  (await api.get(BASE)).data.data;

/** The Meta permission dialog to send the browser to. */
export const getFacebookConnectUrl = async (): Promise<string> =>
  (await api.get(`${BASE}/connect-url`)).data.data.url;

export const getFacebookPages = async (): Promise<FacebookPage[]> =>
  (await api.get(`${BASE}/pages`)).data.data;

export const selectFacebookPage = async (
  pageId: string,
): Promise<FacebookConnection> =>
  (await api.put(`${BASE}/page`, { pageId })).data.data;

export const disconnectFacebook = async (): Promise<FacebookConnection> =>
  (await api.delete(BASE)).data.data;

/**
 * Sends a post's video to the selected Page. Resolves with the share (which
 * may itself say `failed`); rejects for a request the API refused, e.g. 409
 * when not connected or already shared. A 409 for an existing share carries
 * that share in `response.data.data`.
 */
export const shareToFacebook = async (postId: string): Promise<FacebookShare> =>
  (await api.post(`${BASE}/shares`, { postId })).data.data;

export const getFacebookShare = async (
  postId: string,
): Promise<FacebookShare | null> =>
  (await api.get(`${BASE}/shares/${postId}`)).data.data;

/** The API's stable error code on a failed request, if it sent one. */
export const facebookErrorCode = (error: unknown): string | undefined =>
  (error as { response?: { data?: { code?: unknown } } })?.response?.data
    ?.code as string | undefined;

/** The share a 409 (already shared / in progress) carries. */
export const facebookErrorShare = (error: unknown): FacebookShare | null =>
  ((error as { response?: { data?: { data?: unknown } } })?.response?.data
    ?.data as FacebookShare | null) ?? null;

/** Where the Foxer connects Facebook and chooses a Page. */
export const FACEBOOK_SETTINGS_PATH = "/user/settings?section=connections";
