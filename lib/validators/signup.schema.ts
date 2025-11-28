import { z } from "zod";

export const signUpSchema = z
  .object({
    role: z
      .string()
      .default("Aggregator admin")
      .transform((val) => (val && val.trim() ? val : "Aggregator admin")),

    fullName: z.string().min(2, "Full name must be at least 2 characters"),

    email: z.string().email("Please enter a valid email address"),

    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters"),

    userType: z.enum(["aggregator", "lender"], {
      required_error: "Please select a user type",
    }),

    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[0-9]/, "At least one number")
      .regex(/[^A-Za-z0-9]/, "At least one special character"),

    confirmPassword: z.string(),

    agreeToTerms: z.boolean().refine((v) => v === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpSchemaType = z.infer<typeof signUpSchema>;

// remove role, user type, aggree to terms. 
// add contact number.