// use-customer-applications.ts
import { RestEnvelope } from "@/apis/config/restClient";
import {
  ApplicationsPage,
  fetchCustomerApplications,
} from "@/apis/modules/applications.api_rest";
import { useQuery } from "@tanstack/react-query";

type UseCustomerApplicationsProps = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  appliedBy?: string | number;
  companyId?: string | number;
  enabled?: boolean;
};

export function useCustomerApplications({
  page = 1,
  limit = 10,
  status,
  search,
  appliedBy,
  companyId,
  enabled = true,
}: UseCustomerApplicationsProps) {
  return useQuery<RestEnvelope<ApplicationsPage>, Error, ApplicationsPage>({
    queryKey: [
      "customer-applications",
      page,
      limit,
      status,
      search,
      appliedBy,
      companyId,
    ],
    queryFn: () =>
      fetchCustomerApplications({
        page,
        limit,
        status,
        search,
        appliedBy,
        companyId,
      }),
    enabled,
    // 👇 unwrap .data so your screen directly gets {results, count, pages}
    select: (resp) => resp.data,
  });
}
