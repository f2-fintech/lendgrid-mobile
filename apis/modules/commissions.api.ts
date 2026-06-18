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
      query GetCommissionTransactions($page: Int, $limit: Int, $filters: CommissionTransactionFilterInput) {
        getCommissionTransactions(page: $page, limit: $limit, filters: $filters) {
          success
          message
          data {
            id
            ticketId
            aggregatorId
            companyId

            disbursedAmount
            disbursedDate

            cashbackAmount
            grossCommission
            commissionAfterCashback

            commissionType
            commissionRate
            commissionRateSource

            tdsRate
            tdsAmount

            finalCommission

            caseType
            loanType
            loanCategory

            aggregatorType
            status
            aggregatorRank
            provider

            calculatedAt
            approvedAt
            paidAt

            utrNumber
            paymentProofUrl
            adminNotes

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
      },
    ).then((res) => res.getCommissionTransactions),

  /**
   * Get currently logged in aggregator's assigned active commission rule
   */
  myCommissionRule: () =>
    gqlRequest<{ myCommissionRule: any }>(
      `
      query MyCommissionRule {
        myCommissionRule {
          success
          message
          data {
            id
            ruleName
            icon
            badgeLabel
            commissionType
            commissionRate
            productType
            minAmount
            maxAmount
            applicableFor
            aggregatorType
            status
            priority
            description
            effectiveFrom
            effectiveTo
            createdAt
            updatedAt
            createdBy
            updatedBy
            lenderCommissions {
              lenderName
              securedRate
              unsecuredRate
            }
          }
        }
      }
    `,
    ).then((res) => res.myCommissionRule),
};
