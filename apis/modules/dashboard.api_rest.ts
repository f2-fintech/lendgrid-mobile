import { RestEnvelope, restRequest } from "@/apis/config/restClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type TicketStatsData =
  | number
  | {
      count: number;
      amount: number;
    };

export type DisbursedByMonthItem = {
  month: string;
  count: number;
};

export function fetchApplicationCount() {
  return restRequest<RestEnvelope<number>>("/application/count", {
    method: "GET",
  });
}

export function fetchDashboardTicketStats(params: {
  status?: string;
  userId?: number;
  date?: string;
  month?: string;
  year?: string;
}) {
  return restRequest<RestEnvelope<TicketStatsData>>(
    "/dashboard/tickets/count",
    {
      method: "GET",
      params: {
        ...(params.status ? { status: params.status } : {}),
        ...(params.userId ? { userId: params.userId } : {}),
        ...(params.date ? { date: params.date } : {}),
        ...(params.month ? { month: params.month } : {}),
        ...(params.year ? { year: params.year } : {}),
      },
    },
  );
}

export async function fetchDisbursedTicketsByMonth(params: {
  year: number;
  companyId?: number | string;
}) {
  // ✅ fallback to AsyncStorage companyId
  const storedCompanyId = await AsyncStorage.getItem("companyId");

  const companyId =
    params.companyId ?? (storedCompanyId ? Number(storedCompanyId) : undefined);

  return restRequest<RestEnvelope<DisbursedByMonthItem[]>>(
    "/dashboard/tickets/done-counts-by-month",
    {
      method: "GET",
      params: {
        year: params.year,
        ...(companyId ? { companyId } : {}),
      },
    },
  );
}
