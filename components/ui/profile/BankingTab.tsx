import { useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text, TextInput, useTheme } from "react-native-paper";

type Props = {
  uiState?: { isEditMode: boolean; activeTab: string };
};

export default function BankingTab({ uiState }: Props) {
  const theme = useTheme();
  const isEditMode = !!uiState?.isEditMode;
  const isActive = uiState?.activeTab === "banking";

  const firstRef = useRef<any>(null);

  const {
    control,
    formState: { errors },
  } = useFormContext();

  useEffect(() => {
    if (isEditMode && isActive) {
      setTimeout(() => firstRef.current?.focus?.(), 250);
    }
  }, [isEditMode, isActive]);

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ paddingVertical: 10, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <Text
        variant="headlineSmall"
        style={{ fontWeight: "700", marginBottom: 6 }}
      >
        Banking Details
      </Text>

      <Text
        variant="bodyMedium"
        style={{ marginBottom: 22, color: theme.colors.onSurfaceVariant }}
      >
        Enter your primary account details for payouts.
      </Text>

      <Controller
        control={control}
        name="accountHolderName"
        render={({ field }) => (
          <TextInput
            ref={firstRef}
            label="Account Holder Name"
            mode="outlined"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            editable={isEditMode}
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.accountHolderName && (
        <Text
          style={{ color: theme.colors.error, marginBottom: 16, fontSize: 12 }}
        >
          {errors.accountHolderName.message as any}
        </Text>
      )}

      <Controller
        control={control}
        name="accountNumber"
        render={({ field }) => (
          <TextInput
            label="Account Number"
            mode="outlined"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType="number-pad"
            editable={isEditMode}
            style={{ marginBottom: 4 }}
          />
        )}
      />

      <Controller
        control={control}
        name="ifscCode"
        render={({ field }) => (
          <TextInput
            label="IFSC Code"
            mode="outlined"
            value={field.value}
            onChangeText={(t) => field.onChange(t.toUpperCase())}
            onBlur={field.onBlur}
            autoCapitalize="characters"
            editable={isEditMode}
            style={{ marginBottom: 4 }}
          />
        )}
      />

      <Controller
        control={control}
        name="bankName"
        render={({ field }) => (
          <TextInput
            label="Bank Name"
            mode="outlined"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            editable={isEditMode}
            style={{ marginBottom: 4 }}
          />
        )}
      />

      <View style={{ height: 50 }} />
    </KeyboardAwareScrollView>
  );
}
