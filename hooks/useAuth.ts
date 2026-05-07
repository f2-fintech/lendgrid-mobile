// hooks/useAuth.ts

import {
  findUsersByRoleApi,
  getProfileApi,
  getUsersApi,
  removeUserApi,
  signInApi,
  signUpApi,
  updateUserApi,
  type LoginResponse,
  type SignUpResponse,
} from "@/apis/modules/auth.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * LOGIN
 */
export const useLogin = () =>
  useMutation<
    LoginResponse,
    Error,
    { email: string; password: string; captchaToken: string }
  >({
    mutationFn: signInApi,
  });

/**
 * SIGN UP
 */
export const useSignUp = () =>
  useMutation<SignUpResponse, Error, any & { captchaToken: string }>({
    mutationFn: signUpApi,
  });

/**
 * CURRENT USER PROFILE
 */
export const useProfile = (enabled = true) =>
  useQuery({
    queryKey: ["profile"],
    queryFn: getProfileApi,
    enabled,
  });

/**
 * UPDATE USER (important for Profile tab)
 * Make sure updateUserApi expects payload with `id` (NOT `_id`)
 */
export const useUpdateUser = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateUserApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["usersByRole"] });
    },
  });
};

/**
 * GET USERS (paginated)
 */
export const useUsers = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) =>
  useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsersApi(params),
    enabled: true,
  });

/**
 * USERS BY ROLE (paginated)
 */
export const useUsersByRole = (
  role: string,
  params?: { page?: number; limit?: number },
) =>
  useQuery({
    queryKey: ["usersByRole", role, params],
    queryFn: () => findUsersByRoleApi(role, params),
    enabled: !!role,
  });

/**
 * REMOVE USER
 */
export const useRemoveUser = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: removeUserApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["usersByRole"] });
    },
  });
};
