import { gqlRequest } from "@/apis/config/apiClient";
import {
  CommissionTransactionFilterInput,
  PaginatedCommissionTransactions,
} from "@/types/commissions";

export const commissionsApi = {
  /**
   * Get paginated list of commission transactions
   */
  getTransactions: (params?: {
    page?: number;
    limit?: number;
    filters?: CommissionTransactionFilterInput;
  }) =>
    gqlRequest<{
      getCommissionTransactions: PaginatedCommissionTransactions;
    }>(
      `
      query GetCommissionTransactions(
        $page: Int
        $limit: Int
        $filters: CommissionTransactionFilterInput
      ) {
        getCommissionTransactions(page: $page, limit: $limit, filters: $filters) {
          success
          message
          data {
            id
            ticketId
            aggregatorId
            ruleId
            disbursedAmount
            commissionAmount
            commissionType
            commissionRate
            status
            aggregatorRank
            productType
            provider
            calculatedAt
            approvedAt
            paidAt
            paymentReference
            remarks
            createdAt
            updatedAt
            approvedBy
            paidBy
          }
          total
          page
          limit
          pages
        }
      }
    `,
      {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        filters: params?.filters,
      }
    ).then((res) => res.getCommissionTransactions),
};
