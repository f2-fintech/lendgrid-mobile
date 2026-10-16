// apis/modules/oms-auth-api.ts
//
// OMS Staff authentication — uses restApi (axios instance pointing to EXPO_PUBLIC_ADMIN_API_URL)
// which is the same base URL as NEXT_PUBLIC_ADMIN_URL on the website.
// No captcha required for OMS staff login.

import { restRequest } from "@/apis/config/restClient";

export interface OmsLoginPayload {
  email: string;
  password: string;
}

export interface OmsLoginResponse {
  access_token: string;
  message?: string;
}

export interface OmsPasswordResponse {
  message?: string;
}

// OMS backend uses ResponseFormatter.success → { statusCode, message, data: { access_token } }
// restRequest<T> already unwraps resp.data (the axios response body),
// so the full shape coming back is the envelope itself.
export const omsAuthApi = {
  login: async (payload: OmsLoginPayload): Promise<OmsLoginResponse> => {
    const envelope = await restRequest<{
      statusCode: number;
      message: string;
      data: OmsLoginResponse;
    }>("/login", {
      method: "POST",
      data: payload,
    });

    // Unwrap the ResponseFormatter envelope → { access_token }
    return envelope.data;
  },

  forgotPassword: async (email: string): Promise<OmsPasswordResponse> => {
    const envelope = await restRequest<{
      statusCode: number;
      message: string;
      data: null;
    }>("/forgot-password", {
      method: "POST",
      data: { email },
    });

    return { message: envelope.message };
  },

  resetPassword: async (
    token: string,
    newPassword: string,
  ): Promise<OmsPasswordResponse> => {
    const envelope = await restRequest<{
      statusCode: number;
      message: string;
      data: null;
    }>("/reset-password", {
      method: "POST",
      data: { token, newPassword },
    });

    return { message: envelope.message };
  },
};

// ─── OMS Referral Code (GraphQL — lendgrid-server) ───────────────────────────
import { gqlRequest } from "@/apis/config/apiClient";

export interface OmsReferralCodeData {
  referralCode: string;
  employeeName: string;
  designation?: string;
  employeeCode?: string;
  signupLink: string;
}

export interface OmsPartnerItem {
  _id: string;
  companyName: string;
  companyId?: number;
  kycStatus?: string;
  totalApplicationsSubmitted?: number;
  totalApplicationsApproved?: number;
  totalDisbursedAmount?: number;
  createdAt?: string;
}

export interface OmsPartnersData {
  partners: OmsPartnerItem[];
  totalCount: number;
}

/** Fetch (or lazy-create) the OMS referral code for the logged-in OMS staff */
export const getOmsReferralCodeApi = async (): Promise<OmsReferralCodeData> => {
  const query = `
    query GetMyOmsReferralCode {
      getMyOmsReferralCode {
        referralCode
        employeeName
        designation
        employeeCode
        signupLink
      }
    }
  `;
  const data = await gqlRequest<{ getMyOmsReferralCode: OmsReferralCodeData }>(query, {});
  return data.getMyOmsReferralCode;
};

/** Fetch all channel partners referred by the logged-in OMS staff */
export const getOmsPartnersApi = async (): Promise<OmsPartnersData> => {
  const query = `
    query GetOmsPartners {
      getOmsPartners {
        totalCount
        partners {
          _id
          companyName
          companyId
          kycStatus
          totalApplicationsSubmitted
          totalApplicationsApproved
          totalDisbursedAmount
          createdAt
        }
      }
    }
  `;
  const data = await gqlRequest<{ getOmsPartners: OmsPartnersData }>(query, {});
  return data.getOmsPartners;
};

export interface OmsPartnerApplicationItem {
  _id: string;
  applicantName?: string;
  loanType?: string;
  status?: string;
  loanAmount?: number;
  applicationId?: string;
  createdAt?: string;
}

export interface OmsPartnerApplicationsData {
  applications: OmsPartnerApplicationItem[];
  totalCount: number;
}

/** Fetch all applications for a specific referred partner */
export const getOmsPartnerApplicationsApi = async (
  aggregatorProfileId: string
): Promise<OmsPartnerApplicationsData> => {
  const query = `
    query GetOmsPartnerApplications($aggregatorProfileId: ID!) {
      getOmsPartnerApplications(aggregatorProfileId: $aggregatorProfileId) {
        totalCount
        applications {
          _id
          applicantName
          applicationId
          loanAmount
          loanType
          status
          createdAt
        }
      }
    }
  `;
  const data = await gqlRequest<{ getOmsPartnerApplications: OmsPartnerApplicationsData }>(
    query,
    { aggregatorProfileId }
  );
  return data.getOmsPartnerApplications;
};
