import { gqlRequest } from "@/apis/config/apiClient";
import { DealLender } from "@/types/api-response";

export const dealLendersApi = {
  getDealLenders: () =>
    gqlRequest<{ getDealLenders: any[] }>(
      `
      query GetDealLenders {
        getDealLenders {
          _id
          name
          type
          status
        }
      }
    `,
    ).then((res) =>
      (res.getDealLenders || []).map((l) => ({
        ...l,
        id: l._id,
        type: (l.type || "").toLowerCase(),
        status: (l.status || "").toLowerCase(),
      })),
    ),
};
