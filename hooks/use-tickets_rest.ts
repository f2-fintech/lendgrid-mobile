// use-tickets.ts
import { RestEnvelope } from "@/apis/config/restClient";
import { fetchTickets, TicketsPage } from "@/apis/modules/tickets.api_rest";
import { useQuery } from "@tanstack/react-query";

type UseTicketsProps = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  userId?: string | number;
  appliedBy?: string;
  companyId?: string | number;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
};

export function useTickets({
  page = 1,
  limit = 10,
  search,
  status,
  userId,
  appliedBy,
  companyId,
  startDate,
  endDate,
  enabled = true,
}: UseTicketsProps) {
  return useQuery<RestEnvelope<TicketsPage>, Error, TicketsPage>({
    queryKey: [
      "tickets",
      page,
      limit,
      search,
      status,
      userId,
      appliedBy,
      companyId,
      startDate,
      endDate,
    ],
    queryFn: () =>
      fetchTickets({
        page,
        limit,
        search,
        status,
        userId,
        appliedBy,
        companyId,
        startDate,
        endDate,
      }),
    enabled,
    // unwrap { statusCode, message, data } -> just data
    select: (resp) => resp.data,
  });
}
