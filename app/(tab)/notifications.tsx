// app/(tab)/notifications.tsx
import { useMutation } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";

import {
  DELETE_NOTIFICATION,
  GET_NOTIFICATION_STATS,
  GET_NOTIFICATIONS,
} from "@/apis/modules/notifications.api";
import { useNotifications } from "@/hooks/useNotifications";

//  Mobile routes (use expo-router paths)
const MOBILE_ROUTES = {
  dashboard: "/dashboard",
  applications: "/applications",
  commissions: "/commissions",
  // notifications: "/notifications", // current screen
} as const;

//  Map website actionUrl -> mobile screen
const mapWebsiteActionUrlToMobile = (actionUrl?: string | null) => {
  if (!actionUrl) return null;

  const raw = String(actionUrl).trim();
  if (!raw) return null;

  // normalize
  const u = raw.startsWith("/") ? raw : `/${raw}`;

  // backend gives website paths like "/aggregator/applications"
  if (u.startsWith("/aggregator/applications"))
    return MOBILE_ROUTES.applications;
  if (u.startsWith("/aggregator/commissions")) return MOBILE_ROUTES.commissions;

  return null;
};

//  decide final navigation target
const getNotificationTarget = (n: any) => {
  // 1) actionUrl mapping
  const fromAction = mapWebsiteActionUrlToMobile(n?.actionUrl);
  if (fromAction) return fromAction;

  // 2) fallback by type
  const type = String(n?.type || "").toUpperCase();
  if (type === "TICKET_STATUS_CHANGE") return MOBILE_ROUTES.applications;
  if (type === "COMMISSION_STATUS_CHANGE") return MOBILE_ROUTES.commissions;

  // 3) fallback
  return MOBILE_ROUTES.dashboard;
};

const getIconComponent = (iconName: string) => (
  <Ionicons name={iconName as any} size={22} color="#FFFFFF" />
);

//  Animated notification item component
const AnimatedNotificationItem = ({
  notification,
  theme,
  onDelete,
  onOpen,
  isLast,
}: any) => {
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -40,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDelete(notification.id);
    });
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }}
    >
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
          {/*  Clickable area (opens route) */}
          <TouchableOpacity
            onPress={() => onOpen?.(notification)}
            activeOpacity={0.75}
            style={{ flex: 1, flexDirection: "row", alignItems: "flex-start" }}
          >
            {/* Left icon */}
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

            {/* Content */}
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
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

          {/*  Cross icon (delete single) */}
          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.75}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 4,
              backgroundColor: theme.dark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.03)",
            }}
          >
            <Ionicons
              name="close"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
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
    </Animated.View>
  );
};

