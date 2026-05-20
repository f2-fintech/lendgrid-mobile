import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useMemo, useState } from "react";
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

export type PickedFile = {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
  fieldKey?: string;
  docType?: string;
  uploaded?: boolean;
};

export type PersonDetail = {
  aadhaar: string;
  pan: string;
  mobile: string;
};

export type Step2Value = {
  files: PickedFile[];
  bankingPassword: string;
  personDetails: PersonDetail[];
};

type Props = {
  value: Step2Value;
  onChange: (value: Step2Value) => void;
  onValidityChange?: (valid: boolean) => void;
  maxFiles?: number;
  customerId?: string | null;
  loanType: string;
  businessEntityType?: string;
};

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const personalLoanFields = ["form16", "itr", "salarySlip", "banking"];
const soleProprietorshipFields = [
  "computationOfIncome",
  "financials",
  "udhyamCertificate",
  "gst",
  "itr",
  "banking",
];
const privateLimitedFields = [
  "banking",
  "form26as",
  "itr",
  "financials",
  "gst",
  "listOfDirectors",
  "listOfShareholders",
  "aoa",
  "moa",
  "udhyam",
  "companyPan",
  "directorsKyc",
];
const partnershipFields = [
  "partnershipDeed",
  "banking",
  "udhyam",
  "gst",
  "financials",
  "computationOfIncome",
];
const professionalLoanFields = [
  "ugCertificate",
  "pgCertificate",
  "registration",
  "banking",
  "itr",
  "computationOfIncome",
];

const fieldLabels: Record<string, string> = {
  form16: "Form 16",
  itr: "ITR",
  salarySlip: "3 Months Salary Slip",
  banking: "Banking",
  computationOfIncome: "2 Year Computation of Income",
  financials: "2 Financials (P/L, B/S)",
  udhyamCertificate: "Udhyam Certificate",
  udhyam: "Udhyam",
  gst: "GST",
  form26as: "Form 26 AS",
  listOfDirectors: "List of Directors",
  listOfShareholders: "List of Shareholders",
  aoa: "Article of Association (AOA)",
  moa: "Memorandum of Association (MOA)",
  companyPan: "Company PAN ID",
  directorsKyc: "Directors KYC",
  partnershipDeed: "Partnership Deed",
  ugCertificate: "UG Certificate (MBBS, BDS, BAMS, BHMS)",
  pgCertificate: "PG Certificate (MD, MS, MCH)",
  registration: "Registration",
};

const docTypeMap: Record<string, string> = {
  form16: "form 16",
  itr: "itr",
  salarySlip: "salary slip",
  banking: "bank statement",
  computationOfIncome: "computation of income",
  financials: "financials",
  udhyamCertificate: "udhyam certificate",
  udhyam: "udhyam certificate",
  gst: "gst",
  form26as: "form 26 as",
  listOfDirectors: "list of directors",
  listOfShareholders: "list of shareholders",
  aoa: "aoa",
  moa: "moa",
  companyPan: "company pan",
  directorsKyc: "directors kyc",
  partnershipDeed: "partnership deed",
  ugCertificate: "ug certificate",
  pgCertificate: "pg certificate",
  registration: "registration",
  bankStatement: "bank statement",
};

const emptyStep2Value: Step2Value = {
  files: [],
  bankingPassword: "",
  personDetails: [],
};

