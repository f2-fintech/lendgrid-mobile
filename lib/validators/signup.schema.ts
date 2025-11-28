import { z } from "zod";

export const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),

    email: z
      .string()
      .email("Please enter a valid email address")
      .toLowerCase() 
      .trim(), 

    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters"),

    contact: z
      .string()
      .min(9, "Contact must be at least 9 characters")
      .max(20, "Contact is too long")
      .regex(/^[0-9]+$/, "Contact can only contain numbers"),

    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[0-9]/, "At least one number")
      .regex(/[^A-Za-z0-9]/, "At least one special character"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpSchemaType = z.infer<typeof signUpSchema>;
