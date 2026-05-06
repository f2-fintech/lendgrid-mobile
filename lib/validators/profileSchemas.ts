import * as yup from "yup";

// REGEX Definitions (Aligned with Indian KYC/Banking Standards)
const PHONE_REGEX = /^[0-9]{10}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;
const AADHAAR_REGEX = /^[0-9]{12}$/;
const PAN_REGEX = /^([A-Za-z]{5})([0-9]{4})([A-Za-z]{1})$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const TAN_REGEX = /^([A-Za-z]{4})([0-9]{5})([A-Za-z]{1})$/;

// (UPPERCASE to match your UI dropdown)
const BusinessTypeValues = [
  "PROPRIETORSHIP",
  "PARTNERSHIP",
  "PRIVATE_LIMITED",
  "PUBLIC_LIMITED",
  "LLP",
];

// allow backend string url OR picked file object OR null
const optionalFile = yup
  .mixed()
  .nullable(true)
  .notRequired()
  .test("file-shape", "Invalid file", (val: any) => {
    if (!val) return true;
    if (typeof val === "string") return true;
    if (typeof val?.uri === "string") return true;
    return false;
  });

// 1. PROFILE TAB SCHEMA
export interface ProfileInputs {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: { uri: string } | null;
}

export const ProfileSchema = yup.object().shape({
  firstName: yup.string().notRequired(),
  lastName: yup.string().notRequired(),
  email: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .email("Must be a valid email address.")
    .notRequired(),
  phone: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .matches(PHONE_REGEX, "Phone number must be exactly 10 digits.")
    .notRequired(),
  avatar: yup
    .object()
    .shape({
      uri: yup.string().notRequired(),
    })
    .nullable(true)
    .default(null)
    .notRequired(),
});

// 2. BUSINESS TAB SCHEMA
export interface BusinessInputs {
  companyName: string;
  businessType: string;
  cinNumber?: string;
  gstNumber?: string;
  panNumber?: string;
  tanNumber?: string;
  pincode?: string;
  registeredAddress?: string;
  city?: string;
  state?: string;
  websiteUrl?: string;
}

export const BusinessSchema = yup.object().shape({
  companyName: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .min(3, "Company name is too short.")
    .notRequired(),

  businessType: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .oneOf(
      [...BusinessTypeValues, "", undefined],
      "Invalid business type selected.",
    )
    .notRequired(),

  cinNumber: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .min(21, "CIN must be exactly 21 characters.")
    .max(21, "CIN must be exactly 21 characters.")
    .notRequired(),

  gstNumber: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .matches(GST_REGEX, "Invalid GST number format (15 characters).")
    .notRequired(),

  panNumber: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .matches(PAN_REGEX, "Invalid PAN number format (e.g., ABCDE1234F).")
    .notRequired(),

  tanNumber: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .matches(TAN_REGEX, "Invalid TAN format (10 characters, e.g., ABCD12345E).")
    .notRequired(),

  pincode: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .matches(PINCODE_REGEX, "Pincode must be 6 digits.")
    .notRequired(),

  city: yup.string().notRequired(),
  state: yup.string().notRequired(),

  registeredAddress: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .min(10, "Registered Address is too short.")
    .notRequired(),

  websiteUrl: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .url("Must be a valid URL format (e.g., https://example.com).")
    .notRequired(),
});

// 3. BANKING TAB SCHEMA
export interface BankingInputs {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export const BankingSchema = yup.object().shape({
  accountHolderName: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .min(3, "Name is too short.")
    .notRequired(),

  accountNumber: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .min(9, "Account number is too short.")
    .max(18, "Account number is too long.")
    .matches(/^[0-9]+$/, "Account number must only contain digits.")
    .notRequired(),

  ifscCode: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .matches(IFSC_REGEX, "Invalid IFSC format (e.g., ABCD0123456).")
    .notRequired(),

  bankName: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .min(3, "Bank name is too short.")
    .notRequired(),
});

// 4. KYC TAB SCHEMA
export interface KYCInputs {
  aadhaarNumber: string;
  panNumber: string;
  documents: {
    aadhaarFront: any;
    aadhaarBack: any;
    panCard: any;
    incorporationCertificate: any;
    gstCertificate: any;
    bankStatement: any;
    cancelledCheque: any;
    addressProof: any;
    // authorizedSignatory: any;
  };
}

export const KYCSchema = yup.object().shape({
  aadhaarNumber: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .matches(AADHAAR_REGEX, "Aadhaar number must be exactly 12 digits.")
    .notRequired(),

  panNumber: yup
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .matches(PAN_REGEX, "Invalid PAN number format (e.g., ABCDE1234F).")
    .notRequired(),

  documents: yup
    .object()
    .shape({
      aadhaarFront: optionalFile,
      aadhaarBack: optionalFile,
      panCard: optionalFile,
      gstCertificate: optionalFile,
      incorporationCertificate: optionalFile,
      bankStatement: optionalFile,
      cancelledCheque: optionalFile,
      addressProof: optionalFile,
      // authorizedSignatory: optionalFile,
    })
    .default({})
    .notRequired(),
});

// 5. MASTER PROFILE SCHEMA
export const MasterProfileSchema = yup.object().shape({
  ...ProfileSchema.fields,
  ...BusinessSchema.fields,
  ...BankingSchema.fields,
  ...KYCSchema.fields,
});
