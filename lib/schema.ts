import { z } from "zod";

// --- LOGIN SCHEMA ---
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// --- SIGNUP SCHEMA ---
export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(1, "Name is required"),

  // Optional field
  mobileNumber: z.string().optional(),
});

export type SignupFormData = z.infer<typeof signupSchema>;
