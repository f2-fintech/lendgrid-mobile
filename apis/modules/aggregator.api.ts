import { gqlRequest } from "@/apis/config/apiClient";
import {
  AggregatorDocuments,
  AggregatorProfile,
  BusinessType,
  CreateResponse,
  KYCStatus,
  PaginatedResponse,
} from "@/types/api-response";

export const aggregatorApi = {
  /**
   * Create Aggregator Profile
   */
  create: (payload: {
    userId: string;
    companyName: string;
    businessType?: BusinessType;
    registeredAddress?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gstNumber?: string;
    panNumber?: string;
    aadhaarNumber?: string;
    tanNumber?: string;
    cinNumber?: string;
    websiteUrl?: string;
    documents?: AggregatorDocuments;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    teamMembers?: string[];
    totalApplicationsSubmitted?: number;
    totalApplicationsDisbursed?: number;
    totalCommissionEarned?: number;
    totalPaidOut?: number;
    pendingPayout?: number;
    createdBy?: string;
  }) =>
    gqlRequest<{
      createAggregatorProfile: CreateResponse<AggregatorProfile>;
    }>(
      `
      mutation CreateAggregatorProfile($createInput: CreateAggregatorProfileDto!) {
        createAggregatorProfile(createInput: $createInput) {
          success
          message
          aggregatorProfile {
            _id
            userId
            companyName
            businessType
            city
            state
            kycStatus
            createdAt
            createdBy
          }
        }
      }
    `,
      { createInput: payload }
    ),

  /**
   * Get All Profiles (Paginated)
   */
  findAll: (params?: { page?: number; limit?: number }) =>
    gqlRequest<{
      findAllAggregatorProfiles: PaginatedResponse<AggregatorProfile>;
    }>(
      `
      query FindAllAggregatorProfiles($paginationArgs: PaginationQuery!) {
        findAllAggregatorProfiles(paginationArgs: $paginationArgs) {
          success
          message
          results {
            _id
            userId
            companyName
            businessType
            city
            state
            pincode
            kycStatus
            totalApplicationsSubmitted
            totalApplicationsDisbursed
            totalCommissionEarned
            pendingPayout
            createdAt
            createdBy
            user {
              _id
              username
              email
              contact
              role
              status
              createdAt
              loginHistory
            }
          }
          count
          page
          pages
        }
      }
    `,
      { paginationArgs: params || { page: 1, limit: 10 } }
    ),

  /**
   * Get By ID
   */
  findOne: (id: string) =>
    gqlRequest<{ findOneAggregatorProfile: AggregatorProfile }>(
      `
      query FindOneAggregatorProfile($id: ID!) {
        findOneAggregatorProfile(id: $id) {
          _id
          userId
          companyName
          businessType
          registeredAddress
          city
          state
          pincode
          gstNumber
          panNumber
          aadhaarNumber
          tanNumber
          cinNumber
          websiteUrl
          documents {
            aadhaarFront     
            aadhaarBack       
            panCard
            gstCertificate
            incorporationCertificate
            bankStatement
            cancelledCheque
            addressProof
          }
          kycStatus
          kycRejectionReason
          kycApprovedAt
          bankName
          accountNumber
          ifscCode
          accountHolderName
          # isBankVerified removed
          totalApplicationsSubmitted
          totalApplicationsDisbursed
          totalCommissionEarned
          totalPaidOut
          pendingPayout
          createdAt
          updatedAt
          user {
            _id
            username
            email
            contact
            role
            status
            photoUrl
          }
          kycApprovedByUser {
            _id
            username
            email
            status
          }
          teamMemberUsers {
            _id
            username
            email
            contact
            role
            status
          }
        }
      }
    `,
      { id }
    ),

  /**
   * Get My Profile
   */
  getMyProfile: () =>
    gqlRequest<{ myAggregatorProfile: AggregatorProfile }>(
      `
      query MyAggregatorProfile {
        myAggregatorProfile {
          _id
          userId
          companyName
          businessType
          registeredAddress
          city
          state
          pincode
          gstNumber
          panNumber
          aadhaarNumber       
          tanNumber
          cinNumber
          websiteUrl
          documents {         
            aadhaarFront
            aadhaarBack
            panCard
            gstCertificate
            incorporationCertificate
            bankStatement
            cancelledCheque
            addressProof
          }
          kycStatus
          kycRejectionReason
          kycApprovedAt
          bankName
          accountNumber
          ifscCode
          accountHolderName
          totalApplicationsSubmitted
          totalApplicationsDisbursed
          totalCommissionEarned
          totalPaidOut
          pendingPayout
          createdAt
          updatedAt
          user {
            _id
            username
            email
            contact
            role
            status
            photoUrl
          }
        }
      }
    `
    ),

  /**
   * Search
   */
  search: (searchTerm: string, params?: { page?: number; limit?: number }) =>
    gqlRequest<{
      searchAggregatorProfiles: PaginatedResponse<AggregatorProfile>;
    }>(
      `
      query SearchAggregatorProfiles($searchTerm: String!, $paginationArgs: PaginationQuery!) {
        searchAggregatorProfiles(searchTerm: $searchTerm, paginationArgs: $paginationArgs) {
          success
          results {
            _id
            companyName
            city
            state
            kycStatus
            createdAt
          }
          count
          page
          pages
        }
      }
    `,
      { searchTerm, paginationArgs: params || { page: 1, limit: 10 } }
    ),

  /**
   * Update
   */
  update: (payload: any) =>
    gqlRequest<{ updateAggregatorProfile: AggregatorProfile }>(
      `
      mutation UpdateAggregatorProfile($updateInput: UpdateAggregatorProfileDto!) {
        updateAggregatorProfile(updateInput: $updateInput) {
          _id
          companyName
          kycStatus
          updatedAt
        }
      }
    `,
      { updateInput: payload }
    ),

  /**
   * Update KYC Status
   */
  updateKycStatus: (
    id: string,
    kycStatus: KYCStatus,
    rejectionReason?: string
  ) =>
    gqlRequest<{ updateAggregatorKycStatus: AggregatorProfile }>(
      `
      mutation UpdateAggregatorKycStatus($id: ID!, $kycStatus: KYCStatus!, $rejectionReason: String) {
        updateAggregatorKycStatus(id: $id, kycStatus: $kycStatus, rejectionReason: $rejectionReason) {
          _id
          kycStatus
          kycRejectionReason
          kycApprovedAt
          updatedAt
        }
      }
    `,
      { id, kycStatus, rejectionReason }
    ),

  /**
   * Add Team Member
   */
  addTeamMember: (id: string, userId: string) =>
    gqlRequest<{ addTeamMember: AggregatorProfile }>(
      `
      mutation AddTeamMember($id: ID!, $userId: ID!) {
        addTeamMember(id: $id, userId: $userId) {
          _id
          teamMembers
          updatedAt
        }
      }
    `,
      { id, userId }
    ),

  /**
   * Remove Team Member
   */
  removeTeamMember: (id: string, userId: string) =>
    gqlRequest<{ removeTeamMember: AggregatorProfile }>(
      `
      mutation RemoveTeamMember($id: ID!, $userId: ID!) {
        removeTeamMember(id: $id, userId: $userId) {
          _id
          teamMembers
          updatedAt
        }
      }
    `,
      { id, userId }
    ),

  /**
   * Delete
   */
  remove: (id: string) =>
    gqlRequest<{ removeAggregatorProfile: AggregatorProfile }>(
      `
      mutation RemoveAggregatorProfile($id: ID!) {
        removeAggregatorProfile(id: $id) {
          _id
          deletedAt
        }
      }
    `,
      { id }
    ),
};
