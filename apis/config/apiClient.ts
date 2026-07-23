import AsyncStorage from "@react-native-async-storage/async-storage";
import { setGraphqlAuthToken } from "./graphql_Notification_Client";
import { gqlApi } from "./axiosConfig";

export async function gqlRequest<T>(
  query: string,
  variables: any = {}
): Promise<T> {
  try {
    // NOTE: baseURL already ends with /graphql
    const res = await gqlApi.post("", { query, variables });

    if (res.data.errors) {
      const errorMsg = res.data.errors[0].message;
      const errorCode = res.data.errors[0].extensions?.code;
      
      if (errorMsg === "Unauthorized" || errorCode === "UNAUTHENTICATED") {
        console.warn("[API CLIENT] Unauthenticated error. Clearing token.");
        setGraphqlAuthToken(null);
        AsyncStorage.removeItem("token");
        AsyncStorage.removeItem("omsToken");
        AsyncStorage.removeItem("accessToken");
      }
      
      throw new Error(errorMsg);
    }

    return res.data.data as T;
  } catch (err: any) {
    if (err?.response?.status === 401) {
      console.warn("[API CLIENT] 401 HTTP error. Clearing token.");
      setGraphqlAuthToken(null);
      AsyncStorage.removeItem("token");
      AsyncStorage.removeItem("omsToken");
      AsyncStorage.removeItem("accessToken");
    }
    console.log("GraphQL Error:", err);
    throw err;
  }
}
