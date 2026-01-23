import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

import { useState } from "react";
import type { Step0Values } from "./Step_0_LoanDetails";
import type { Step1Values } from "./Step_1_BasicDetails";
import type { PickedFile } from "./Step_2_Statement";
import type { Step3Values } from "./Step_3_IdProof";
import type { Step4Values } from "./Step_4_AdditionalDetails";

type Props = {
  step0: Step0Values;
  step1: Step1Values;
  step2Files: PickedFile[];
  step3: Step3Values;
  step4: Step4Values;
};

export default function Step5Review({
  step0,
  step1,
  step2Files,
  step3,
  step4,
}: Props) {
  const theme = useTheme();
  const [showReviewInfo, setShowReviewInfo] = useState(true);

  const row = (label: string, value?: string) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant,
      }}
    >
      <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
        {label}
      </Text>
      <Text
        style={{
          color: theme.colors.onSurface,
          fontWeight: "800",
          fontSize: 12,
          maxWidth: 200,
          textAlign: "right",
        }}
        numberOfLines={2}
      >
        {value || "NA"}
      </Text>
    </View>
  );

  const countText = (n: number) => `${n} file${n === 1 ? "" : "s"}`;

  return (
    <View>
      {/* Header */}
      {showReviewInfo && (
        <View
          style={{
            backgroundColor: theme.colors.primaryContainer,
            padding: 14,
            borderRadius: 16,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          {/* icon */}
          <Feather
            name="check-circle"
            size={18}
            color={theme.colors.onPrimaryContainer}
            style={{ marginTop: 2 }}
          />

          {/* text */}
          <Text
            style={{
              flex: 1,
              color: theme.colors.onPrimaryContainer,
              fontSize: 13,
              lineHeight: 20,
            }}
          >
            Final review. Please verify everything before submitting.
          </Text>

          {/* close */}
          <TouchableOpacity
            onPress={() => setShowReviewInfo(false)}
            activeOpacity={0.7}
            style={{
              padding: 4,
              borderRadius: 999,
              marginTop: -2,
            }}
          >
            <Feather
              name="x"
              size={18}
              color={theme.colors.onPrimaryContainer}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Summary */}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
        }}
      >
        <Text
          style={{
            color: theme.colors.onSurface,
            fontWeight: "900",
            marginBottom: 10,
          }}
        >
          Application Summary
        </Text>

        {row("Loan Amount", step0.loanAmount ? `₹${step0.loanAmount}` : "")}
        {row("Loan Type", step0.loanType)}
        {row("Tenure", step0.tenure)}
        {row("Providers", (step0.selectedProviders || []).join(", "))}

        <View style={{ height: 10 }} />

        {row("Full Name", step1.customerName)}
        {row("Email", step1.customerEmail)}
        {row("Phone", step1.customerPhone)}

        <View style={{ height: 10 }} />

        {row("Statements", countText(step2Files.length))}
        {row("Aadhaar Front", step3.aadharFront ? "Uploaded" : "Missing")}
        {row("Aadhaar Back", step3.aadharBack ? "Uploaded" : "Not uploaded")}
        {row("PAN", step3.pancard ? "Uploaded" : "Not uploaded")}
        {row("Photo", step3.passportPhoto ? "Uploaded" : "Not uploaded")}

        <View style={{ height: 10 }} />

        {row("Salary/Turnover", step4.salary ? `₹${step4.salary}` : "")}
        {row(
          "Existing EMI",
          step4.existingEmi ? `₹${step4.existingEmi}` : "NA",
        )}
        {row(
          "Credit Liability",
          step4.existingLiability ? `₹${step4.existingLiability}` : "NA",
        )}
        {row("Certificates", countText(step4.certificates.length))}
      </View>
    </View>
  );
}
