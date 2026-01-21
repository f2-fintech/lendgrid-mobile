// apis/config/graphql_Notification_Client.ts
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
  split,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import Constants from "expo-constants";
import { Client, createClient } from "graphql-ws";

//  Read env safely
const extra =
  (Constants.expoConfig?.extra as any) ??
  ((Constants as any).manifest?.extra as any) ??
  {};

const GRAPHQL_HTTP_URL: string =
  extra.GRAPHQL_HTTP_URL ??
  extra.EXPO_PUBLIC_GRAPHQL_HTTP_URL ??
  extra.API_URL ??
  "https://YOUR_API/graphql";

const GRAPHQL_WS_URL: string =
  extra.GRAPHQL_WS_URL ??
  extra.EXPO_PUBLIC_GRAPHQL_WS_URL ??
  (GRAPHQL_HTTP_URL.startsWith("https")
    ? GRAPHQL_HTTP_URL.replace(/^https/, "wss")
    : GRAPHQL_HTTP_URL.replace(/^http/, "ws"));

console.log("[GRAPHQL CLIENT] HTTP =", GRAPHQL_HTTP_URL);
console.log("[GRAPHQL CLIENT] WS   =", GRAPHQL_WS_URL);

// --------------------
//  Token store (single source)
// --------------------
let authToken: string | null = null;
export const getGraphqlAuthToken = () => authToken;

let wsClient: Client | null = null;

//  IMPORTANT:
// We keep one wsClient, but connectionParams reads CURRENT token always.
// And when token changes, we dispose so it reconnects with new token.
export const setGraphqlAuthToken = (token: string | null) => {
  const changed = token !== authToken;
  authToken = token;

  console.log(
    "[GRAPHQL CLIENT] setGraphqlAuthToken =>",
    token ? "SET" : "CLEARED"
  );

  if (changed && wsClient) {
    console.log("[GRAPHQL CLIENT] WS dispose (token changed) => reconnect");
    try {
      wsClient.dispose();
    } catch (e) {
      console.warn("[GRAPHQL CLIENT] WS dispose error =>", e);
    }
  }
};

// --------------------
//  HTTP link + auth headers
// --------------------
const httpLink = new HttpLink({ uri: GRAPHQL_HTTP_URL });

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
    },
  }));
  return forward(operation);
});

// --------------------
//  WS Link WITHOUT GraphQLWsLink (custom ApolloLink)
// This is the real fix: subscription reads token at subscribe-time.
// --------------------
const wsApolloLink = new ApolloLink((operation) => {
  return new Observable((sink) => {
    if (typeof WebSocket === "undefined") {
      sink.error(new Error("WebSocket not available in this environment"));
      return;
    }

    if (!wsClient) {
      wsClient = createClient({
        url: GRAPHQL_WS_URL,
        lazy: true,
        retryAttempts: 50,
        keepAlive: 12000,
        connectionParams: () => ({
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
        }),
        on: {
          connected: () => console.log("[GRAPHQL WS] connected"),
          closed: () => console.log("[GRAPHQL WS] closed"),
          error: (err) => console.warn("[GRAPHQL WS] error", err),
        },
      });
    }

    const dispose = wsClient.subscribe(
      {
        query: operation.query.loc?.source.body || "",
        variables: operation.variables,
        operationName: operation.operationName,
      },
      {
        next: (value) => sink.next(value as any),
        error: (err) => sink.error(err as any),
        complete: () => sink.complete(),
      }
    );

    return () => {
      try {
        dispose();
      } catch {}
    };
  });
});

// --------------------
//  split: subscriptions => wsApolloLink, rest => http
// --------------------
const link = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return (
      def.kind === "OperationDefinition" && def.operation === "subscription"
    );
  },
  wsApolloLink,
  authLink.concat(httpLink)
);

// --------------------
//  Apollo client
// --------------------
export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
