import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

type TabId = "trends" | "history" | "rates";

type Props = {
  selectedTab: TabId;
  setSelectedTab: (t: TabId) => void;
  onTabPress?: (t: TabId) => void; // ✅ added (to move pager)
};

export function CommissionTabs({
  selectedTab,
  setSelectedTab,
  onTabPress,
}: Props) {
  const theme = useTheme();

  const wrapBg = theme.colors.surfaceVariant;
  const border = theme.colors.outline;

  const activeBg = theme.colors.primary;
  const activeText = (theme.colors as any).onPrimary ?? "#FFFFFF";
  const inactiveText = theme.colors.onSurfaceVariant;

  const tabs = useMemo(
    () => [
      {
        id: "trends" as const,
        label: "Trends",
        icon: "bar-chart-2" as const,
      },
      {
        id: "history" as const,
        label: "History",
        icon: "clock" as const,
      },
      {
        id: "rates" as const,
        label: "My Rates",
        icon: "percent" as const,
      },
    ],
    [],
  );

  return (
    <View
      style={{
        flexDirection: "row",
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 12,
        backgroundColor: wrapBg,
        borderRadius: 14,
        padding: 6,
        borderWidth: 1,
        borderColor: border,
      }}
    >
      {tabs.map((t) => {
        const active = selectedTab === t.id;

        return (
          <TouchableOpacity
            key={t.id}
            activeOpacity={0.85}
            onPress={() => {
              setSelectedTab(t.id);
              onTabPress?.(t.id);
            }}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: active ? activeBg : "transparent",
            }}
          >
            <Feather
              name={t.icon}
              size={18}
              color={active ? activeText : inactiveText}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: active ? "800" : "700",
                color: active ? activeText : inactiveText,
              }}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