const formatMB = (bytes?: number) => {
  if (!bytes && bytes !== 0) return "NA";
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const getFieldKeys = (loanType: string, entityType?: string) => {
  if (loanType === "personal loan") return personalLoanFields;
  if (loanType === "business loan") {
    if (entityType === "sole_proprietorship") return soleProprietorshipFields;
    if (entityType === "private_limited") return privateLimitedFields;
    if (entityType === "partnership") return partnershipFields;
    return [];
  }
  if (loanType === "professional loan") return professionalLoanFields;
  return ["bankStatement"];
};

const titleFor = (loanType: string) => {
  if (loanType === "personal loan") return "Personal Loan Documents";
  if (loanType === "business loan") return "Business Loan Documents";
  if (loanType === "professional loan") return "Professional Loan Documents";
  return "Statement Upload";
};

export default function Step2Statement({
  value,
  onChange,
  onValidityChange,
  maxFiles = 10,
  loanType,
  businessEntityType,
}: Props) {
  const theme = useTheme();
  const safeValue = value || emptyStep2Value;
  const fieldKeys = useMemo(
    () => getFieldKeys(loanType, businessEntityType),
    [loanType, businessEntityType],
  );
  const [fileError, setFileError] = useState("");
  const [personCountOpen, setPersonCountOpen] = useState(false);
  const [bankingPasswordDraft, setBankingPasswordDraft] = useState(
    safeValue.bankingPassword || "",
  );

  const isValid = safeValue.files.length > 0;

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  useEffect(() => {
    setBankingPasswordDraft(safeValue.bankingPassword || "");
  }, [safeValue.bankingPassword]);

  const update = (patch: Partial<Step2Value>) => {
    onChange({
      files: safeValue.files || [],
      bankingPassword: safeValue.bankingPassword || "",
      personDetails: safeValue.personDetails || [],
      ...patch,
    });
  };

  const pickDoc = async (fieldKey: string, label?: string) => {
    setFileError("");
    if (safeValue.files.length >= maxFiles) return;

    const res = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true,
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/*",
        "text/plain",
      ],
    });

    if (res.canceled) return;

    const asset = res.assets?.[0];
    if (!asset) return;

    if (typeof asset.size === "number" && asset.size > MAX_BYTES) {
      setFileError(
        `File too large: ${asset.name || "file"} (${formatMB(asset.size)}). Max ${MAX_MB}MB allowed.`,
      );
      return;
    }

    let docType = docTypeMap[fieldKey] || fieldKey;
    if (fieldKey.includes("_aadhaar_back")) docType = "aadhaar back";
    else if (fieldKey.includes("_aadhaar")) docType = "aadhaar front";
    if (fieldKey.includes("_pan")) docType = "pancard";

    const nextFile: PickedFile = {
      uri: asset.uri,
      name: asset.name || label || "file",
      size: asset.size,
      mimeType: asset.mimeType,
      fieldKey,
      docType,
    };

    const nextFiles = [
      ...safeValue.files.filter((file) => file.fieldKey !== fieldKey),
      nextFile,
    ];
    update({ files: nextFiles });
  };

  const removeFile = (fieldKey: string) => {
    update({ files: safeValue.files.filter((file) => file.fieldKey !== fieldKey) });
  };

  const selectedFor = (fieldKey: string) =>
    safeValue.files.find((file) => file.fieldKey === fieldKey);

  const setPersonCount = (count: number) => {
    const current = safeValue.personDetails || [];
    const personDetails = Array.from(
      { length: count },
      (_, index) => current[index] || { aadhaar: "", pan: "", mobile: "" },
    );
    update({ personDetails });
    setPersonCountOpen(false);
  };

  const updatePerson = (index: number, key: keyof PersonDetail, text: string) => {
    const personDetails = safeValue.personDetails.map((person, idx) =>
      idx === index
        ? { ...person, [key]: key === "pan" ? text.toUpperCase() : text }
        : person,
    );
    update({ personDetails });
  };

  const renderFileBox = (fieldKey: string, label: string) => {
    const file = selectedFor(fieldKey);
    const isImg = (file?.mimeType || "").startsWith("image/");
    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          borderRadius: 14,
          padding: 12,
          backgroundColor: theme.colors.surface,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: theme.colors.onSurface, fontWeight: "800", marginBottom: 8 }}>
          {label}
        </Text>
        {file ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: theme.colors.surfaceVariant,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isImg ? (
                <Image source={{ uri: file.uri }} style={{ width: 44, height: 44 }} resizeMode="cover" />
              ) : (
                <Feather name="file-text" size={18} color={theme.colors.onSurfaceVariant} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: theme.colors.onSurface, fontWeight: "700" }}>
                {file.name}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                {formatMB(file.size)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => removeFile(fieldKey)}
              style={{ padding: 8, borderRadius: 10, backgroundColor: theme.colors.errorContainer }}
            >
              <Feather name="x" size={18} color={theme.colors.onErrorContainer} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => pickDoc(fieldKey, label)}
            activeOpacity={0.85}
            style={{
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: theme.colors.outline,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
              backgroundColor: theme.colors.surfaceVariant,
            }}
          >
            <Feather name="upload-cloud" size={22} color={theme.colors.onSurfaceVariant} />
            <Text style={{ color: theme.colors.onSurface, fontWeight: "800", marginTop: 6 }}>
              Upload
            </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 11, marginTop: 2 }}>
              PDF / DOC / Images, max {MAX_MB}MB
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPersonRows = (label: "Director" | "Partner") => (
    <View style={{ marginTop: 8 }}>
      <Text style={{ color: theme.colors.primary, fontWeight: "900", marginBottom: 8 }}>
        {label} Details
      </Text>
      <TouchableOpacity
        onPress={() => setPersonCountOpen(true)}
        style={{
          padding: 14,
          borderWidth: 1.5,
          borderColor: theme.colors.outline,
          borderRadius: 12,
          backgroundColor: theme.colors.surface,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.colors.onSurface, flex: 1 }}>
          {safeValue.personDetails.length
            ? `${safeValue.personDetails.length} ${label}${safeValue.personDetails.length > 1 ? "s" : ""}`
            : `Select number of ${label.toLowerCase()}s`}
        </Text>
        <Feather name="chevron-down" size={18} color={theme.colors.onSurfaceVariant} />
      </TouchableOpacity>

      {safeValue.personDetails.map((person, index) => (
        <View
          key={`${label}-${index}`}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.primary,
            borderRadius: 14,
            padding: 12,
            marginBottom: 12,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Text style={{ color: theme.colors.primary, fontWeight: "900", marginBottom: 10 }}>
            {label} #{index + 1}
          </Text>
          {(["aadhaar", "pan", "mobile"] as const).map((key) => (
            <TextInput
              key={key}
              value={person[key]}
              onChangeText={(text) => updatePerson(index, key, text)}
              placeholder={
                key === "aadhaar"
                  ? "Aadhaar Number"
                  : key === "pan"
                    ? "PAN Number"
                    : "Mobile Number"
              }
              placeholderTextColor={theme.colors.onSurfaceVariant}
              keyboardType={key === "pan" ? "default" : "numeric"}
              maxLength={key === "aadhaar" ? 12 : key === "pan" ? 10 : 10}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.outline,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: theme.colors.onSurface,
                marginBottom: 10,
              }}
            />
          ))}
          {renderFileBox(`person_${index}_aadhaar`, "Aadhaar Front Document")}
          {renderFileBox(
            `person_${index}_aadhaar_back`,
            "Aadhaar Back Document",
          )}
          {renderFileBox(`person_${index}_pan`, "PAN Document")}
        </View>
      ))}
    </View>
  );

  return (
    <View>
      <View
        style={{
          backgroundColor: theme.colors.tertiaryContainer,
          padding: 14,
          borderRadius: 16,
          marginBottom: 16,
          flexDirection: "row",
          gap: 10,
        }}
      >
        <Feather name="file-text" size={18} color={theme.colors.onTertiaryContainer} />
        <Text style={{ flex: 1, color: theme.colors.onTertiaryContainer, lineHeight: 20 }}>
          {titleFor(loanType)}
          {loanType === "business loan" && businessEntityType
            ? ` for ${businessEntityType.replace(/_/g, " ")}`
            : ""}
        </Text>
      </View>

      {!!fileError && (
        <View style={{ backgroundColor: theme.colors.errorContainer, borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: theme.colors.onErrorContainer, fontWeight: "800" }}>{fileError}</Text>
        </View>
      )}

      {loanType === "business loan" && businessEntityType === "private_limited" && (
        renderPersonRows("Director")
      )}

      {loanType === "business loan" && businessEntityType === "partnership" && (
        renderPersonRows("Partner")
      )}

      {fieldKeys.map((fieldKey) => (
        <View key={fieldKey}>
          {renderFileBox(fieldKey, fieldLabels[fieldKey] || "Bank Statement")}
        </View>
      ))}

      {(fieldKeys.includes("banking") || fieldKeys.includes("bankStatement")) && (
        <View style={{ marginTop: 4, marginBottom: 12 }}>
          <Text style={{ color: theme.colors.onSurface, fontWeight: "800", marginBottom: 8 }}>
            Bank Statement Password
          </Text>
          <TextInput
            value={bankingPasswordDraft}
            onChangeText={setBankingPasswordDraft}
            onEndEditing={() =>
              update({ bankingPassword: bankingPasswordDraft })
            }
            placeholder="Enter PDF password if protected"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={{
              borderWidth: 1.5,
              borderColor: theme.colors.outline,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              color: theme.colors.onSurface,
              backgroundColor: theme.colors.surface,
            }}
          />
        </View>
      )}

      <Text style={{ marginTop: 4, fontSize: 12, color: theme.colors.onSurfaceVariant }}>
        Tip: You can skip this step if documents are not available.
      </Text>

      <Modal visible={personCountOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: "55%" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: theme.colors.onSurface, fontWeight: "900", fontSize: 16 }}>
                Select Number
              </Text>
              <TouchableOpacity onPress={() => setPersonCountOpen(false)} style={{ padding: 6 }}>
                <Feather name="x" size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
                <TouchableOpacity
                  key={count}
                  onPress={() => setPersonCount(count)}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outlineVariant,
                  }}
                >
                  <Text style={{ color: theme.colors.onSurface }}>{count}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
