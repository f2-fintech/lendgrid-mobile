import { RestEnvelope } from "@/apis/config/restClient";
import { useQuery } from "@tanstack/react-query";

import {
  DisbursedByMonthItem,
  fetchApplicationCount,
  fetchDashboardTicketStats,
  fetchDisbursedTicketsByMonth,
  TicketStatsData,
} from "@/apis/modules/dashboard.api_rest";

/**
 * ✅ Application count
 * fetchApplicationCount() returns RestEnvelope<number>
 */
export function useApplicationCount(enabled = true) {
  return useQuery<RestEnvelope<number>, Error, number>({
    queryKey: ["application-count"],
    queryFn: async () => {
      const envelope = await fetchApplicationCount(); // RestEnvelope<number>
      return envelope;
    },
    enabled,
    select: (envelope) => envelope?.data ?? 0,
  });
}

/**
 * ✅ Ticket stats (count + amount)
 * Handles inconsistent backend shapes:
 * - data: number
 * - data: { count, amount }
 * - data: { count, totalAmount } / { count, total_amount } / { ticketCount, sum } etc
 */
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
      const envelope = await fetchDashboardTicketStats(params); // RestEnvelope<TicketStatsData>
      return envelope;
    },
    enabled,
    select: (envelope) => {
      const result: any = envelope?.data;

      // case 1: backend returns a plain number
      if (typeof result === "number") {
        return { count: result, amount: 0 };
      }

      // case 2: backend returns object but keys vary
      const count =
        Number(
          result?.count ??
            result?.totalCount ??
            result?.ticketCount ??
            result?.tickets ??
            result?.totalTickets ??
            0,
        ) || 0;

      const amount =
        Number(
          result?.amount ??
            result?.totalAmount ??
            result?.total_amount ??
            result?.sum ??
            result?.total ??
            0,
        ) || 0;

      return { count, amount };
    },
  });
}

/**
 * ✅ Disbursed tickets by month
 * fetchDisbursedTicketsByMonth() returns RestEnvelope<DisbursedByMonthItem[]>
 */
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
      const envelope = await fetchDisbursedTicketsByMonth({ year, companyId }); // RestEnvelope<DisbursedByMonthItem[]>
      return envelope;
    },
    enabled,
    select: (envelope) => envelope?.data ?? [],
  });
}
