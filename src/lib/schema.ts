import { z } from "zod";

export const ROLE_OPTIONS = ["User", "Vendor", "Admin"] as const;

// --- LOGIN SCHEMA ---
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(ROLE_OPTIONS),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// --- SIGNUP SCHEMA ---
export const signupSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  date_of_birth: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
    message: "Valid date required",
  }),
  role: z.enum(ROLE_OPTIONS),
  
  // Optional / Business Fields
  company_name: z.string().optional(),
  venue_name: z.string().optional(),
  postal: z.string().min(1, "Postal code required"),
  country: z.string().min(1, "Country required"),
  social_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type SignupFormData = z.infer<typeof signupSchema>;