// apis/modules/oms-auth-api.ts
//
// OMS Staff authentication — uses restApi (axios instance pointing to EXPO_PUBLIC_ADMIN_API_URL)
// which is the same base URL as NEXT_PUBLIC_ADMIN_URL on the website.
// No captcha required for OMS staff login.

import { restRequest } from "@/apis/config/restClient";

export interface OmsLoginPayload {
  email: string;
  password: string;
}

export interface OmsLoginResponse {
  access_token: string;
  message?: string;
}

// OMS backend uses ResponseFormatter.success → { statusCode, message, data: { access_token } }
// restRequest<T> already unwraps resp.data (the axios response body),
// so the full shape coming back is the envelope itself.
export const omsAuthApi = {
  login: async (payload: OmsLoginPayload): Promise<OmsLoginResponse> => {
    const envelope = await restRequest<{
      statusCode: number;
      message: string;
      data: OmsLoginResponse;
    }>("/login", {
      method: "POST",
      data: payload,
    });

    // Unwrap the ResponseFormatter envelope → { access_token }
    return envelope.data;
  },
};
