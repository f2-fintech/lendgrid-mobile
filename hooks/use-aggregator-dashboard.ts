import { RestEnvelope } from "@/apis/config/restClient";
import { useQuery } from "@tanstack/react-query";

import {
  DisbursedByMonthItem,
  fetchApplicationCount,
  fetchDashboardTicketStats,
  fetchDisbursedTicketsByMonth,
  TicketStatsData,
} from "@/apis/modules/dashboard.api_rest";

export function useApplicationCount(enabled = true) {
  return useQuery<RestEnvelope<number>, Error, number>({
    queryKey: ["application-count"],
    queryFn: async () => {
      const resp = await fetchApplicationCount();
      return resp.data; // RestEnvelope<number>
    },
    enabled,
    select: (envelope) => envelope.data ?? 0,
  });
}

export function useDashboardTicketStats(
  params: {
    status?: string;
    userId?: number;
    date?: string;
    month?: string;
    year?: string;
  },
  enabled = true,
) {
  // stable key (avoid passing object directly)
  const key = [
    "dashboard-ticket-stats",
    params.status ?? "",
    params.userId ?? "",
    params.date ?? "",
    params.month ?? "",
    params.year ?? "",
  ] as const;

  return useQuery<
    RestEnvelope<TicketStatsData>,
    Error,
    { count: number; amount: number }
  >({
    queryKey: key,
    queryFn: async () => {
      const resp = await fetchDashboardTicketStats(params);
      return resp.data; // RestEnvelope<TicketStatsData>
    },
    enabled,
    select: (envelope) => {
      const result = envelope.data;

      if (typeof result === "number") {
        return { count: result, amount: 0 };
      }

      return {
        count: result?.count ?? 0,
        amount: result?.amount ?? 0,
      };
    },
  });
}

export function useDisbursedTicketsByMonth(
  year: number,
  companyId?: number,
  enabled = true,
) {
  return useQuery<
    RestEnvelope<DisbursedByMonthItem[]>,
    Error,
    DisbursedByMonthItem[]
  >({
    queryKey: ["disbursed-by-month", year, companyId ?? "self"],
    queryFn: async () => {
      const resp = await fetchDisbursedTicketsByMonth({ year, companyId });
      return resp.data; // RestEnvelope<DisbursedByMonthItem[]>
    },
    enabled,
    select: (envelope) => envelope.data ?? [],
  });
}
