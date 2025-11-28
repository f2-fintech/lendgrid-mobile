import { Controller, useFormContext } from "react-hook-form";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text, TextInput, useTheme } from "react-native-paper";

export default function BankingTab() {
  const theme = useTheme();

  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ paddingVertical: 10, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      {/* ---------------- HEADER ---------------- */}
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

      {/* ---------------- ACCOUNT HOLDER NAME ---------------- */}
      <Controller
        control={control}
        name="accountHolderName"
        render={({ field }) => (
          <TextInput
            label="Account Holder Name"
            mode="outlined"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.accountHolderName && (
        <Text
          style={{
            color: theme.colors.error,
            marginBottom: 16,
            fontSize: 12,
          }}
        >
          {errors.accountHolderName.message}
        </Text>
      )}

      {/* ---------------- ACCOUNT NUMBER ---------------- */}
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
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.accountNumber && (
        <Text
          style={{
            color: theme.colors.error,
            marginBottom: 16,
            fontSize: 12,
          }}
        >
          {errors.accountNumber.message}
        </Text>
      )}

      {/* ---------------- IFSC CODE ---------------- */}
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
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.ifscCode && (
        <Text
          style={{
            color: theme.colors.error,
            marginBottom: 16,
            fontSize: 12,
          }}
        >
          {errors.ifscCode.message}
        </Text>
      )}

      {/* ---------------- BANK NAME ---------------- */}
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
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.bankName && (
        <Text
          style={{
            color: theme.colors.error,
            marginBottom: 30,
            fontSize: 12,
          }}
        >
          {errors.bankName.message}
        </Text>
      )}

      <View style={{ height: 50 }} />
    </KeyboardAwareScrollView>
  );
}
