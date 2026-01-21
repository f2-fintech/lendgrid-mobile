// src/hooks/useCommissions.ts

import { commissionsApi } from "@/apis/modules/commissions.api";
import {
  CommissionTransactionFilterInput,
  PaginatedCommissionTransactions,
} from "@/types/commissions";
import { useQuery } from "@tanstack/react-query";

export const COMMISSION_KEYS = {
  transactions: (params: {
    page: number;
    limit: number;
    filters?: CommissionTransactionFilterInput;
  }) => ["commissions", "transactions", params] as const,
};

export function useCommissionTransactions(options?: {
  page?: number;
  limit?: number;
  filters?: CommissionTransactionFilterInput;
  enabled?: boolean;
}) {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const filters = options?.filters;
  const enabled = options?.enabled ?? true;

  return useQuery<PaginatedCommissionTransactions>({
    queryKey: COMMISSION_KEYS.transactions({ page, limit, filters }),
    queryFn: async () => {
      const vars: any = { page, limit };
      if (filters && Object.keys(filters as any).length) vars.filters = filters;

      console.log("🚀 commissions vars >>>", JSON.stringify(vars, null, 2));

      return commissionsApi.getTransactions(vars);
    },
    enabled,
    onError: (e: any) => {
      console.log("❌ COMMISSIONS ERROR status:", e?.response?.status);
      console.log("❌ COMMISSIONS ERROR body:", JSON.stringify(e?.response?.data, null, 2));
    },
  });
}

