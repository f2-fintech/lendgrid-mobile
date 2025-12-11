import { aggregatorApi } from "@/apis/modules/aggregator.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* ---------------------------------------------
  QUERY KEYS (for caching)
---------------------------------------------- */
export const AGGREGATOR_KEYS = {
  myProfile: ["aggregator", "my-profile"] as const,
  list: (page: number, limit: number) =>
    ["aggregator", "list", page, limit] as const,
  details: (id: string) => ["aggregator", "details", id] as const,
};

/* ---------------------------------------------
  FETCH MY AGGREGATOR PROFILE
---------------------------------------------- */
export function useMyAggregatorProfile() {
  return useQuery({
    queryKey: AGGREGATOR_KEYS.myProfile,
    queryFn: async () => {
      const res = await aggregatorApi.getMyProfile();
      return res.myAggregatorProfile;
    },
  });
}

/* ---------------------------------------------
  FETCH PAGINATED LIST OF AGGREGATORS
---------------------------------------------- */
export function useAggregatorList(page = 1, limit = 10) {
  return useQuery({
    queryKey: AGGREGATOR_KEYS.list(page, limit),
    queryFn: async () => {
      const res = await aggregatorApi.findAll({ page, limit });
      return res.findAllAggregatorProfiles;
    },
  });
}

/* ---------------------------------------------
  GET AGGREGATOR DETAILS BY ID
---------------------------------------------- */
export function useAggregatorDetails(id: string) {
  return useQuery({
    queryKey: AGGREGATOR_KEYS.details(id),
    queryFn: async () => {
      const res = await aggregatorApi.findOne(id);
      return res.findOneAggregatorProfile;
    },
    enabled: !!id,
  });
}

/* ---------------------------------------------
  CREATE NEW AGGREGATOR PROFILE
---------------------------------------------- */
export function useCreateAggregator() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => aggregatorApi.create(payload),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aggregator"] });
    },
  });
}

/* ---------------------------------------------
  UPDATE EXISTING AGGREGATOR PROFILE
---------------------------------------------- */
export function useUpdateAggregator() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => aggregatorApi.update(payload),

    onSuccess: (result) => {
      const updated = result.updateAggregatorProfile;

      qc.invalidateQueries({
        queryKey: AGGREGATOR_KEYS.details(updated._id),
      });

      qc.invalidateQueries({ queryKey: AGGREGATOR_KEYS.myProfile });
      qc.invalidateQueries({ queryKey: ["aggregator", "list"] });
    },
  });
}

/* ---------------------------------------------
  UPDATE KYC STATUS
---------------------------------------------- */
export function useKycStatusUpdate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason,
    }: {
      id: string;
      status: string;
      rejectionReason?: string;
    }) => aggregatorApi.updateKycStatus(id, status as any, rejectionReason),

    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: AGGREGATOR_KEYS.details(vars.id),
      });
      qc.invalidateQueries({ queryKey: ["aggregator", "list"] });
    },
  });
}

/* ---------------------------------------------
  ADD TEAM MEMBER
---------------------------------------------- */
export function useAddTeamMember() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; userId: string }) =>
      aggregatorApi.addTeamMember(params.id, params.userId),

    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: AGGREGATOR_KEYS.details(vars.id),
      });
    },
  });
}

/* ---------------------------------------------
  REMOVE TEAM MEMBER
---------------------------------------------- */
export function useRemoveTeamMember() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; userId: string }) =>
      aggregatorApi.removeTeamMember(params.id, params.userId),

    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: AGGREGATOR_KEYS.details(vars.id),
      });
    },
  });
}
