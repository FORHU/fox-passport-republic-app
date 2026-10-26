/**
 * What to tell the person when a partnership request fails. A 4xx from the API
 * carries a sentence written for them (the request was wrong, or not theirs to
 * make); anything else, a 5xx or no answer at all, gets `fallback`, so server
 * internals never reach the screen.
 */
export function proposalErrorMessage(error: unknown, fallback: string): string {
  const response = (
    error as { response?: { status?: number; data?: { message?: unknown } } }
  )?.response;
  const status = response?.status ?? 0;
  const message = response?.data?.message;
  if (status >= 400 && status < 500 && typeof message === "string" && message) {
    return message;
  }
  return fallback;
}

export const CREATE_PROPOSAL_FALLBACK =
  "Couldn't send your proposal. Check your connection and try again.";