//  Small helper: batch delete
const runBatches = async <T,>(
  items: T[],
  batchSize: number,
  worker: (item: T) => Promise<any>
) => {
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    await Promise.allSettled(chunk.map(worker));
  }
};

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { notifications, meta, loading, error, refetch } = useNotifications({
    mode: "list",
    page: 1,
    limit: 50,
    filters: {},
  });

  const [hiddenIds, setHiddenIds] = useState<Record<string, true>>({});
  const [clearing, setClearing] = useState(false);
  const [listOpacity] = useState(new Animated.Value(1));

  const [deleteOne] = useMutation(DELETE_NOTIFICATION);

  const visibleNotifications = useMemo(() => {
    if (!notifications?.length) return [];
    return notifications.filter((n: any) => !hiddenIds[n.id]);
  }, [notifications, hiddenIds]);

  const canClear = !clearing && visibleNotifications.length > 0;

  const removeOneOptimistic = async (id: string) => {
    setHiddenIds((prev) => ({ ...prev, [id]: true }));

    try {
      await deleteOne({
        variables: { id },
        refetchQueries: [
          {
            query: GET_NOTIFICATIONS,
            variables: { page: 1, limit: 50, filters: {} },
          },
          { query: GET_NOTIFICATION_STATS },
        ],
        awaitRefetchQueries: false,
      });
    } catch (e: any) {
      console.warn("[NOTIFICATIONS] delete error =>", e?.message || e);
      setHiddenIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const clearAll = async () => {
    if (!canClear) return;

    const ids = visibleNotifications.map((n: any) => n.id);

    Animated.timing(listOpacity, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(async () => {
      setHiddenIds((prev) => {
        const next = { ...prev };
        ids.forEach((id: string) => (next[id] = true));
        return next;
      });

      setClearing(true);
      try {
        await runBatches(ids, 5, (id) => deleteOne({ variables: { id } }));
        await refetch();
      } catch (e: any) {
        console.warn("[NOTIFICATIONS] clearAll error =>", e?.message || e);
      } finally {
        setClearing(false);
        listOpacity.setValue(1);
      }
    });
  };

  //  open notification route
  const openNotification = useCallback(
    (n: any) => {
      const to = getNotificationTarget(n);

      // If in future you create detail screens, you can pass params here.
      // Example:
      // if (to === MOBILE_ROUTES.applications && n?.ticketId) {
      //   router.push({ pathname: "/applications", params: { ticketId: String(n.ticketId) } });
      //   return;
      // }

      router.push(to as any);
    },
    [router]
  );

  const visibleTotal = visibleNotifications.length;

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
        <Text
          style={{
            marginTop: 8,
            color: theme.colors.onSurfaceVariant,
            fontSize: 13,
          }}
        >
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
        <Text
          style={{
            color: theme.colors.error,
            fontWeight: "600",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Failed to load notifications
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontSize: 12,
            color: theme.colors.onSurfaceVariant,
            textAlign: "center",
          }}
        >
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
          <Text
            style={{
              color: theme.colors.primary,
              fontWeight: "600",
              fontSize: 13,
            }}
          >
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasNotifications = visibleNotifications.length > 0;

  return (
    <ScrollView
      contentContainerStyle={{
        paddingVertical: 8,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
    >
      {/* Header */}
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
              letterSpacing: 0.5,
            }}
          >
            Recent Notifications
          </Text>

          <Text
            style={{
              marginTop: 2,
              fontSize: 11,
              color: theme.colors.onSurfaceVariant,
            }}
          >
            Visible: {visibleTotal} · Total: {meta.total} · Unread:{" "}
            {meta.unreadCount}
          </Text>
        </View>

        {/* Clear All */}
        <TouchableOpacity
          onPress={clearAll}
          activeOpacity={0.85}
          disabled={!canClear}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: canClear ? theme.colors.error : theme.colors.outline,
            opacity: canClear ? 1 : 0.5,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {clearing ? (
            <ActivityIndicator size="small" color={theme.colors.error} />
          ) : (
            <Ionicons
              name="trash-outline"
              size={16}
              color={theme.colors.error}
            />
          )}
          <Text
            style={{
              marginLeft: 6,
              fontSize: 12,
              fontWeight: "800",
              color: theme.colors.error,
            }}
          >
            Clear All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Empty state */}
      {!hasNotifications && (
        <View style={{ flex: 1, padding: 24, alignItems: "center" }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: theme.dark
                ? "rgba(147, 51, 234, 0.1)"
                : "rgba(147, 51, 234, 0.08)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color={theme.colors.primary}
            />
          </View>
          <Text
            style={{
              fontWeight: "700",
              fontSize: 18,
              color: theme.colors.onSurface,
              marginBottom: 8,
            }}
          >
            All Caught Up!
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.onSurfaceVariant,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            We'll keep you posted when there's something important about your
            tickets or commissions.
          </Text>
        </View>
      )}

      {/* Animated List */}
      <Animated.View style={{ opacity: listOpacity }}>
        {visibleNotifications.map((notification: any, index: number) => (
          <AnimatedNotificationItem
            key={notification.id}
            notification={notification}
            theme={theme}
            onDelete={removeOneOptimistic}
            onOpen={openNotification} //  click navigation
            isLast={index === visibleNotifications.length - 1}
          />
        ))}
      </Animated.View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}
