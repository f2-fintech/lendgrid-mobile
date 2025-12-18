import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSelector } from "react-redux";

import ApplicationsList from "@/components/ui/dashboard/ApplicationsList";
import DisbursalChart from "@/components/ui/dashboard/DisbursalChart";
import MetricsGrid from "@/components/ui/dashboard/MetricsGrid";
import SkeletonLoader from "@/components/ui/dashboard/SkeletonLoader";

export default function AggregatorDashboard() {
  const theme = useTheme();
  const isDarkMode = useSelector((state: any) => state.theme.mode) === "dark";
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <SkeletonLoader />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: 16, 
          paddingBottom: 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <MetricsGrid />
        <DisbursalChart />
        <ApplicationsList />
      </ScrollView>
    </View>
  );
}
