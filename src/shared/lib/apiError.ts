type ErrorResponse = {
  status?: number;
  data?: { message?: unknown; error?: unknown } | string;
};

// Text written for developers, not people: Joi's quoted field names ("content" must ...),
// its ref: placeholders, and anything that reads like a stack trace.
const TECHNICAL = /^"[\w.[\]]+" |ref:|\bat \S+ \(|\bTypeError\b|\bPrisma|\bECONN|\bundefined\b/;

const pick = (data: ErrorResponse["data"]) => {
  const text = typeof data === "string" ? data : (data?.message ?? data?.error);
  return typeof text === "string" ? text.trim() : "";
};

/**
 * What to tell the person when a request fails. A 4xx from the API carries a sentence
 * written for them; anything else (a 5xx, no answer, a non-axios error) or text that reads
 * like developer output gets `fallback`, so server internals never reach the screen.
 * Never returns an axios `Error.message` such as "Request failed with status code 400".
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: ErrorResponse } | null)?.response;
  const status = response?.status ?? 0;
  if (status < 400 || status >= 500) return fallback;
  const message = pick(response?.data);
  return message && !TECHNICAL.test(message) ? message : fallback;
}

const UPLOAD_TOO_LARGE = "That file is too large. Choose a smaller one and try again.";
const UPLOAD_NO_CONNECTION = "Couldn't reach the server. Check your connection and try again.";
const UPLOAD_GENERIC = "Couldn't upload that file. Try a different file.";

/**
 * Why an upload failed, in words that say what to do. `direct` marks the browser-to-storage
 * step: its errors are XML from the bucket, never a message the API wrote, so they are
 * mapped by status. API errors keep the API's own sentence when it has one.
 */
export function uploadErrorMessage(error: unknown, direct = false): string {
  const status = (error as { response?: ErrorResponse } | null)?.response?.status ?? 0;
  if (!status) return UPLOAD_NO_CONNECTION;
  if (status === 413) return UPLOAD_TOO_LARGE;
  if (direct) {
    return status === 403
      ? "The upload was refused. Choose a JPG, PNG, WebP or GIF image within the size limit."
      : UPLOAD_GENERIC;
  }
  return getApiErrorMessage(error, UPLOAD_GENERIC);
}
