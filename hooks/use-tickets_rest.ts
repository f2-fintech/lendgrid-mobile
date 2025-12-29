// use-tickets.ts
import { RestEnvelope } from "@/apis/config/restClient";
import { fetchTickets, TicketsPage } from "@/apis/modules/tickets.api_rest";
import { useQuery } from "@tanstack/react-query";

type UseTicketsProps = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  enabled?: boolean;
};

export function useTickets({
  page = 1,
  limit = 10,
  search,
  status,
  enabled = true,
}: UseTicketsProps) {
  return useQuery<RestEnvelope<TicketsPage>, Error, TicketsPage>({
    queryKey: ["tickets", page, limit, search, status],
    queryFn: () => fetchTickets({ page, limit, search, status }),
    enabled,
    // unwrap { statusCode, message, data } -> just data
    select: (resp) => resp.data,
  });
}
