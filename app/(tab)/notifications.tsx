import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";

import { useNotifications } from "@/hooks/useNotifications";

// Mobile routes
const MOBILE_ROUTES = {
  dashboard: "/dashboard",
  applications: "/applications",
  tickets: "/tickets",
  commissions: "/commissions",
} as const;

const getIconComponent = (iconName: string) => (
  <Ionicons name={iconName as any} size={22} color="#FFFFFF" />
);

const NotificationItem = ({ notification, theme, onOpen, isLast }: any) => {
  return (
    <View>
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: notification.unread
            ? theme.dark
              ? "rgba(147, 51, 234, 0.08)"
              : "rgba(147, 51, 234, 0.05)"
            : theme.colors.surface,
          borderLeftWidth: notification.unread ? 3 : 0,
          borderLeftColor: notification.unread ? "#9333EA" : "transparent",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <TouchableOpacity
            onPress={() => onOpen?.(notification)}
            activeOpacity={0.75}
            style={{ flex: 1, flexDirection: "row", alignItems: "flex-start" }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: notification.iconBg,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
                shadowColor: notification.iconBg,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {getIconComponent(notification.icon)}
            </View>

            <View style={{ flex: 1, paddingRight: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontWeight: notification.unread ? "700" : "600",
                    fontSize: 15,
                    color: theme.colors.onSurface,
                    flex: 1,
                    marginRight: 8,
                  }}
                >
                  {notification.title}
                </Text>

                <Text
                  style={{
                    fontSize: 11,
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: "500",
                  }}
                >
                  {notification.timeLabel}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 13,
                  lineHeight: 19,
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 6,
                }}
              >
                {notification.body}
              </Text>

              {notification.unread && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#9333EA",
                      marginRight: 6,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: "#9333EA",
                    }}
                  >
                    New
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {!isLast && (
        <Divider
          style={{
            backgroundColor: theme.dark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.06)",
          }}
        />
      )}
    </View>
  );
};

const normalizeTicketId = (value: any) => {
  if (value === null || value === undefined) return "";
  const match = String(value).match(/\d+/);
  return match?.[0] ?? "";
};

const getNotificationTicketId = (n: any) => {
  const directTicketId = normalizeTicketId(
    n?.ticketId ?? n?.ticketNo ?? n?.ticketNumber ?? n?.ticket_id,
  );
  if (directTicketId) return directTicketId;

  return normalizeTicketId(n?.actionUrl);
};

const getNotificationTarget = (
  n: any,
  fallbackPathname: string = MOBILE_ROUTES.dashboard,
): { pathname: string; params?: Record<string, string> } => {
  const type = String(n?.type || "").toUpperCase();
  const actionUrl = String(n?.actionUrl || "").toLowerCase();
  const ticketId = getNotificationTicketId(n);

  if (type === "TICKET_STATUS_CHANGE" || actionUrl.includes("ticket")) {
    return {
      pathname: MOBILE_ROUTES.tickets,
      params: {
        tab: "tickets",
        ...(ticketId ? { ticketId, openTicket: "1" } : {}),
      },
    };
  }

  if (actionUrl.includes("/aggregator/applications")) {
    return {
      pathname: MOBILE_ROUTES.applications,
      params: { tab: "applications" },
    };
  }

  if (
    type.includes("COMMISSION") ||
    actionUrl.includes("/aggregator/commissions") ||
    actionUrl.includes("commission")
  ) {
    return { pathname: MOBILE_ROUTES.commissions, params: { tab: "history" } };
  }

  return { pathname: fallbackPathname };
};

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userType, setUserType] = useState<string | null>(null);

  const { notifications, meta, loading, error, refetch } = useNotifications({
    mode: "list",
    page: 1,
    limit: 50,
    filters: {},
  });

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem("userType").then((storedUserType) => {
      if (mounted) setUserType(storedUserType);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const fallbackRoute =
    userType === "sales" ? MOBILE_ROUTES.applications : MOBILE_ROUTES.dashboard;

  const visibleNotifications = notifications || [];
  const visibleTotal = visibleNotifications.length;
  const hasNotifications = visibleNotifications.length > 0;

  const invalidateForRoute = useCallback(async (to: string) => {
    if (to === MOBILE_ROUTES.dashboard) {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: ["application-count"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-ticket-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["disbursed-by-month"] }),
        queryClient.invalidateQueries({ queryKey: ["commissions"] }),
      ]);
      return;
    }

    if (to === MOBILE_ROUTES.applications) {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: ["dashboard-ticket-stats"] }),
      ]);
      return;
    }

    if (to === MOBILE_ROUTES.commissions) {
      await queryClient.invalidateQueries({ queryKey: ["commissions"] });
      return;
    }
  }, [queryClient]);

  const openNotification = useCallback(
    async (n: any) => {
      const target = getNotificationTarget(n, fallbackRoute);

      await invalidateForRoute(target.pathname);

      router.push({
        pathname: target.pathname as any,
        params: {
          ...(target.params ?? {}),
          navId: String(Date.now()),
        },
      } as any);
    },
    [fallbackRoute, invalidateForRoute, router],
  );

  if (loading && visibleNotifications.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
          Loading notifications...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ color: theme.colors.error, fontWeight: "600" }}>
          Failed to load notifications
        </Text>
        <Text style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>
          {error.message}
        </Text>

        <TouchableOpacity
          onPress={() => refetch()}
          style={{
            marginTop: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.colors.primary,
          }}
        >
          <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingVertical: 8,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
    >
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: theme.colors.surface,
          marginBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: theme.colors.onSurfaceVariant,
              textTransform: "uppercase",
            }}
          >
            Recent Notifications
          </Text>

          <Text style={{ marginTop: 2, fontSize: 11 }}>
            Visible: {visibleTotal} · Total: {meta.total} · Unread:{" "}
            {meta.unreadCount}
          </Text>
        </View>
      </View>

      {!hasNotifications && (
        <View style={{ flex: 1, padding: 24, alignItems: "center" }}>
          <Ionicons
            name="notifications-off-outline"
            size={48}
            color={theme.colors.primary}
          />
          <Text style={{ marginTop: 10, fontWeight: "700", fontSize: 18 }}>
            All Caught Up!
          </Text>
        </View>
      )}

      <View>
        {visibleNotifications.map((notification: any, index: number) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            theme={theme}
            onOpen={openNotification}
            isLast={index === visibleNotifications.length - 1}
          />
        ))}
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}
