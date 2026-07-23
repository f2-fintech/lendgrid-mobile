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
  userId?: string | number;
  aggregatorMemberId?: string;
  appliedBy?: string;
  companyId?: string | number;
  startDate?: string;
  endDate?: string;
}) {
  const companyId = params.companyId ? String(params.companyId) : undefined;
  const isNumericUserId = params.userId && /^\d+$/.test(String(params.userId));
  const path = (params.userId && isNumericUserId)
    ? `/get-all-tickets/${params.userId}`
    : "/get-all-tickets";
  const queryParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    ...(params.search ? { search: params.search, name: params.search } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.appliedBy ? { appliedBy: params.appliedBy } : {}),
    ...(params.aggregatorMemberId ? { aggregatorMemberId: params.aggregatorMemberId } : {}),
    ...((params.userId && !isNumericUserId) ? { aggregatorMemberId: String(params.userId) } : {}),
    ...(companyId
      ? companyId === "all"
        ? { _cid: companyId }
        : { _cid: companyId, companyId }
      : {}),
    ...(params.startDate ? { startDate: params.startDate } : {}),
    ...(params.endDate ? { endDate: params.endDate } : {}),
  };

  if (__DEV__) {
    console.log("[Tickets API] fetchTickets", {
      path,
      params: queryParams,
      companyIdHeader: companyId === "all" ? undefined : companyId,
      allCompanies: companyId === "all",
    });
  }

  return restRequest<RestEnvelope<TicketsPage>>(path, {
    method: "GET",
    params: queryParams,
    config: companyId && companyId !== "all"
      ? {
          headers: {
            companyid: companyId,
          },
        }
      : undefined,
  }).then((response) => {
    // FRONTEND FILTERING: Fix backend bug where it returns tickets from other companies.
    // We explicitly filter tickets by the requested companyId.
    if (response?.data?.results && companyId && companyId !== "all") {
      const targetCid = String(companyId);
      response.data.results = response.data.results.filter((ticket) => {
        const t = ticket as any;
        const tCid = String(t.companyId || t.company_id);
        
        // If the ticket has a company ID field, it MUST match the target company ID.
        if (t.companyId !== undefined || t.company_id !== undefined) {
          return tCid === targetCid;
        }
        
        // If backend doesn't return companyId fields at all, we keep it to be safe.
        // But if those 2 rejected tickets have a different company ID, they will now be hidden.
        return true; 
      });
      response.data.count = response.data.results.length;
    }
    return response;
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
    },
  );
}
