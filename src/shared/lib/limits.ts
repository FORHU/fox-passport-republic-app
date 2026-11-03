import { z } from "zod";

// The agreed field limits. Kept in step with the API's utils/limits.ts.
export const NAME_MAX = 100;
export const DESCRIPTION_MAX = 500;
export const LONG_DESCRIPTION_MAX = 2000;
// Event descriptions run 100-500 words in the builder.
export const EVENT_DESCRIPTION_MAX = 5000;
export const QUANTITY_MAX = 100_000;
export const PRICE_MAX = 9_999_999.99;

const fmt = (n: number) => n.toLocaleString("en-US");

export const NAME_MESSAGE = `Names can be up to ${NAME_MAX} characters.`;
export const QUANTITY_MESSAGE = `Enter a whole number from 1 to ${fmt(QUANTITY_MAX)}.`;
export const PRICE_MESSAGE = `Enter a price from 0 to ${fmt(PRICE_MAX)} with at most 2 decimals.`;

export const descriptionMessage = (max: number) =>
  `Descriptions can be up to ${fmt(max)} characters.`;

/** A required name: trimmed, 1-100 characters. */
export const nameField = (required: string) =>
  z.string().trim().min(1, required).max(NAME_MAX, NAME_MESSAGE);

/** A description, up to 500 characters unless the field is long. */
export const descriptionField = (max = DESCRIPTION_MAX) =>
  z.string().max(max, descriptionMessage(max));

/** A quantity, capacity or guest count: a whole number, 1-100,000. */
export const quantityField = () =>
  z
    .number(QUANTITY_MESSAGE)
    .int(QUANTITY_MESSAGE)
    .min(1, QUANTITY_MESSAGE)
    .max(QUANTITY_MAX, QUANTITY_MESSAGE);

/** A price: 0 to 9,999,999.99 with at most 2 decimals. */
export const priceField = () =>
  z
    .number(PRICE_MESSAGE)
    .min(0, "Prices cannot be negative.")
    .max(PRICE_MAX, PRICE_MESSAGE)
    .refine((v) => Math.round(v * 100) / 100 === v, PRICE_MESSAGE);

// Live messages for the form inputs: the message to show, or null when the value is fine.
// They run the same schemas as above, so the forms and the schemas cannot disagree.
const firstMessage = (schema: z.ZodType, value: unknown) => {
  const result = schema.safeParse(value);
  return result.success ? null : result.error.issues[0].message;
};

/** Name input. An empty name is not flagged here; "required" is the form's own rule. */
export const nameError = (value: string) =>
  value.trim() === "" ? null : firstMessage(nameField("Name is required"), value);

export const descriptionError = (value: string, max = DESCRIPTION_MAX) =>
  firstMessage(descriptionField(max), value);

/** Quantity or capacity typed into a text/number input. */
export const quantityError = (raw: string | number) => {
  if (raw === "" || raw === undefined) return null;
  return firstMessage(quantityField(), Number(raw));
};

/** Price typed into a number input. */
export const priceError = (raw: string | number) => {
  if (raw === "" || raw === undefined) return null;
  return firstMessage(priceField(), Number(raw));
};

/** The first limit a form's values break, for the save and publish gates. */
export const firstLimitError = (v: {
  name?: string;
  description?: string;
  descriptionMax?: number;
  quantity?: string | number;
  price?: string | number;
}) =>
  (v.name !== undefined ? nameError(v.name) : null) ??
  (v.description !== undefined
    ? descriptionError(v.description, v.descriptionMax)
    : null) ??
  (v.quantity !== undefined ? quantityError(v.quantity) : null) ??
  (v.price !== undefined ? priceError(v.price) : null);
