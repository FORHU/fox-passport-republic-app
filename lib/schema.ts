import { z } from "zod";

// --- LOGIN SCHEMA ---
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// --- SIGNUP SCHEMA ---
export const signupSchema = z.object({
  email: z.string("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(1, "Name is required"),

  // Optional field
  mobileNumber: z.string().optional(),
});

// Validation for Creating Event
export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Event description is required"),
  startDate: z.string().min(1, "Event start date is required"),
  endDate: z.string().min(1, "Event end date is required"),
  location: z.string().min(1, "Event location is required"),
  category: z.string().min(1, "Event category is required"),
  image: z.string().min(1, "Event image is required"),
});

// Validation for Creating Venue
export const createVenueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  description: z.string().min(1, "Venue description is required"),
  address: z.string().min(1, "Venue address is required"),
  city: z.string().min(1, "Venue city is required"),
  state: z.string().min(1, "Venue state is required"),
  zip: z.string().min(1, "Venue zip is required"),
  country: z.string().min(1, "Venue country is required"),
  image: z.string().min(1, "Venue image is required"),
});

// Validation for creating Service
export const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().min(1, "Service description is required"),
  price: z.string().min(1, "Service price is required"),
  image: z.string().min(1, "Service image is required"),
});

// Validation for creating Asset
export const createAssetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  description: z.string().min(1, "Asset description is required"),
  price: z.string().min(1, "Asset price is required"),
  image: z.string().min(1, "Asset image is required"),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;

export type SignupFormData = z.infer<typeof signupSchema>;
