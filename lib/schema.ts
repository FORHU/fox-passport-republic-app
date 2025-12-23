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
  
  // Optional fields handling
  name: z.union([z.string(), z.undefined()])
    .optional()
    .transform(e => e === "" ? undefined : e),
    
  mobileNumber: z.union([z.string(), z.undefined()])
    .optional()
    .transform(e => e === "" ? undefined : e),
});

export type SignupFormData = z.infer<typeof signupSchema>;