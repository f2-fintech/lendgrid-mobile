import { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

import { commissionsStyles } from "../../../styles/components/commissions/commissions.styles";

interface CommissionTabsProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

export const CommissionTabs = ({
  selectedTab,
  setSelectedTab,
}: CommissionTabsProps) => {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  const tabs = [
    { id: "trends", label: "Commission Trends" },
    { id: "history", label: "Payment History" },
  ];

  return (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tabs}>
          {tabs.map((tab) => {
            const active = selectedTab === tab.id;

            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  {
                    backgroundColor: active
                      ? (theme.colors as any).tabActiveBg
                      : (theme.colors as any).tabInactiveBg,
                  },
                ]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: active
                        ? (theme.colors as any).tabActiveText
                        : (theme.colors as any).tabInactiveText,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
