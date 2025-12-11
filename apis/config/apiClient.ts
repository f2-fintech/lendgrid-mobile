import { api } from "@/apis/config/axiosConfig";

export async function gqlRequest<T>(
  query: string,
  variables: any = {}
): Promise<T> {
  try {
    const res = await api.post("", { query, variables });

    if (res.data.errors) {
      throw new Error(res.data.errors[0].message);
    }

    return res.data.data;
  } catch (err) {
    console.log("GraphQL Error:", err);
    throw err;
  }
}
