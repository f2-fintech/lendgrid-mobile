import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { commissionsStyles } from "../../../styles/components/commissions/commissions.styles";

interface CommissionTabsProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

export const CommissionTabs = ({
  selectedTab,
  setSelectedTab,
}: CommissionTabsProps) => {
  const tabs = [
    { id: "trends", label: "Trends" },
    { id: "breakdown", label: "Lenders" },
    { id: "history", label: "History" },
  ];

  return (
    <View style={commissionsStyles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={commissionsStyles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                commissionsStyles.tab,
                selectedTab === tab.id && commissionsStyles.activeTab,
              ]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text
                style={[
                  commissionsStyles.tabText,
                  selectedTab === tab.id && commissionsStyles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
