import { getApiErrorMessage } from "@/shared/lib/apiError";

/**
 * What to tell the person when a partnership request fails. A 4xx from the API
 * carries a sentence written for them (the request was wrong, or not theirs to
 * make); anything else, a 5xx or no answer at all, gets `fallback`, so server
 * internals never reach the screen.
 */
export const proposalErrorMessage = getApiErrorMessage;

export const CREATE_PROPOSAL_FALLBACK =
  "Couldn't send your proposal. Check your connection and try again.";
