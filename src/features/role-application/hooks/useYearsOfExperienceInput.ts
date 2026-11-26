"use client";

import { useState } from "react";
import {
  BASE_MAX_YEARS_OF_EXPERIENCE,
  exceedsMaxYears,
  maxYearsMessage,
  yearsOfExperienceError,
} from "../utils/yearsOfExperience";

/**
 * Keeps a Years of Experience field within `max` as it is typed: 30, or 50
 * once "more than 30 years" is ticked (api#423). `accept(next)` is false for
 * an edit that goes over it; the caller then keeps the field's current value,
 * and `error` explains why until the next accepted edit.
 */
export function useYearsOfExperienceInput(max = BASE_MAX_YEARS_OF_EXPERIENCE) {
  // The limit an edit was last refused at. Ticking the box raises the limit,
  // and the old refusal no longer applies.
  const [refusedAt, setRefusedAt] = useState<number | null>(null);
  // Set once an edit over 30 is refused: only then is "I have more than 30
  // years" offered. It stays, so the box doesn't vanish on the next keystroke.
  const [offerClaim, setOfferClaim] = useState(false);

  const accept = (next: string) => {
    const over = exceedsMaxYears(next, max);
    setRefusedAt(over ? max : null);
    if (over && max === BASE_MAX_YEARS_OF_EXPERIENCE) setOfferClaim(true);
    return !over;
  };

  const error = (value: string) =>
    refusedAt === max
      ? maxYearsMessage(max)
      : yearsOfExperienceError(value, max);

  return { accept, error, offerClaim };
}
