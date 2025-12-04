import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import ApplicationsList from "@/components/ui/dashboard/ApplicationsList";
import DashboardHeader from "@/components/ui/dashboard/DashboardHeader";
import DisbursalChart from "@/components/ui/dashboard/DisbursalChart";
import MetricsGrid from "@/components/ui/dashboard/MetricsGrid";

export default function AggregatorDashboard() {
  const theme = useTheme();
  const isDarkMode = useSelector((state: any) => state.theme.mode) === "dark";
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>Loading Dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader />
        <MetricsGrid />
        <DisbursalChart />
        <ApplicationsList />
      </ScrollView>
    </SafeAreaView>
  );
}