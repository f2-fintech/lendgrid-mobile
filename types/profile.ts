export type SelectedFile = { name?: string; uri: string } | null;

export type BusinessType =
  | "proprietorship"
  | "partnership"
  | "private_limited"
  | "public_limited"
  | "llp";

export type KYCStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AggregatorDocumentsType {
  aadhaarFront?: SelectedFile;
  aadhaarBack?: SelectedFile;
  panCard?: SelectedFile;
  gstCertificate?: SelectedFile;
  incorporationCertificate?: SelectedFile;
  bankStatement?: SelectedFile;
  cancelledCheque?: SelectedFile;
  addressProof?: SelectedFile;
  authorizedSignatory?: SelectedFile;
}

export interface ProfileState {
  // USER
  status: "ACTIVE" | "INACTIVE";
  username: string;
  email: string;
  phone: string;
  photoUrl: string | null;

  // AGGREGATOR PROFILE
  userId: string | null;
  createdBy: string | null;
  updatedBy: string | null;

  companyName: string;
  businessType: BusinessType | null;
  registeredAddress: string;
  city: string;
  state: string;
  pincode: string;
  websiteUrl: string;
  pocName: string;
  gstNumber: string;
  panNumber: string;
  aadhaarNumber: string;
  tanNumber: string;
  cinNumber: string;

  // KYC
  kycStatus: KYCStatus;
  kycRejectionReason: string;
  kycApprovedAt: string;
  kycApprovedBy: string;

  // DOCUMENTS
  documents: AggregatorDocumentsType;

  // BANKING
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  isBankVerified: boolean;

  // TEAM
  teamMembers: string[];

  // METRICS
  totalApplicationsSubmitted: number;
  totalApplicationsDisbursed: number;
  totalCommissionEarned: number;
  totalPaidOut: number;
  pendingPayout: number;

  // SYSTEM
  deletedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
