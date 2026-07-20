import { toggleTheme } from "@/redux/features/themeSlice";
import { RootState } from "@/redux/store";
import { dashboardStyles } from "@/styles/components/dashboard/dashboard.styles";
import { Feather } from "@expo/vector-icons";
import { Image, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";

export default function DashboardHeader() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.mode) === "dark";

  return (
    <View style={dashboardStyles.header}>
      <View style={dashboardStyles.headerLeft}>
        <Image
          source={require('@/assets/images/logo_blue_croped.png')}
          style={{ width: 40, height: 40, resizeMode: 'contain' }}
        />
      </View>

      <View style={dashboardStyles.headerActions}>
        <TouchableOpacity
          onPress={() => dispatch(toggleTheme())}
          style={[dashboardStyles.themeToggleButton, {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.outline,
            borderWidth: 1,
          }]}
        >
          <Feather name={isDarkMode ? "sun" : "moon"} size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}