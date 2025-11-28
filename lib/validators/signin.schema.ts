import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),

  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "At least one uppercase letter")
    .regex(/[0-9]/, "At least one number")
    .regex(/[^A-Za-z0-9]/, "At least one special character"),
});

export type SignInSchemaType = z.infer<typeof signInSchema>;

// add validation in email correctly for space and Capital letters