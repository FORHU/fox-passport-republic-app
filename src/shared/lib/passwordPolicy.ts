import { z } from "zod";

/**
 * The one password policy, for sign-up, reset and change-password alike.
 * Mirrors the API's `src/utils/password-policy.ts`, which enforces it on every
 * route that sets a password; change both together (BUG-27).
 */
export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;

const RULES: ReadonlyArray<{ test: RegExp; message: string }> = [
  { test: /[A-Z]/, message: "Password must contain at least one uppercase letter" },
  { test: /[a-z]/, message: "Password must contain at least one lowercase letter" },
  { test: /\d/, message: "Password must contain at least one digit" },
  {
    test: /[^A-Za-z0-9\s]/,
    message: "Password must contain at least one special character",
  },
];

export const PASSWORD_HINT = `${PASSWORD_MIN}+ chars · uppercase · lowercase · digit · special character`;

/** The first rule a password breaks, or `null` when it meets the policy. */
export function passwordPolicyError(password: string): string | null {
  if (password.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters`;
  }
  if (password.length > PASSWORD_MAX) {
    return `Password must be at most ${PASSWORD_MAX} characters`;
  }
  return RULES.find((r) => !r.test.test(password))?.message ?? null;
}

export const passwordSchema = RULES.reduce(
  (schema, rule) => schema.regex(rule.test, rule.message),
  z
    .string()
    .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
    .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters`),
);
