import { z } from "zod";

// Admin-only: create a Member or Admin account from the dashboard.
export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
