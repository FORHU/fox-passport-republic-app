import { describe, it, expect } from "vitest";
import {
  PASSWORD_MAX,
  PASSWORD_MIN,
  passwordPolicyError,
  passwordSchema,
} from "../passwordPolicy";
import { resetPasswordSchema, signupSchema } from "../schema";

/** A valid password of exactly `n` characters (n >= 4). */
const ofLength = (n: number) => "Aa1!" + "x".repeat(n - 4);

describe("password policy (BUG-27): 12–128 chars, all four character types", () => {
  it.each([
    ["12 characters with every type", ofLength(PASSWORD_MIN)],
    ["128 characters", ofLength(PASSWORD_MAX)],
    ["any special, not only @$!%*?&", "Correct-Horse9"],
  ])("accepts %s", (_, pw) => {
    expect(passwordPolicyError(pw)).toBeNull();
    expect(passwordSchema.safeParse(pw).success).toBe(true);
  });

  it.each([
    ["11 characters", ofLength(PASSWORD_MIN - 1), /at least 12/],
    ["129 characters", ofLength(PASSWORD_MAX + 1), /at most 128/],
    ["no uppercase", "aa1!xxxxxxxxxx", /uppercase/],
    ["no lowercase", "AA1!XXXXXXXXXX", /lowercase/],
    ["no digit", "Aa!!xxxxxxxxxx", /digit/],
    ["no special (a space does not count)", "Aa1 xxxxxxxxxx", /special/],
  ])("rejects %s", (_, pw, message) => {
    expect(passwordPolicyError(pw)).toMatch(message);
    const parsed = passwordSchema.safeParse(pw);
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0].message).toMatch(message);
  });

  it("applies the same rule to sign-up and reset", () => {
    const weak = "Short1!a";
    expect(
      signupSchema.safeParse({
        email: "a@b.co",
        password: weak,
        confirmPassword: weak,
        username: "valid_user",
        name: "Ana",
      }).success,
    ).toBe(false);
    expect(
      resetPasswordSchema.safeParse({
        otpCode: "123456",
        newPassword: weak,
        confirmPassword: weak,
      }).success,
    ).toBe(false);
    const strong = ofLength(PASSWORD_MIN);
    expect(
      resetPasswordSchema.safeParse({
        otpCode: "123456",
        newPassword: strong,
        confirmPassword: strong,
      }).success,
    ).toBe(true);
  });
});
