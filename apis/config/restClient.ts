// restClient.ts
import { AxiosRequestConfig, Method } from "axios";
import { restApi } from "./axiosConfig";

export type RestEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

type RestOptions = {
  method?: Method;
  data?: any;
  params?: Record<string, any>;
  config?: AxiosRequestConfig;
};

/**
 * Generic REST request wrapper for Admin (MySQL) API
 */
export async function restRequest<T>(
  path: string,
  { method = "GET", data, params, config }: RestOptions = {}
): Promise<T> {
  const resp = await restApi.request<T>({
    url: path,
    method,
    data,
    params,
    ...(config || {}),
  });

  return resp.data;
}
