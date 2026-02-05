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
  { method = "GET", data, params, config }: RestOptions = {},
): Promise<T> {
  const resp = await restApi.request<T>({
    url: path,
    method,
    data,
    params,
    ...(config || {}),
  }); // } as AxiosRequestConfig;

  // //  REQUEST LOG
  // try {
  //   console.log("➡️ [REST REQUEST]", {
  //     baseURL: restApi.defaults.baseURL,
  //     url: req.url,
  //     method: req.method,
  //     params: req.params,
  //     hasBody: !!req.data,
  //     // headers visible? (only if you pass headers explicitly)
  //     headers: req.headers ? req.headers : undefined,
  //   });
  // } catch {}

  // try {
  //   const resp = await restApi.request<T>(req);

  //   const ms = Date.now() - startedAt;

  //   //  RESPONSE LOG
  //   try {
  //     console.log(` [REST RESPONSE] (${ms}ms) ${path}`, {
  //       status: resp.status,
  //       // keep it safe: only show data (not huge)
  //       data: resp.data,
  //     });
  //   } catch {}

  return resp.data;
  // } catch (err: any) {
  //   const ms = Date.now() - startedAt;

  //   // ERROR LOG
  //   console.log(`❌ [REST ERROR] (${ms}ms) ${path}`, {
  //     baseURL: err?.config?.baseURL,
  //     url: err?.config?.url,
  //     method: err?.config?.method,
  //     params: err?.config?.params,
  //     status: err?.response?.status,
  //     message: err?.message,
  //     body: err?.response?.data,
  //   });

  //   throw err;
  // }
}
