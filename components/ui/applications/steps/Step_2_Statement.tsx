import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useMemo, useState } from "react";
import { useAppConfig } from "@/contexts/ConfigContext";
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
  onUploadFile?: (file: PickedFile) => void;
  uploadingFileKey?: string | null;
  maxFiles?: number;
  customerId?: string | null;
  loanType: string;
  businessEntityType?: string;
  employmentType?: string;
  propertyPurchaseType?: string;
  professionalType?: string;
  disabled?: boolean;
};

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const personalLoanFields = ["form16", "itr", "salarySlip", "banking", "companyIdCard", "ownershipProof", "utilityBill"];
const soleProprietorshipFields = [
  "banking",
  "gst",
  "itr",
  "financials",
  "form26as",
];
const privateLimitedFields = [
  "companyPan",
  "directorsKyc",
  "companyAddressProof",
  "gst",
  "itr",
  "financials",
  "aoa",
  "moa",
  "coi",
  "boardResolution",
  "mcaReport",
  "form26as",
  "banking",
];
const partnershipFields = [
  "companyPan",
  "partnersKyc",
  "companyAddressProof",
  "partnershipDeed",
  "salarySlip",
  "form26as",
  "itr",
  "financials",
  "gst",
  "banking",
];

const homeLoanCommonSalaried = ["form16", "salarySlip", "banking"];
const homeLoanCommonSE = ["gst", "udhyamCertificate", "itr", "financials", "form26as", "banking", "electricityBill"];

const educationLoanStudentFields = [
  "coApplicantAadhaarFront",
  "coApplicantAadhaarBack",
  "coApplicantPan",
  "marksheet10",
  "marksheet12",
  "marksheetGrad",
  "offerLetter",
  "feeStructure",
  "entranceExamResult"
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
  directorsKyc: "Directors KYC (PAN & Aadhar)",
  partnersKyc: "Partners KYC (PAN & Aadhar)",
  partnershipDeed: "Partnership Deed",
  boardResolution: "Board Resolution",
  mcaReport: "Latest MCA Report",
  coi: "Certificate of Incorporation (COI)",
  ugCertificate: "UG Certificate (MBBS, BDS, BAMS, BHMS)",
  pgCertificate: "PG Certificate (MD, MS, MCH)",
  registration: "Registration",
  currentAddressProof: "Current Address Proof",
  companyIdCard: "Company / Office ID Card",
  ownershipProof: "Ownership Proof or Rent Agreement",
  utilityBill: "Latest Utility Bill",
  companyAddressProof: "Company / Firm Address Proof",
  shareHoldingPattern: "Share Holding Pattern",
  cop: "Certificate of Practice (COP)",
  com: "Certificate of Membership (COM)",
  firmCard: "Firm Card / Letterhead",
  propertyPapers: "Property Papers / Sale Deed",
  ats: "Agreement to Sell (ATS)",
  sellerKyc: "Seller KYC",
  sellerCancelledCheque: "Seller Cancelled Cheque",
  ptm: "Permission to Mortgage (PTM)",
  allotmentLetter: "Allotment Letter",
  customerLedger: "Customer Ledger",
  paymentReceipts: "Payment Receipts",
  tpa: "Triparty Agreement (TPA)",
  projectNoc: "Project NOC",
  existingSanctionLetter: "Existing Sanction Letter",
  lod: "List of Documents (LOD)",
  titleDeed: "Title Deed / Ownership Papers",
  electricityBill: "Electricity Bill",
  marksheet10: "Class X Marksheet",
  marksheet12: "Class XII Marksheet",
  marksheetGrad: "Graduation Marksheet",
  offerLetter: "College/University Offer Letter",
  feeStructure: "Fee Structure / Fee Schedule",
  entranceExamResult: "Entrance Exam Result",
  coApplicantAadhaarFront: "Student Aadhaar Front",
  coApplicantAadhaarBack: "Student Aadhaar Back",
  coApplicantPan: "Student PAN Card",
  coApplicantBank: "Co-Applicant 6 Months Bank Statement",
  coApplicantCheque: "Co-Applicant Cancelled Cheque",
  coApplicantIncomeDocs: "Co-Applicant Income Documents",
  cancelCheque: "Cancelled Cheque",
};

