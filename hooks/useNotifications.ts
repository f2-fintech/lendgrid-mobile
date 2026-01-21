// hooks/useNotifications.ts
import { useMutation, useQuery, useSubscription } from "@apollo/client/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

import {
  GET_NOTIFICATION_STATS,
  GET_NOTIFICATIONS,
  MARK_ALL_NOTIFICATIONS_AS_READ,
  NOTIFICATION_CREATED_SUB,
} from "@/apis/modules/notifications.api";

import type {
  BackendNotification,
  GetNotificationsResult,
  GetNotificationStatsResult,
  MarkAllAsReadResult,
  NotificationSubscriptionResult,
  UiNotification,
  UseNotificationsMeta,
  UseNotificationsParams,
} from "@/types/notifications";

import {
  getGraphqlAuthToken,
  setGraphqlAuthToken,
} from "@/apis/config/graphql_Notification_Client";

// ---------- Helpers ----------
const getIconMeta = (n: BackendNotification): { icon: string; bg: string } => {
  switch (n.type) {
    case "COMMISSION_STATUS_CHANGE":
      return { icon: "cash-outline", bg: "#10B981" };

    case "TICKET_STATUS_CHANGE":
      if (n.newStatus?.toLowerCase() === "rejected") {
        return { icon: "close-circle-outline", bg: "#EF4444" };
      }
      if (n.newStatus?.toLowerCase() === "disbursed") {
        return { icon: "wallet-outline", bg: "#8B5CF6" };
      }
      return { icon: "document-text-outline", bg: "#3B82F6" };

    default:
      return { icon: "information-circle-outline", bg: "#6366F1" };
  }
};

const formatRelativeTime = (iso: string): string => {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString();
};

