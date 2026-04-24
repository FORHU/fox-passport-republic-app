import { z } from "zod";

// --- AUTH SCHEMAS ---
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(1, "Name is required"),
  mobileNumber: z.string().optional(),
});

export type SignupFormData = z.infer<typeof signupSchema>;

// --- ASSET / INVENTORY SCHEMAS ---
export const createAssetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be non-negative"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").optional(),
});

export type CreateAssetFormData = z.infer<typeof createAssetSchema>;

export const updateAssetSchema = createAssetSchema.extend({
  id: z.string().min(1, "Asset ID is required"),
});

export type UpdateAssetFormData = z.infer<typeof updateAssetSchema>;

// --- SERVICE SCHEMAS ---
export const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be non-negative"),
  billingRate: z.enum(["hourly", "daily", "weekly", "monthly"]).default("hourly"),
  status: z.enum(["active", "paused", "unavailable"]).default("active"),
});

export type CreateServiceFormData = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = createServiceSchema.extend({
  id: z.string().min(1, "Service ID is required"),
});

export type UpdateServiceFormData = z.infer<typeof updateServiceSchema>;

// --- EVENT SCHEMAS ---
export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().optional(),
  eventType: z.string().min(1, "Event type is required"),
  venueId: z.string().min(1, "Venue is required"),
  startDatetime: z.date(),
  endDatetime: z.date(),
  maxAttendees: z.number().int().min(1, "Max attendees must be at least 1"),
  totalPrice: z.number().min(0, "Price must be non-negative").optional(),
  status: z.enum(["draft", "published", "cancelled", "completed"]).default("draft"),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.extend({
  id: z.string().min(1, "Event ID is required"),
});

export type UpdateEventFormData = z.infer<typeof updateEventSchema>;

// --- VENUE SCHEMAS ---
export const createVenueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Venue type is required"),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  price: z.number().min(0, "Price must be non-negative"),
  status: z.enum(["draft", "pending_review", "published", "suspended", "archived"]).default("draft"),
});

export type CreateVenueFormData = z.infer<typeof createVenueSchema>;

export const updateVenueSchema = createVenueSchema.extend({
  id: z.string().min(1, "Venue ID is required"),
});

export type UpdateVenueFormData = z.infer<typeof updateVenueSchema>;

// --- REVIEW SCHEMAS ---
export const createReviewSchema = z.object({
  venueId: z.string().min(1, "Venue ID is required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  reviewText: z.string().min(50, "Review must be at least 50 characters"),
  categories: z.object({
    cleanliness: z.number().int().min(1).max(5).optional(),
    accuracy: z.number().int().min(1).max(5).optional(),
    checkIn: z.number().int().min(1).max(5).optional(),
    communication: z.number().int().min(1).max(5).optional(),
    location: z.number().int().min(1).max(5).optional(),
    value: z.number().int().min(1).max(5).optional(),
  }).optional(),
});

export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
