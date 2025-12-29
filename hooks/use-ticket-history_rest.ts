// use-ticket-history.ts
import { RestEnvelope } from "@/apis/config/restClient";
import {
    fetchTicketHistory,
    TicketHistoryData,
} from "@/apis/modules/tickets.api_rest";
import { useQuery } from "@tanstack/react-query";

export function useTicketHistory(ticketId: number | null, enabled = true) {
  const shouldFetch = !!ticketId && enabled;

  return useQuery<
    RestEnvelope<TicketHistoryData[]>,
    Error,
    TicketHistoryData[]
  >({
    queryKey: ["ticket-history", ticketId],
    queryFn: () => fetchTicketHistory(ticketId as number),
    enabled: shouldFetch,
    select: (resp) => resp.data,
  });
}