// ---------- Hook ----------
export const useNotifications = ({
  mode = "list",
  page = 1,
  limit = 50,
  filters = {},
}: UseNotificationsParams = {}) => {
  const isListMode = mode === "list";

  // ----------------------------------------------------
  // ✅ Token bootstrap (frontend safe)
  // ----------------------------------------------------
  const [tokenReady, setTokenReady] = useState(false);
  const [hasToken, setHasToken] = useState<boolean>(!!getGraphqlAuthToken());
  const tokenPollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const existing = getGraphqlAuthToken();
        if (existing) {
          if (!alive) return;
          setHasToken(true);
          setTokenReady(true);
          return;
        }

        const stored = await AsyncStorage.getItem("token");
        if (!alive) return;

        if (stored) {
          setGraphqlAuthToken(stored);
          setHasToken(true);
        } else {
          setHasToken(false);
        }
      } catch (e) {
        console.warn("[useNotifications] token bootstrap error =>", e);
        setHasToken(!!getGraphqlAuthToken());
      } finally {
        if (alive) setTokenReady(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (tokenPollRef.current) clearInterval(tokenPollRef.current);

    tokenPollRef.current = setInterval(() => {
      const next = !!getGraphqlAuthToken();
      setHasToken((prev) => (prev !== next ? next : prev));
    }, 800);

    return () => {
      if (tokenPollRef.current) clearInterval(tokenPollRef.current);
    };
  }, []);

  // ----------------------------------------------------
  // ✅ Queries
  // ----------------------------------------------------
  const listQuery = useQuery<GetNotificationsResult>(GET_NOTIFICATIONS, {
    variables: { page, limit, filters },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    skip: !tokenReady || !hasToken || !isListMode,
    notifyOnNetworkStatusChange: true,
  });

  const statsQuery = useQuery<GetNotificationStatsResult>(
    GET_NOTIFICATION_STATS,
    {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      skip: !tokenReady || !hasToken || isListMode,
      notifyOnNetworkStatusChange: true,
    }
  );

  const loading = isListMode ? listQuery.loading : statsQuery.loading;
  const error = isListMode ? listQuery.error : statsQuery.error;

  const refetch = useCallback(async () => {
    if (!tokenReady || !hasToken) return;
    if (isListMode) return listQuery.refetch();
    return statsQuery.refetch();
  }, [tokenReady, hasToken, isListMode, listQuery, statsQuery]);

  // ----------------------------------------------------
  // ✅ Subscription attempt
  // ----------------------------------------------------
  const subFiredOnceRef = useRef(false);

  useSubscription<NotificationSubscriptionResult>(NOTIFICATION_CREATED_SUB, {
    skip: !tokenReady || !hasToken,
    onData: ({ data }) => {
      const n = data?.data?.notificationCreated;
      if (!n) return;
      subFiredOnceRef.current = true;
      console.log("[SUB] notificationCreated =>", n._id);
      refetch();
    },
    onError: (e) => {
      console.warn("[SUB] subscription error =>", e?.message || e);
    },
  });

  // ----------------------------------------------------
  // ✅ POLLING FALLBACK
  // ----------------------------------------------------
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const pollingIntervalMs = 3000;

  const startPolling = useCallback(() => {
    if (!tokenReady || !hasToken) return;

    const ms = subFiredOnceRef.current ? 8000 : pollingIntervalMs;

    try {
      if (isListMode) listQuery.startPolling(ms);
      else statsQuery.startPolling(ms);
    } catch {}
  }, [tokenReady, hasToken, isListMode, listQuery, statsQuery]);

  const stopPolling = useCallback(() => {
    try {
      if (isListMode) listQuery.stopPolling();
      else statsQuery.stopPolling();
    } catch {}
  }, [isListMode, listQuery, statsQuery]);

  useEffect(() => {
    if (!tokenReady || !hasToken) return;

    startPolling();

    const sub = AppState.addEventListener("change", (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      const becameActive =
        (prev === "inactive" || prev === "background") &&
        nextState === "active";

      const becameBackground =
        nextState === "inactive" || nextState === "background";

      if (becameActive) {
        refetch();
        startPolling();
      } else if (becameBackground) {
        stopPolling();
      }
    });

    return () => {
      sub.remove();
      stopPolling();
    };
  }, [tokenReady, hasToken, startPolling, stopPolling, refetch]);

  // ----------------------------------------------------
  // ✅ Mark-all-read mutation (only on list screen blur)
  // ----------------------------------------------------
  const [markAllAsRead] = useMutation<MarkAllAsReadResult>(
    MARK_ALL_NOTIFICATIONS_AS_READ
  );

  useFocusEffect(
    useCallback(() => {
      if (!isListMode) return;

      return () => {
        (async () => {
          try {
            if (!getGraphqlAuthToken()) return;

            await markAllAsRead({
              refetchQueries: [
                {
                  query: GET_NOTIFICATIONS,
                  variables: { page, limit, filters },
                },
                { query: GET_NOTIFICATION_STATS },
              ],
              awaitRefetchQueries: true,
            });
          } catch (e: any) {
            console.warn(
              "[NOTIFICATIONS] markAllAsRead error =>",
              e?.message || e
            );
          }
        })();
      };
    }, [isListMode, markAllAsRead, page, limit, filters])
  );

  // ----------------------------------------------------
  // ✅ Map list -> UI  (UPDATED: actionUrl + ids + type)
  // ----------------------------------------------------
  const notifications: UiNotification[] = useMemo(() => {
    if (!isListMode) return [];

    const list = listQuery.data?.getNotifications?.data ?? [];

    return list.map((n) => {
      const { icon, bg } = getIconMeta(n);

      return {
        id: n._id,
        title: n.title,
        body: n.message,
        timeLabel: formatRelativeTime(n.createdAt),
        unread: n.status === "UNREAD",
        icon,
        iconBg: bg,

        // ✅ Add these for routing
        actionUrl: (n as any).actionUrl ?? null,
        type: (n as any).type ?? null,
        ticketId: (n as any).ticketId ?? null,
        commissionTransactionId: (n as any).commissionTransactionId ?? null,
      } as any;
    });
  }, [isListMode, listQuery.data]);

  // ----------------------------------------------------
  // ✅ Meta for both modes
  // ----------------------------------------------------
  const meta: UseNotificationsMeta = useMemo(() => {
    if (!tokenReady || !hasToken) return { total: 0, unreadCount: 0 };

    if (isListMode) {
      return {
        total: listQuery.data?.getNotifications?.total ?? 0,
        unreadCount: listQuery.data?.getNotifications?.unreadCount ?? 0,
      };
    }

    return {
      total: statsQuery.data?.getNotificationStats?.totalNotifications ?? 0,
      unreadCount: statsQuery.data?.getNotificationStats?.unreadCount ?? 0,
    };
  }, [tokenReady, hasToken, isListMode, listQuery.data, statsQuery.data]);

  return {
    notifications,
    meta,
    loading,
    error,
    refetch,
  };
};
