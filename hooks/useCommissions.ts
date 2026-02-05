// src/hooks/useCommissions.ts
import { commissionsApi } from "@/apis/modules/commissions.api";
import {
  CommissionTransactionFilterInput,
  PaginatedCommissionTransactions,
} from "@/types/commissions";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export const COMMISSION_KEYS = {
  transactions: (args: {
    limit: number;
    aggregatorId?: string;
    status?: string;
    filtersKey?: string;
  }) =>
    [
      "commissions",
      "transactions",
      args.limit,
      args.aggregatorId ?? "",
      args.status ?? "",
      args.filtersKey ?? "",
    ] as const,
};

export function useCommissionTransactionsInfinite(options?: {
  limit?: number;
  filters?: CommissionTransactionFilterInput;
  enabled?: boolean;
  refetchOnMountAlways?: boolean; // default true
}) {
  const queryClient = useQueryClient();

  const limit = options?.limit ?? 10;
  const enabled = options?.enabled ?? true;

  const aggregatorId = (options?.filters as any)?.aggregatorId as
    | string
    | undefined;
  const status = (options?.filters as any)?.status as string | undefined;

  const filtersKey = useMemo(() => {
    return options?.filters ? JSON.stringify(options.filters) : "";
  }, [options?.filters]);

  const refetchOnMountAlways = options?.refetchOnMountAlways ?? true;

  const queryKey = COMMISSION_KEYS.transactions({
    limit,
    aggregatorId,
    status,
    filtersKey,
  });

  const query = useInfiniteQuery<PaginatedCommissionTransactions>({
    queryKey,

    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 1;

      const vars: any = { page, limit };
      if (options?.filters && Object.keys(options.filters as any).length) {
        vars.filters = options.filters;
      }

      return commissionsApi.getTransactions(vars);
    },

    enabled,

    staleTime: 0,
    refetchOnMount: refetchOnMountAlways ? "always" : true,
    refetchOnReconnect: true,
    retry: 1,

    initialPageParam: 1,

    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce(
        (sum, p) => sum + (p?.data?.length ?? 0),
        0,
      );

      const total = Number(lastPage?.total ?? 0);
      if (!total) return undefined;
      if (loaded >= total) return undefined;

      return allPages.length + 1;
    },
  });

  /**
   * Reset without nuking cache
   * Keeps page-1 data, drops other pages.
   * So UI doesn’t blank / dashboard doesn’t “reload”
   */
  const resetToFirstPage = () => {
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old?.pages?.length) return old;

      return {
        ...old,
        pages: [old.pages[0]],
        pageParams: [1],
      };
    });
  };

  return {
    ...query,
    resetToFirstPage,
    queryKey,
  };
}
