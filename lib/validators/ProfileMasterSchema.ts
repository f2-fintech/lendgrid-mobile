// Validation/ProfileMasterSchema.ts

import {
  BankingSchema,
  BusinessSchema,
  KYCSchema,
  ProfileSchema,
} from "./profileSchemas";

export const MasterProfileSchema = ProfileSchema.concat(BusinessSchema)
  .concat(BankingSchema)
  .concat(KYCSchema);
