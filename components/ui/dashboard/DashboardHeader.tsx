import { toggleTheme } from "@/redux/features/themeSlice";
import { RootState } from "@/redux/store";
import { dashboardStyles } from "@/styles/components/dashboard/dashboard.styles";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

export default function DashboardHeader() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.mode) === "dark";

  return (
    <View style={dashboardStyles.header}>
      <View>
        <Text style={[dashboardStyles.title, { color: theme.colors.onSurface }]}>
          Dashboard
        </Text>
        <Text style={[dashboardStyles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Welcome back!  your performance overview.
        </Text>
      </View>

      <View style={dashboardStyles.headerActions}>
        <TouchableOpacity style={[dashboardStyles.dateButton, {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.outline,
          marginRight: 1,
          marginLeft:-10
        }]}>
          <Feather name="calendar" size={16} color={theme.colors.primary} />
          <Text style={[dashboardStyles.dateButtonText, { color: theme.colors.primary }]}>
            Last 30 days
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => dispatch(toggleTheme())} 
          style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: theme.colors.surfaceVariant,
            borderWidth: 1, borderColor: theme.colors.outline,
            justifyContent: "center", alignItems: "center",
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.18, shadowRadius: 1, elevation: 3,
          }}
        >
          <Feather name={isDarkMode ? "sun" : "moon"} size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}