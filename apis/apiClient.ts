import { api } from "./config/axiosConfig";

export async function gqlRequest(query: string, variables: any = {}) {
  try {
    const response = await api.post("", { query, variables });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data;
  } catch (error: any) {
    console.log("GraphQL Error:", error);
    throw error;
  }
}