const singleUploadFields = [
  "marksheet10",
  "marksheet12",
  "marksheetGrad",
  "offerLetter",
  "feeStructure",
  "entranceExamResult",
  "coApplicantAadhaarFront",
  "coApplicantAadhaarBack",
  "coApplicantPan",
  "cancelCheque",
  "companyPan",
  "coi",
  "electricityBill",
  "companyIdCard",
  "passportPhoto",
  "ugCertificate",
  "pgCertificate",
  "allotmentLetter",
  "projectNoc",
];

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
  partnersKyc: "partners kyc",
  partnershipDeed: "partnership deed",
  boardResolution: "board resolution",
  mcaReport: "mca report",
  coi: "coi",
  ugCertificate: "ug certificate",
  pgCertificate: "pg certificate",
  registration: "registration",
  currentAddressProof: "address proof",
  bankStatement: "bank statement",
  companyIdCard: "company id card",
  ownershipProof: "ownership proof",
  utilityBill: "utility bill",
  companyAddressProof: "company address proof",
  shareHoldingPattern: "share holding pattern",
  cop: "cop",
  com: "com",
  firmCard: "firm card",
  propertyPapers: "property papers",
  ats: "ats",
  sellerKyc: "seller kyc",
  sellerCancelledCheque: "seller cancelled cheque",
  ptm: "ptm",
  allotmentLetter: "allotment letter",
  customerLedger: "customer ledger",
  paymentReceipts: "payment receipts",
  tpa: "tpa",
  projectNoc: "project noc",
  existingSanctionLetter: "existing sanction letter",
  lod: "lod",
  titleDeed: "title deed",
  electricityBill: "electricity bill",
  marksheet10: "marksheet 10",
  marksheet12: "marksheet 12",
  marksheetGrad: "graduation marksheet",
  offerLetter: "offer letter",
  feeStructure: "fee structure",
  entranceExamResult: "entrance exam result",
  coApplicantAadhaarFront: "co-applicant aadhaar front",
  coApplicantAadhaarBack: "co-applicant aadhaar back",
  coApplicantPan: "co-applicant pan",
  coApplicantBank: "co-applicant bank",
  coApplicantCheque: "co-applicant cheque",
  coApplicantIncomeDocs: "co-applicant income docs",
  cancelCheque: "cancel cheque",
};

const emptyStep2Value: Step2Value = {
  files: [],
  bankingPassword: "",
  personDetails: [],
};

const getDocLabel = (fieldKey: string, professionalType?: string) => {
  if (fieldKey === "ugCertificate") {
    return professionalType === "Dr"
      ? "UG Certificate (MBBS, BDS, BAMS, BHMS)"
      : "UG Certificate";
  }
  if (fieldKey === "pgCertificate") {
    return professionalType === "Dr"
      ? "PG Certificate (MD, MS, MCH)"
      : "PG Certificate";
  }
  return fieldLabels[fieldKey];
};

