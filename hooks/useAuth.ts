import {
    getProfileApi,
    LoginResponse,
    signInApi,
    signUpApi,
    SignUpResponse,
} from "@/apis/modules/auth.api";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useLogin = () =>
  useMutation<LoginResponse, Error, { email: string; password: string }>({
    mutationFn: signInApi,
  });

export const useSignUp = () =>
  useMutation<SignUpResponse, Error, any>({
    mutationFn: signUpApi,
  });

export const useProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: getProfileApi,
  });
