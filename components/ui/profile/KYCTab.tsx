import { useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
import FileUploadField from "./FileUploadField";

const DOCUMENT_LABELS: Record<string, string> = {
  gstCertificate: "Gst Certificate",
  incorporationCertificate: "Incorporation Certificate",
  bankStatement: "Bank Statement",
  cancelledCheque: "Cancelled Cheque",
  addressProof: "Address Proof",
  // authorizedSignatory: "Authorized Signatory",
};

type Props = {
  uiState?: { isEditMode: boolean; activeTab: string };
};

const toFileObj = (v: any) => {
  if (!v) return null;
  if (typeof v === "string") return { uri: v };
  if (typeof v?.uri === "string") return v;
  return null;
};

export default function KYCTab({ uiState }: Props) {
  const theme = useTheme();
  const isEditMode = !!uiState?.isEditMode;
  const isActive = uiState?.activeTab === "kyc";

  const firstRef = useRef<any>(null);

  const {
    control,
    watch,
    formState: { errors },
    setValue,
  } = useFormContext();

  const documents = watch("documents");

  useEffect(() => {
    if (isEditMode && isActive) {
      setTimeout(() => firstRef.current?.focus?.(), 250);
    }
  }, [isEditMode, isActive]);

  const setDoc = (key: string, file: any) => {
    const updated = {
      ...(documents || {}),
      [key]: toFileObj(file),
    };

    setValue("documents", updated, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const rawStatus = watch("kycStatus");

  const STATUS_COLORS: Record<string, string> = {
    PENDING: "#FFA726",
    UNDER_REVIEW: "#42A5F5",
    APPROVED: "#4CAF50",
    REJECTED: "#E53935",
    RESUBMIT: "#AB47BC",
  };

  const kycStatusLabel =
    {
      PENDING: "PENDING",
      UNDER_REVIEW: "UNDER REVIEW",
      APPROVED: "APPROVED",
      REJECTED: "REJECTED",
      RESUBMIT: "RESUBMIT",
    }[rawStatus] || "PENDING";

  // See all the kycStatus labels and update it

  const statusColor = STATUS_COLORS[rawStatus] || "#FFA726";

  return (
    <ScrollView>
      <View>
        {/* KYC STATUS BOX */}
        <View
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            padding: 16,
            borderRadius: 12,
            marginBottom: 26,
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 18, marginBottom: 4 }}>
            KYC Status
          </Text>

          <Text
            style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}
          >
            Review the KYC verification status.
          </Text>

          <Text style={{ marginBottom: 8 }}>Status</Text>

          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: statusColor,
              paddingVertical: 6,
              paddingHorizontal: 16,
              borderRadius: 20,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>
              {kycStatusLabel}
            </Text>
          </View>

          {rawStatus === "REJECTED" && (
            <>
              <Text style={{ marginBottom: 8 }}>Rejection Reason</Text>
              <TextInput
                mode="outlined"
                editable={false}
                multiline
                value={watch("kycRejectionReason")}
                style={{ marginBottom: 20 }}
              />
            </>
          )}
        </View>

        {/* AADHAAR DETAILS */}
        <View
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            padding: 16,
            borderRadius: 12,
            marginBottom: 26,
          }}
        >
          <Text style={{ fontWeight: "700", marginBottom: 12 }}>
            Aadhaar Details
          </Text>

          <Controller
            control={control}
            name="aadhaarNumber"
            render={({ field }) => (
              <TextInput
                ref={firstRef}
                label="Aadhaar Number"
                mode="outlined"
                maxLength={12}
                keyboardType="number-pad"
                value={field.value || ""}
                onChangeText={(t) => field.onChange(t.replace(/[^0-9]/g, ""))}
                onBlur={field.onBlur}
                editable={isEditMode}
                style={{ marginBottom: 4 }}
              />
            )}
          />

          {!!errors.aadhaarNumber && (
            <Text style={{ color: theme.colors.error, marginBottom: 20 }}>
              {errors.aadhaarNumber.message as any}
            </Text>
          )}

          <FileUploadField
            label="Aadhaar Front"
            file={documents?.aadhaarFront}
            onPick={(f) => isEditMode && setDoc("aadhaarFront", f)}
            onRemove={() => isEditMode && setDoc("aadhaarFront", null)}
            error={errors.documents?.aadhaarFront?.uri?.message as any}
            disabled={!isEditMode}
          />

          <View style={{ height: 16 }} />

          <FileUploadField
            label="Aadhaar Back"
            file={documents?.aadhaarBack}
            onPick={(f) => isEditMode && setDoc("aadhaarBack", f)}
            onRemove={() => isEditMode && setDoc("aadhaarBack", null)}
            error={errors.documents?.aadhaarBack?.uri?.message as any}
            disabled={!isEditMode}
          />
        </View>

        {/* PAN DETAILS */}
        <View
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            padding: 16,
            borderRadius: 12,
            marginBottom: 26,
          }}
        >
          <Text style={{ fontWeight: "700", marginBottom: 12 }}>
            PAN Details
          </Text>

          <Controller
            control={control}
            name="panNumber"
            render={({ field }) => (
              <TextInput
                label="PAN Number"
                mode="outlined"
                autoCapitalize="characters"
                maxLength={10}
                value={field.value || ""}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                editable={isEditMode}
                style={{ marginBottom: 4 }}
              />
            )}
          />

          {!!errors.panNumber && (
            <Text style={{ color: theme.colors.error, marginBottom: 20 }}>
              {errors.panNumber.message as any}
            </Text>
          )}

          <FileUploadField
            label="PAN Card"
            file={documents?.panCard}
            onPick={(f) => isEditMode && setDoc("panCard", f)}
            onRemove={() => isEditMode && setDoc("panCard", null)}
            error={errors.documents?.panCard?.uri?.message as any}
            disabled={!isEditMode}
          />
        </View>

        {/* ADDITIONAL DOCS */}
        <View
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            padding: 16,
            borderRadius: 12,
            marginBottom: 60,
          }}
        >
          <Text style={{ fontWeight: "700", marginBottom: 12 }}>
            Additional Documents
          </Text>

          {[
            "gstCertificate",
            "incorporationCertificate",
            "bankStatement",
            "cancelledCheque",
            "addressProof",
            // "authorizedSignatory",
          ].map((key) => (
            <View key={key} style={{ marginBottom: 16 }}>
              <FileUploadField
                label={DOCUMENT_LABELS[key] || key}
                file={documents?.[key]}
                onPick={(f) => isEditMode && setDoc(key, f)}
                onRemove={() => isEditMode && setDoc(key, null)}
                error={errors.documents?.[key]?.uri?.message as any}
                disabled={!isEditMode}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
