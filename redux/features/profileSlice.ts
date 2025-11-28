import { ProfileState } from "@/types/profile";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: ProfileState = {
  status: "ACTIVE",
  username: "",
  email: "",
  phone: "",
  photoUrl: null,

  // Business
  companyName: "",
  businessType: null,
  registeredAddress: "",
  city: "",
  state: "",
  pincode: "",
  websiteUrl: "",
  pocName: "",
  gstNumber: "",
  panNumber: "",
  aadhaarNumber: "",
  tanNumber: "",
  cinNumber: "",

  // KYC
  kycStatus: "PENDING",
  kycRejectionReason: "",
  kycApprovedAt: "",
  kycApprovedBy: "",

  // Documents
  documents: {
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    gstCertificate: null,
    incorporationCertificate: null,
    bankStatement: null,
    cancelledCheque: null,
    addressProof: null,
    authorizedSignatory: null,
  },

  // Banking
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  accountHolderName: "",
  isBankVerified: false,

  // Team
  teamMembers: [],

  // Metrics
  totalApplicationsSubmitted: 0,
  totalApplicationsDisbursed: 0,
  totalCommissionEarned: 0,
  totalPaidOut: 0,
  pendingPayout: 0,

  // System
  deletedAt: null,
  createdAt: null,
  updatedAt: null,

  userId: null,
  createdBy: null,
  updatedBy: null,
};

// ⭐ THE IMPORTANT FIX IS HERE — ADD THE GENERIC <ProfileState>
export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    updateField: (
      state: ProfileState,
      action: PayloadAction<{ key: keyof ProfileState; value: any }>
    ) => {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { updateField } = profileSlice.actions;
export default profileSlice.reducer;
