import { z } from "zod";

export const signUpSchema = z
  .object({
    role: z.string().min(1, "Role is required"),
    company: z.string().min(1, "Company name is required"),
    fullName: z.string().min(3, "Full Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
