import { z } from "zod";
import {
  EVENT_DESCRIPTION_MAX,
  LONG_DESCRIPTION_MAX,
  descriptionField,
  nameField,
  priceField,
  quantityField,
} from "./limits";
import { requiredPassword } from "./passwordPolicy";

// --- PROFILE FIELD SCHEMAS ---
// Kept in step with the API's PUT /profile validation (profile.controller.ts).
// The phone schema lives in ./phone, with the metadata it needs.

// Saved lowercase; letters, numbers, `_` and `.` — no spaces or symbols.
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Usernames need 3–30 characters.")
  .max(30, "Usernames need 3–30 characters.")
  .regex(
    /^[a-z0-9._]+$/,
    "Usernames can only use letters, numbers, dots and underscores.",
  );

// --- AUTH SCHEMAS ---
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const CONFIRM_PASSWORD_REQUIRED = "Confirm your password";
export const PASSWORDS_DO_NOT_MATCH = "Passwords do not match";
export const TERMS_REQUIRED = "You must accept the Terms and Privacy Policy";
/** The one toast after a failed sign-up submit; the fields carry the detail. */
export const FIX_HIGHLIGHTED_FIELDS = "Please fix the highlighted fields";

/**
 * "Passwords do not match" on `confirmPassword`. `when` lets it run even while
 * other fields are invalid (zod skips object refinements otherwise, so an
 * empty-form submit used to show nothing here), and skips an empty confirm,
 * which `min(1)` already reports.
 */
const confirmMismatchIssue = {
  message: PASSWORDS_DO_NOT_MATCH,
  path: ["confirmPassword"],
  when: ({ value }: { value: unknown }) => {
    const confirm = (value as { confirmPassword?: unknown } | undefined)
      ?.confirmPassword;
    return typeof confirm === "string" && confirm.length > 0;
  },
};

export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .pipe(z.email("Enter a valid email address")),
    password: requiredPassword("Password is required"),
    confirmPassword: z.string().min(1, CONFIRM_PASSWORD_REQUIRED),
    username: z.string().min(1, "Username is required").pipe(usernameSchema),
    name: nameField("Full name is required").regex(/^[A-Za-z\s'-]+$/, "Name can only contain letters"),
    mobileNumber: z.string().optional(),
    acceptedTerms: z.boolean().refine((v) => v === true, TERMS_REQUIRED),
  })
  .refine((d) => d.password === d.confirmPassword, confirmMismatchIssue);

export type SignupFormData = z.infer<typeof signupSchema>;

// --- PASSWORD RESET / EMAIL VERIFICATION SCHEMAS ---
export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    otpCode: z.string().length(6, "Code must be 6 digits"),
    newPassword: requiredPassword("New password is required"),
    confirmPassword: z.string().min(1, CONFIRM_PASSWORD_REQUIRED),
  })
  .refine((d) => d.newPassword === d.confirmPassword, confirmMismatchIssue);

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const verifyEmailSchema = z.object({
  otpCode: z.string().length(6, "Code must be 6 digits"),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

// --- ASSET / INVENTORY SCHEMAS ---
export const createAssetSchema = z.object({
  name: nameField("Asset name is required"),
  description: descriptionField().min(
    10,
    "Description must be at least 10 characters",
  ),
  category: z.string().min(1, "Category is required"),
  price: priceField(),
  quantity: quantityField().optional(),
});

export type CreateAssetFormData = z.infer<typeof createAssetSchema>;

export const updateAssetSchema = createAssetSchema.extend({
  id: z.string().min(1, "Asset ID is required"),
});

export type UpdateAssetFormData = z.infer<typeof updateAssetSchema>;

// --- SERVICE SCHEMAS ---
export const createServiceSchema = z.object({
  name: nameField("Service name is required"),
  description: descriptionField().min(
    10,
    "Description must be at least 10 characters",
  ),
  category: z.string().min(1, "Category is required"),
  price: priceField(),
  billingRate: z
    .enum(["hourly", "daily", "weekly", "monthly"])
    .default("hourly"),
  status: z
    .enum(["draft", "pending", "available", "paused", "archived", "rejected"])
    .default("draft"),
});

export type CreateServiceFormData = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = createServiceSchema.extend({
  id: z.string().min(1, "Service ID is required"),
});

export type UpdateServiceFormData = z.infer<typeof updateServiceSchema>;

// --- EVENT SCHEMAS ---
const eventFields = z.object({
  name: nameField("Event name is required"),
  description: descriptionField(EVENT_DESCRIPTION_MAX).optional(),
  eventType: z.string().min(1, "Event type is required"),
  venueId: z.string().min(1, "Venue is required"),
  startDatetime: z.date(),
  endDatetime: z.date(),
  maxAttendees: quantityField(),
  totalPrice: priceField().optional(),
  status: z
    .enum(["draft", "pending", "ongoing", "completed", "cancelled"])
    .default("draft"),
});

export const END_BEFORE_START_MESSAGE = "The end date must be after the start date.";

const endsAfterStart = (v: { startDatetime: Date; endDatetime: Date }) =>
  v.endDatetime > v.startDatetime;
const endsAfterStartIssue = { message: END_BEFORE_START_MESSAGE, path: ["endDatetime"] };

export const createEventSchema = eventFields.refine(endsAfterStart, endsAfterStartIssue);

export type CreateEventFormData = z.infer<typeof createEventSchema>;

export const updateEventSchema = eventFields
  .extend({ id: z.string().min(1, "Event ID is required") })
  .refine(endsAfterStart, endsAfterStartIssue);

export type UpdateEventFormData = z.infer<typeof updateEventSchema>;

// --- VENUE SCHEMAS ---
export const createVenueSchema = z.object({
  name: nameField("Venue name is required"),
  description: descriptionField(LONG_DESCRIPTION_MAX).optional(),
  type: z.string().min(1, "Venue type is required"),
  capacity: quantityField(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  price: priceField(),
  status: z
    .enum(["draft", "pending", "available", "archived", "rejected"])
    .default("draft"),
});

export type CreateVenueFormData = z.infer<typeof createVenueSchema>;

export const updateVenueSchema = createVenueSchema.extend({
  id: z.string().min(1, "Venue ID is required"),
});

export type UpdateVenueFormData = z.infer<typeof updateVenueSchema>;

// --- REVIEW SCHEMAS ---
export const createReviewSchema = z.object({
  venueId: z.string().min(1, "Venue ID is required"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  reviewText: z.string().min(50, "Review must be at least 50 characters"),
  categories: z
    .object({
      cleanliness: z.number().int().min(1).max(5).optional(),
      accuracy: z.number().int().min(1).max(5).optional(),
      checkIn: z.number().int().min(1).max(5).optional(),
      communication: z.number().int().min(1).max(5).optional(),
      location: z.number().int().min(1).max(5).optional(),
      value: z.number().int().min(1).max(5).optional(),
    })
    .optional(),
});

export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
