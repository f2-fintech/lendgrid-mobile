import { AppsHeaderRight } from "@/components/common/AppHeader";
import MultiStepApplicationForm from "@/components/ui/applications/MultiStepApplicationForm";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function CreateApplicationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    loanType?: string;
    loanCategory?: "secured" | "unsecured";
    productId?: string;
  }>();
  const navigation = useNavigation();
  const theme = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Create Application",

      headerStyle: { backgroundColor: theme.colors.background },
      headerTintColor: theme.colors.onSurface,
      headerTitleStyle: { fontWeight: "700", fontSize: 18 },

      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginLeft: 5, marginRight: 15 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
      ),

      headerRight: () => <AppsHeaderRight />,
    });
  }, [navigation, router, theme.colors.background, theme.colors.onSurface]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <MultiStepApplicationForm
        showHeader={false as any}
        initialLoanType={params.loanType}
        initialLoanCategory={params.loanCategory}
        onClose={() => router.back()}
        onSuccess={() => router.replace("/applications")}
      />
    </View>
  );
}
