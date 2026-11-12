/**
 * Better Auth's `?error=` on the Google/Facebook callback when that email
 * already belongs to an account whose own email isn't verified: it won't join
 * the two until it is (`requireLocalEmailVerified`). Signing in with the
 * password then asks for the code (api#235), after which the provider links.
 */
export const ACCOUNT_NOT_LINKED = "account_not_linked";

export const ACCOUNT_NOT_LINKED_MESSAGE =
  "This email already has a Fox Passport account that isn't verified yet. Sign in with your email and password (or use Forgot password if you don't have one) and enter the code we email you, then you can continue with Google or Facebook.";

/** Long enough to read the message above. */
export const ACCOUNT_NOT_LINKED_TOAST_MS = 10_000;
