import * as yup from "yup";

// REGEX Definitions (Aligned with Indian KYC/Banking Standards)
const PHONE_REGEX = /^[0-9]{10}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;
const AADHAAR_REGEX = /^[0-9]{12}$/;
const PAN_REGEX = /^([A-Za-z]{5})([0-9]{4})([A-Za-z]{1})$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const TAN_REGEX = /^([A-Za-z]{4})([0-9]{5})([A-Za-z]{1})$/;

// Backend Enum Values
const BusinessTypeValues = [
  "proprietorship",
  "partnership",
  "private_limited",
  "public_limited",
  "llp",
];

// 1. PROFILE TAB SCHEMA
export interface ProfileInputs {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: { uri: string } | null;
}

export const ProfileSchema = yup.object().shape({
  firstName: yup.string().required("First name is required."),
  lastName: yup.string().required("Last name is required."),
  email: yup
    .string()
    .email("Must be a valid email address.")
    .required("Email address is required."),
  phone: yup
    .string()
    .matches(PHONE_REGEX, "Phone number must be exactly 10 digits.")
    .required("Phone number is required."),
  avatar: yup
    .object()
    .shape({
      uri: yup.string().required("Avatar file URI is missing."),
    })
    .nullable(true)
    .default(null),
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
    .required("Company name is required.")
    .min(3, "Company name is too short."),
  businessType: yup
    .string()
    .required("Business type is required.")
    .oneOf(BusinessTypeValues, "Invalid business type selected."),
  cinNumber: yup
    .string()
    .min(21, "CIN must be exactly 21 characters.")
    .max(21, "CIN must be exactly 21 characters.")
    .when("businessType", {
      is: (val: string) =>
        val === "private_limited" || val === "public_limited" || val === "llp",
      then: (schema) =>
        schema.required("CIN is required for Incorporated entities."),
      otherwise: (schema) => schema.nullable(true).default(""),
    }),
  gstNumber: yup
    .string()
    .matches(GST_REGEX, "Invalid GST number format (15 characters).")
    .required("GST number is required."),
  panNumber: yup
    .string()
    .matches(PAN_REGEX, "Invalid PAN number format (e.g., ABCDE1234F).")
    .required("PAN number is required."),
  tanNumber: yup
    .string()
    .matches(TAN_REGEX, "Invalid TAN format (10 characters, e.g., ABCD12345E).")
    .required("TAN number is required."),
  pincode: yup
    .string()
    .matches(PINCODE_REGEX, "Pincode must be 6 digits.")
    .required("Pincode is required."),
  city: yup.string().required("City is required."),
  state: yup.string().required("State is required."),
  registeredAddress: yup
    .string()
    .min(10, "Registered Address is too short.")
    .required("Registered address is required."),
  websiteUrl: yup
    .string()
    .url("Must be a valid URL format (e.g., http://example.com).")
    .nullable(true)
    .notRequired()
    .default(""),
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
    .required("Account Holder name is required.")
    .min(3, "Name is too short."),
  accountNumber: yup
    .string()
    .required("Account number is required.")
    .min(9, "Account number is too short.")
    .max(18, "Account number is too long.")
    .matches(/^[0-9]+$/, "Account number must only contain digits."),
  ifscCode: yup
    .string()
    .matches(IFSC_REGEX, "Invalid IFSC format (e.g., ABCD0123456).")
    .required("IFSC Code is required."),
  bankName: yup
    .string()
    .required("Bank name is required.")
    .min(3, "Bank name is too short."),
});

// 4. KYC TAB SCHEMA (User editable fields)
export interface KYCInputs {
  aadhaarNumber: string;
  panNumber: string;
  documents: {
    aadhaarFront: { uri: string } | null;
    aadhaarBack: { uri: string } | null;
    panCard: { uri: string } | null;
    incorporationCertificate: { uri: string } | null;
    gstCertificate: { uri: string } | null;
    bankStatement: { uri: string } | null;
    cancelledCheque: { uri: string } | null;
    addressProof: { uri: string } | null;
    authorizedSignatory: { uri: string } | null;
  };
}

export const KYCSchema = yup.object().shape({
  aadhaarNumber: yup
    .string()
    .matches(AADHAAR_REGEX, "Aadhaar number must be exactly 12 digits.")
    .required("Aadhaar number is required."),
  panNumber: yup
    .string()
    .matches(PAN_REGEX, "Invalid PAN number format (e.g., ABCDE1234F).")
    .required("PAN number is required."),
  documents: yup
    .object()
    .shape({
      aadhaarFront: yup
        .object({
          uri: yup.string().required("Aadhaar Front upload is not required."),
        })
        .required("Aadhaar Front upload is not required.")
        .nullable(false)
        .default(null),
      aadhaarBack: yup
        .object({
          uri: yup.string().required("Aadhaar Back upload is not required."),
        })
        .required("Aadhaar Back upload is not required.")
        .nullable(false)
        .default(null),
      panCard: yup
        .object({ uri: yup.string().required("PAN Card upload is not required.") })
        .required("PAN Card upload is not required.")
        .nullable(false)
        .default(null),
      incorporationCertificate: yup 
        .object({
          uri: yup
            .string()
            .required("Incorporation Certificate upload is not required."),
        })
        .required("Incorporation Certificate upload is not required.")
        .nullable(false)
        .default(null),
      gstCertificate: yup
        .object({
          uri: yup.string().required("GST Certificate upload is not required."),
        })
        .required("GST Certificate upload is not required.")
        .nullable(false)
        .default(null),
      bankStatement: yup
        .object({
          uri: yup.string().required("Bank Statement upload is not required."),
        })
        .required("Bank Statement upload is not required.")
        .nullable(false)
        .default(null),
      cancelledCheque: yup
        .object({
          uri: yup.string().required("Cancelled Cheque upload is not required."),
        })
        .required("Cancelled Cheque upload is not required.")
        .nullable(false)
        .default(null),
      addressProof: yup
        .object({
          uri: yup.string().required("Address Proof upload is not required."),
        })
        .required("Address Proof upload is not required.")
        .nullable(false)
        .default(null),
      authorizedSignatory: yup
        .object({
          uri: yup
            .string()
            .required("Authorized Signatory ID upload is not required."),
        })
        .required("Authorized Signatory ID upload is not required.")
        .nullable(false)
        .default(null),
    })
    .required("Documents section not is required."),
});
