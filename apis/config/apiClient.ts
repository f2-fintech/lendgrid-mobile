// apiClient.ts
import { gqlApi } from "./axiosConfig";

export async function gqlRequest<T>(
  query: string,
  variables: any = {}
): Promise<T> {
  try {
    // NOTE: baseURL already ends with /graphql
    const res = await gqlApi.post("", { query, variables });

    if (res.data.errors) {
      throw new Error(res.data.errors[0].message);
    }

    return res.data.data as T;
  } catch (err) {
    console.log("GraphQL Error:", err);
    throw err;
  }
}
