import { Controller, useFormContext } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
import FileUploadField from "./FileUploadField";

export default function KYCTab() {
  const theme = useTheme();

  const {
    control,
    watch,
    formState: { errors },
    setValue,
  } = useFormContext();

  const documents = watch("documents");

  const setDoc = (key: string, file: any) => {
    const updated = {
      ...documents,
      [key]: file ? file : null,
    };

    setValue("documents", updated, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    return (
      d.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }) +
      " " +
      d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  };

  const rawStatus = watch("kycStatus");

  const STATUS_COLORS: Record<string, string> = {
    PENDING: "#FFA726",
    UNDER_REVIEW: "#42A5F5",
    APPROVED: "#4CAF50",
    REJECTED: "#E53935",
  };

  const kycStatusLabel =
    {
      PENDING: "PENDING",
      UNDER_REVIEW: "UNDER REVIEW",
      APPROVED: "APPROVED",
      REJECTED: "REJECTED",
    }[rawStatus] || "PENDING";

  const statusColor = STATUS_COLORS[rawStatus] || "#FFA726";

  return (
    <ScrollView>
      <View>
        {/* ---------------- KYC STATUS BOX ---------------- */}
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

          {/* ⭐ STATUS CAPSULE (replaces input field) */}
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

          {/* -------- REJECTED -------- */}
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

          {/* -------- APPROVED -------- */}
          {rawStatus === "APPROVED" && (
            <>
              <Text style={{ marginBottom: 8 }}>Approved At</Text>
              <TextInput
                mode="outlined"
                editable={false}
                value={formatDateForInput(watch("kycApprovedAt"))}
              />

              <Text style={{ marginTop: 16, marginBottom: 8 }}>
                Approved By
              </Text>
              <TextInput
                mode="outlined"
                editable={false}
                value={watch("kycApprovedBy")}
              />
            </>
          )}
        </View>

        {/* ---------------- AADHAAR DETAILS ---------------- */}
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
                label="Aadhaar Number"
                mode="outlined"
                maxLength={12}
                keyboardType="number-pad"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                style={{ marginBottom: 4 }}
              />
            )}
          />
          {errors.aadhaarNumber && (
            <Text style={{ color: theme.colors.error, marginBottom: 20 }}>
              {errors.aadhaarNumber.message}
            </Text>
          )}

          <FileUploadField
            label="Aadhaar Front"
            file={documents?.aadhaarFront}
            onPick={(f) => setDoc("aadhaarFront", f)}
            onRemove={() => setDoc("aadhaarFront", null)}
            error={errors.documents?.aadhaarFront?.uri?.message}
          />

          <View style={{ height: 16 }} />

          <FileUploadField
            label="Aadhaar Back"
            file={documents?.aadhaarBack}
            onPick={(f) => setDoc("aadhaarBack", f)}
            onRemove={() => setDoc("aadhaarBack", null)}
            error={errors.documents?.aadhaarBack?.uri?.message}
          />
        </View>

        {/* ---------------- PAN DETAILS ---------------- */}
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
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                style={{ marginBottom: 4 }}
              />
            )}
          />
          {errors.panNumber && (
            <Text style={{ color: theme.colors.error, marginBottom: 20 }}>
              {errors.panNumber.message}
            </Text>
          )}

          <FileUploadField
            label="PAN Card"
            file={documents?.panCard}
            onPick={(f) => setDoc("panCard", f)}
            onRemove={() => setDoc("panCard", null)}
            error={errors.documents?.panCard?.uri?.message}
          />
        </View>

        {/* ---------------- ADDITIONAL DOCS ---------------- */}
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
            "authorizedSignatory",
          ].map((key) => (
            <View key={key} style={{ marginBottom: 16 }}>
              <FileUploadField
                label={key.replace(/([A-Z])/g, " $1")}
                file={documents?.[key]}
                onPick={(f) => setDoc(key, f)}
                onRemove={() => setDoc(key, null)}
                error={errors.documents?.[key]?.uri?.message}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
