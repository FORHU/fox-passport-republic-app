import {
  LONG_DESCRIPTION_MAX,
  QUANTITY_MAX,
  QUANTITY_MESSAGE,
  descriptionMessage,
} from "@/shared/lib/limits";

// The Investment Studio wizard's step rules. Step 2's are the API's own
// (investment.controller.ts), so a step that passes here is not rejected later.
export const TITLE_MIN = 3;
export const TITLE_MAX = 120;
export const DESCRIPTION_MIN = 10;

export type InvestmentModality = "physical_inventory" | "venue_equity";

/** The fields a step can flag. `location` stands for the map pin and radius. */
export type WizardField =
  | "title"
  | "inventoryCategory"
  | "quantityTotal"
  | "description"
  | "monetaryValue"
  | "revenueSharePercent"
  | "targetVenue"
  | "location";

export type StepErrors = Partial<Record<WizardField, string>>;

/** The step each field is entered on. */
export const FIELD_STEP: Record<WizardField, number> = {
  title: 2,
  inventoryCategory: 2,
  quantityTotal: 2,
  description: 2,
  monetaryValue: 2,
  revenueSharePercent: 2,
  targetVenue: 3,
  location: 3,
};

interface CheckedForm {
  title: string;
  description: string;
  inventoryCategory?: string | null;
  quantityTotal: number;
  monetaryValue: number;
  revenueSharePercent: number;
  targetVenue: unknown;
  location: { lat: number; lng: number; deliveryRadiusKm: number };
}

const isCoordinate = (n: unknown) => typeof n === "number" && !Number.isNaN(n);

/** What is wrong on `step`, by field. Empty when the step can be left. */
export function stepErrors(
  form: CheckedForm,
  modality: InvestmentModality,
  step: number,
): StepErrors {
  const errors: StepErrors = {};
  const physical = modality === "physical_inventory";

  if (step === 2) {
    const title = form.title.trim();
    if (title.length < TITLE_MIN) {
      errors.title = physical
        ? "Enter the equipment name (at least 3 characters), e.g. 500 Chiavari Chairs."
        : "Enter an agreement title of at least 3 characters.";
    } else if (title.length > TITLE_MAX) {
      errors.title = `Titles can be up to ${TITLE_MAX} characters.`;
    }

    if (physical) {
      if (!form.inventoryCategory) errors.inventoryCategory = "Choose a category.";
      const q = form.quantityTotal;
      if (!Number.isInteger(q) || q < 1 || q > QUANTITY_MAX) {
        errors.quantityTotal = QUANTITY_MESSAGE;
      }
    } else {
      if (form.monetaryValue < 0) {
        errors.monetaryValue = "Capital pledged cannot be negative.";
      }
      if (form.revenueSharePercent <= 0 || form.revenueSharePercent > 100) {
        errors.revenueSharePercent = "Revenue share must be between 1% and 100%.";
      }
    }

    const description = form.description.trim();
    if (description.length < DESCRIPTION_MIN) {
      errors.description = physical
        ? "Add a description of at least 10 characters: size, materials, power needs or handling notes."
        : "Describe what the capital covers in at least 10 characters.";
    } else if (description.length > LONG_DESCRIPTION_MAX) {
      errors.description = descriptionMessage(LONG_DESCRIPTION_MAX);
    }
  }

  if (step === 3) {
    if (!physical) {
      if (!form.targetVenue) {
        errors.targetVenue = "Search for and select the venue you're backing.";
      }
    } else if (!isCoordinate(form.location.lat) || !isCoordinate(form.location.lng)) {
      errors.location = "Pick the depot location on the map.";
    } else if (form.location.deliveryRadiusKm < 1) {
      errors.location = "Set a dispatch / coverage radius of at least 1 km.";
    }
  }

  return errors;
}

/** The first step before `upTo` that can't be left yet, or `upTo` itself. */
export function firstInvalidStep(
  form: CheckedForm,
  modality: InvestmentModality,
  upTo: number,
): number {
  for (let s = 2; s < upTo; s++) {
    if (Object.keys(stepErrors(form, modality, s)).length > 0) return s;
  }
  return upTo;
}

// The API's names for the wizard's fields, where they differ.
const API_FIELD: Record<string, WizardField> = {
  targetVenueId: "targetVenue",
  lat: "location",
  lng: "location",
  deliveryRadiusKm: "location",
};

/** The API's 400 `fields` that belong to a wizard field, keyed by that field. */
export function apiFieldErrors(error: unknown): StepErrors {
  const response = (
    error as { response?: { status?: number; data?: unknown } } | null
  )?.response;
  if (response?.status !== 400) return {};
  const fields = (response.data as { fields?: unknown } | undefined)?.fields;
  if (!Array.isArray(fields)) return {};

  const errors: StepErrors = {};
  for (const f of fields as { field?: unknown; message?: unknown }[]) {
    if (typeof f?.field !== "string" || typeof f.message !== "string") continue;
    const key = (API_FIELD[f.field] ?? f.field) as WizardField;
    if (key in FIELD_STEP && !errors[key]) errors[key] = f.message;
  }
  return errors;
}
