import { subYears } from "date-fns";
import { z } from "zod";

/**
 * React Native / Expo document picker returns an object, not browser File.
 * This schema matches:
 * { uri, name, size?, mimeType? }
 */
export const pickedFileSchema = z.object({
  uri: z.string().min(1, "File uri is required"),
  name: z.string().min(1, "File name is required"),
  size: z.number().optional(),
  mimeType: z.string().optional(),
});

/** helpers */
const parseNum = (v: unknown) => {
  const n = Number(
    String(v ?? "")
      .replace(/,/g, "")
      .trim(),
  );
  return Number.isFinite(n) ? n : NaN;
};

const amountSchema = z
  .string()
  .min(1, "Amount is required")
  .refine((val) => !isNaN(parseNum(val)), "Amount must be a number")
  .refine((val) => parseNum(val) >= 50000, "Amount must be at least 50,000")
  .refine(
    (val) => parseNum(val) <= 100000000,
    "Amount must not exceed 10 crore",
  )
  .refine((val) => parseNum(val) % 5 === 0, "Amount must be divisible by 5");

export const step0Schema = z
  .object({
    amount: amountSchema,

    loanType: z.string().min(1, "Loan type is required"),

    tenure: z.string().min(1, "Tenure is required"),

    leadType: z.string().optional().default("null"),

    hasRunningLoans: z.enum(["yes", "no"], {
      required_error: "Running Customer Loans is required",
    }),

    whichLoan: z.string().optional(),
    runningLoanAmount: z.string().optional(),

    caseType: z.enum(["top_up", "fresh"], {
      required_error: "Case type is required",
    }),

    providers: z
      .array(z.string())
      .min(1, "At least one provider must be selected"),

    providerAmounts: z.array(
      z.object({
        provider: z.string().min(1, "Provider is required"),
        amount: amountSchema,
      }),
    ),
  })
  .superRefine((data, ctx) => {
    // conditional validation: if hasRunningLoans === 'yes'
    if (data.hasRunningLoans === "yes") {
      if (!data.whichLoan || !String(data.whichLoan).trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["whichLoan"],
          message: "Which loan is required",
        });
      }

      const v = String(data.runningLoanAmount ?? "").trim();
      if (!v) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["runningLoanAmount"],
          message: "Running loan amount is required",
        });
      } else if (isNaN(parseNum(v))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["runningLoanAmount"],
          message: "Running loan amount must be a number",
        });
      }
    }
  });

export type Step0FormData = z.infer<typeof step0Schema>;

// Step 1: Basic Details
export const step1Schema = z.object({
  title: z.enum(["Mr", "Mrs", "Miss", "Dr", "Ca"], {
    required_error: "Title is required",
  }),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(40, "Name must not exceed 40 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name should only contain letters"),

  email: z
    .string()
    .email("Invalid email address")
    .regex(
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Email address is not valid",
    ),

  contact: z
    .string()
    .regex(/^[0-9]{7,10}$/, "Contact number must be between 7 and 10 digits"),

  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN card format"),

  father_name: z
    .string()
    .min(2, "Father's name must be at least 2 characters")
    .max(40, "Father's name must not exceed 40 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name should only contain letters"),

  mother_name: z
    .string()
    .min(2, "Mother's name must be at least 2 characters")
    .max(40, "Mother's name must not exceed 40 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name should only contain letters"),

  working_address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(240, "Address must not exceed 240 characters"),

  permanent_address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(240, "Address must not exceed 240 characters"),

  current_address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(240, "Address must not exceed 240 characters"),

  city: z
    .string()
    .min(2, "City name must be at least 2 characters")
    .max(30, "City name must not exceed 30 characters")
    .regex(/^[a-zA-Z\s]+$/, "City name should only contain letters"),

  state: z
    .string()
    .min(2, "State name must be at least 2 characters")
    .max(30, "State name must not exceed 30 characters")
    .regex(/^[a-zA-Z\s]+$/, "State name should only contain letters"),

  employment_type: z.enum(["salaried", "business", "professional"], {
    required_error: "Employment type is required",
  }),

  dob: z
    .date({
      required_error: "Date of birth is required",
    })
    .refine(
      (date) => date < new Date(),
      "Date of birth cannot be in the future",
    )
    .refine(
      (date) => date <= subYears(new Date(), 20),
      "You must be at least 20 years old",
    ),
});

export type Step1FormData = z.infer<typeof step1Schema>;

// Step 2: Statement Upload (handled by file state, no schema needed)
export const step2Schema = z.object({
  files: z.array(pickedFileSchema).optional(),
});

export type Step2FormData = z.infer<typeof step2Schema>;

// Step 3: Profile Details (Aadhar, PAN, Photo)
// Step 3: Profile Details (Aadhar, PAN, Photo)
export const step3Schema = z.object({
  aadharFront: pickedFileSchema.refine((v) => !!v?.uri, {
    message: "Aadhar front is required",
  }),
  aadharBack: pickedFileSchema.optional(),
  pancard: pickedFileSchema.refine((v) => !!v?.uri, {
    message: "PAN Card is required",
  }),
  passportSizePhoto: pickedFileSchema.optional(),
});

export type Step3FormData = z.infer<typeof step3Schema>;

// Step 4: Additional Details
export const step4Schema = z.object({
  salary: z
    .string()
    .min(1, "Salary/Turnover is required")
    .refine((val) => !isNaN(Number(val)), "Must be a valid number")
    .refine((val) => Number(val) >= 50000, "Must be at least 50,000"),

  existing_emi: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), "Must be a valid number"),

  existing_liability: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), "Must be a valid number"),

  certificates: z.array(pickedFileSchema).optional(),
});

export type Step4FormData = z.infer<typeof step4Schema>;