const formatMB = (bytes?: number) => {
  if (!bytes && bytes !== 0) return "NA";
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const getFieldKeys = (loanType: string, entityType?: string, employmentType?: string, propertyPurchaseType?: string, professionalType?: string) => {
  if (loanType === "personal loan") return personalLoanFields;
  if (loanType === "business loan") {
    if (entityType === "sole_proprietorship") return soleProprietorshipFields;
    if (entityType === "private_limited") return privateLimitedFields;
    if (entityType === "partnership") return partnershipFields;
    return [];
  }
  if (loanType === "professional loan") {
    let fields = [
      "ugCertificate",
      "pgCertificate",
      "registration",
      "currentAddressProof",
      "banking",
    ];

    if (employmentType === "salaried") {
      fields.push("companyIdCard", "salarySlip", "form16");
    } else {
      fields.push("udhyamCertificate", "itr", "computationOfIncome", "form26as");
    }

    if (professionalType !== "Dr" && employmentType !== "salaried") {
      fields.push("cop", "com", "firmCard");
    }
    return fields;
  }
  
  if (loanType === "home loan") {
    if (employmentType === "salaried") {
      switch (propertyPurchaseType) {
        case "fresh_purchase": return [...homeLoanCommonSalaried, "propertyPapers"];
        case "resale_purchase": return [...homeLoanCommonSalaried, "propertyPapers", "ats", "sellerKyc", "sellerCancelledCheque", "electricityBill"];
        case "builder_purchase": return [...homeLoanCommonSalaried, "ptm", "propertyPapers", "allotmentLetter", "customerLedger", "paymentReceipts", "tpa", "projectNoc"];
        case "balance_transfer": return [...homeLoanCommonSalaried, "propertyPapers", "existingSanctionLetter", "electricityBill", "lod"];
        default: return homeLoanCommonSalaried;
      }
    } else {
      switch (propertyPurchaseType) {
        case "fresh_purchase": return [...homeLoanCommonSE, "propertyPapers"];
        case "resale_purchase": return [...homeLoanCommonSE, "propertyPapers", "ats", "sellerKyc", "sellerCancelledCheque"];
        case "builder_purchase": return [...homeLoanCommonSE, "propertyPapers", "allotmentLetter", "ptm", "tpa", "projectNoc", "customerLedger"];
        default: return homeLoanCommonSE;
      }
    }
  }

  if (loanType === "lap") {
    if (employmentType === "salaried") {
      return ["form16", "salarySlip", "banking", "titleDeed"];
    } else {
      return ["gst", "udhyamCertificate", "itr", "financials", "form26as", "banking", "propertyPapers", "electricityBill"];
    }
  }

  if (loanType === "education loan") {
    const fields = [...educationLoanStudentFields, "banking", "cancelCheque"];
    
    if (employmentType === "salaried") {
      fields.push("form16", "salarySlip", "companyIdCard");
    } else {
      fields.push("itr", "computationOfIncome", "udhyamCertificate", "gst", "financials", "form26as");
    }
    
    return fields;
  }

  return ["bankStatement"];
};

const titleFor = (loanType: string, loanWord: string) => {
  if (loanType === "personal loan") return `Personal ${loanWord} Documents`;
  if (loanType === "business loan") return `Business ${loanWord} Documents`;
  if (loanType === "professional loan") return `Professional ${loanWord} Documents`;
  return "Statement Upload";
};

export default function Step2Statement({
  value,
  onChange,
  onValidityChange,
  onUploadFile,
  uploadingFileKey,
  maxFiles = 10,
  loanType,
  businessEntityType,
  employmentType,
  propertyPurchaseType,
  professionalType,
  disabled,
}: Props) {
  const theme = useTheme();
  const { config } = useAppConfig();
  const loanWord = config.isReviewMode ? config.terminology.loanWord : "Loan";
  const safeValue = value || emptyStep2Value;
  const fieldKeys = useMemo(
    () => getFieldKeys(loanType, businessEntityType, employmentType, propertyPurchaseType, professionalType),
    [loanType, businessEntityType, employmentType, propertyPurchaseType, professionalType]
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

    const isSingle = singleUploadFields.includes(fieldKey);

    const res = await DocumentPicker.getDocumentAsync({
      multiple: !isSingle,
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

    let docType = docTypeMap[fieldKey] || fieldKey;
    if (fieldKey.includes("_aadhaar_back")) docType = "aadhaar back";
    else if (fieldKey.includes("_aadhaar")) docType = "aadhaar front";
    if (fieldKey.includes("_pan")) docType = "pancard";

    const incoming: PickedFile[] = (res.assets || []).map(asset => ({
      uri: asset.uri,
      name: asset.name || label || "file",
      size: asset.size,
      mimeType: asset.mimeType,
      fieldKey,
      docType,
    }));

    let validIncoming = incoming.filter(asset => {
      if (typeof asset.size === "number" && asset.size > MAX_BYTES) {
        setFileError(
          `File too large: ${asset.name || "file"} (${formatMB(asset.size)}). Max ${MAX_MB}MB allowed.`,
        );
        return false;
      }
      return true;
    });

    if (isSingle && validIncoming.length > 1) {
      validIncoming = [validIncoming[0]];
    }

    const nextFiles = [...safeValue.files, ...validIncoming].slice(0, maxFiles);
    update({ files: nextFiles });
  };

  const removeFile = (fieldKey: string, uri: string) => {
    update({ files: safeValue.files.filter((file) => !(file.fieldKey === fieldKey && file.uri === uri)) });
  };

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
    const files = safeValue.files.filter((file) => file.fieldKey === fieldKey);

    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: theme.colors.onSurface, fontWeight: "800", marginBottom: 8 }}>
          {label}
        </Text>
        
        {files.map((file, idx) => {
          const isImg = (file.mimeType || "").startsWith("image/");
          const isPending = !!file.uri && !file.uri.startsWith("http") && !file.uploaded;
          const isUploadingThis = uploadingFileKey === fieldKey;

          return (
            <View key={file.uri + idx} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8, padding: 8, backgroundColor: theme.colors.surfaceVariant, borderRadius: 12 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  backgroundColor: theme.colors.surface,
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
                <Text numberOfLines={1} style={{ color: theme.colors.onSurface, fontWeight: "700", fontSize: 13 }}>
                  {file.name}
                </Text>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                  {formatMB(file.size)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removeFile(fieldKey, file.uri)}
                disabled={isUploadingThis}
                style={{ padding: 8, borderRadius: 10, backgroundColor: theme.colors.errorContainer }}
              >
                <Feather name="x" size={16} color={theme.colors.onErrorContainer} />
              </TouchableOpacity>
              {isPending && onUploadFile && (
                <TouchableOpacity
                  onPress={() => onUploadFile(file)}
                  disabled={isUploadingThis}
                  activeOpacity={0.85}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: isUploadingThis ? theme.colors.surfaceVariant : theme.colors.secondary,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Feather name="upload" size={14} color={isUploadingThis ? theme.colors.onSurfaceVariant : "#FFFFFF"} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {(!singleUploadFields.includes(fieldKey) || files.length === 0) && (
          <TouchableOpacity
            onPress={() => pickDoc(fieldKey, label)}
            activeOpacity={0.85}
            style={{
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: theme.colors.primary,
              borderRadius: 16,
              padding: 18,
              alignItems: "center",
              backgroundColor: `${theme.colors.primary}10`,
              marginTop: files.length ? 8 : 0,
            }}
          >
            <Feather name={files.length ? "plus" : "upload-cloud"} size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={{ color: theme.colors.onSurface, fontWeight: "800", marginTop: 4 }}>
              {files.length ? `Add Another ${label}` : "Upload"}
            </Text>
            {!files.length && (
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 11, marginTop: 2 }}>
                PDF / DOC / Images, max {MAX_MB}MB
              </Text>
            )}
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
        disabled={disabled}
        style={{
          padding: 14,
          borderRadius: 16, backgroundColor: theme.colors.surfaceVariant,
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
              editable={!disabled}
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
          {titleFor(loanType, loanWord)}
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

      {loanType === "education loan" ? (
        <>
          <View style={{ marginTop: 8, marginBottom: 16 }}>
            <Text style={{ color: theme.colors.primary, fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
              🎓 Student (Co-Applicant) Documents
            </Text>
            {fieldKeys.filter(k => educationLoanStudentFields.includes(k)).map((fieldKey) => (
              <View key={fieldKey}>
                {renderFileBox(fieldKey, getDocLabel(fieldKey, professionalType) || fieldKey)}
              </View>
            ))}
          </View>
          <View style={{ marginTop: 8, marginBottom: 16 }}>
            <Text style={{ color: theme.colors.primary, fontWeight: "900", fontSize: 16, marginBottom: 12 }}>
              💼 Applicant (Father/Mother) Documents
            </Text>
            {fieldKeys.filter(k => !educationLoanStudentFields.includes(k)).map((fieldKey) => (
              <View key={fieldKey}>
                {renderFileBox(fieldKey, getDocLabel(fieldKey, professionalType) || fieldKey)}
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          {fieldKeys.map((fieldKey) => (
            <View key={fieldKey}>
              {renderFileBox(fieldKey, getDocLabel(fieldKey, professionalType) || "Bank Statement")}
            </View>
          ))}
        </>
      )}

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
            editable={!disabled}
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
