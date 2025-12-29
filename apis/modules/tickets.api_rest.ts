// tickets.api.ts
import { RestEnvelope, restRequest } from "@/apis/config/restClient";

export interface TicketItem {
  ticketId: number;
  applicationId?: number | null;

  customerName: string;
  customerEmail: string;
  customerContact: string;

  applicationAmount: number;
  applicationProvider: string;

  loanCategory?: "secured" | "unsecured" | string;
  ticketStatus: string;

  documents?: string[];
  created_at?: string;
  updated_at?: string;
}

export type TicketsPage = {
  results: TicketItem[];
  count: number;
  pages: number;
};

// History item (same shape as your web app)
export interface TicketHistoryData {
  id: number;
  ticket_id: number;
  action?: string | null;
  created_at: string;
}

/**
 * GET /get-all-tickets?page=&limit=&search=
 */
export function fetchTickets(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return restRequest<RestEnvelope<TicketsPage>>("/get-all-tickets", {
    method: "GET",
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      ...(params.search ? { search: params.search } : {}),
      ...(params.status ? { status: params.status } : {}),
    },
  });
}

/**
 * GET /get-ticket-histories/:ticketId
 */
export function fetchTicketHistory(ticketId: number) {
  return restRequest<RestEnvelope<TicketHistoryData[]>>(
    `/get-ticket-histories/${ticketId}`,
    {
      method: "GET",
    }
  );
}
