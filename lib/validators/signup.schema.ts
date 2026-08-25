import { z } from "zod";

export const signUpSchema = z
  .object({
    role: z.string().optional(),
    userType: z.string().optional(),
    agreeToTerms: z.boolean().optional(),
    referralCode: z.string().optional(),
    parentCompanyName: z.string().optional(),

    fullName: z.string().min(2, "Full name must be at least 2 characters"),

    email: z
      .string()
      .email("Please enter a valid email address")
      .toLowerCase()
      .trim(),

    companyName: z.string().optional(),

    contact: z
      .string()
      .min(9, "Contact must be at least 9 characters")
      .max(20, "Contact is too long")
      .regex(/^[0-9]+$/, "Contact can only contain numbers")
      .or(z.literal(''))
      .optional(),

    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[0-9]/, "At least one number")
      .regex(/[^A-Za-z0-9]/, "At least one special character"),

    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
    }

    if (
      !data.referralCode &&
      (!data.companyName || data.companyName.trim().length < 2)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Company name must be at least 2 characters",
        path: ["companyName"],
      });
    }
  });

export type SignUpSchemaType = z.infer<typeof signUpSchema>;
