const RATE_UNITS: Record<string, string> = {
  hourly: "hr",
  nightly: "night",
  weekly: "week",
  monthly: "month",
};

/**
 * A venue's stored `billingRate` as the unit after its price ("/ day",
 * "/night"). Every venue price reads it from here, so the map, the venue
 * page and the booking page always agree. `daily`, missing or unknown
 * rates are "day", the unit `pricePerDay` and the booking total use.
 */
export function venueRateUnit(billingRate?: string | null): string {
  return (billingRate && RATE_UNITS[billingRate]) || "day";
}
