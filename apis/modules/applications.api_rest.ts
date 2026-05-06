// applications.api.ts
import { RestEnvelope, restRequest } from "@/apis/config/restClient";

export interface CustomerApplication {
  applicationAmount: number;
  applicationDate: string;
  applicationId: number;
  applicationNumber: number;
  applicationProvider: string;
  applicationTenure: number;
  companyId: number;

  customerContact: string;
  customerDesignation: string;
  customerEmail: string;
  customerId: number;
  customerLocation: string;
  customerName: string;
  customerPAN: string;
  customerProfileImage: string[];
  customerState: string;

  loanCategory: "secured" | "unsecured";
  loanType: string;
  loanStatus: string;
}

export type ApplicationsPage = {
  results: CustomerApplication[];
  count: number;
  pages: number;
};

// GET /get-customer-loan-applications?page=&limit=&search=
export function fetchCustomerApplications(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  appliedBy?: string | number;
  companyId?: string | number;
}) {
  const companyId = params.companyId ? String(params.companyId) : undefined;
  const queryParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    ...(params.appliedBy
      ? {
          appliedBy: params.appliedBy,
        }
      : {}),
    ...(companyId
      ? companyId === "all"
        ? { _cid: companyId }
        : { _cid: companyId, companyId }
      : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.search ? { search: params.search } : {}),
  };

  if (__DEV__) {
    console.log("[Applications API] fetchCustomerApplications", {
      path: "/get-customer-loan-applications",
      params: queryParams,
      companyIdHeader: companyId === "all" ? undefined : companyId,
      allCompanies: companyId === "all",
    });
  }

  return restRequest<RestEnvelope<ApplicationsPage>>(
    "/get-customer-loan-applications",
    {
      method: "GET",
      params: queryParams,
      config: companyId && companyId !== "all"
        ? {
            headers: {
              companyid: companyId,
            },
          }
        : undefined,
    },
  );
}
