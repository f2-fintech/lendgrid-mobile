import { coreApi, restApi } from "@/apis/config/axiosConfig";
import {
    generateApplicationNumber,
    getPrettyError,
    normalizeString,
    uploadToS3,
} from "@/lib/utils/utils";
import { fetchCustomerFullDetails } from "@/apis/modules/applications.api_rest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { Buffer } from "buffer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HorizontalStepper, { StepConfig } from "./Verticalstepper";
import { useAppConfig } from "@/contexts/ConfigContext";
import { Feather } from "@expo/vector-icons";
import Step0LoanDetails, { Step0Values } from "./steps/Step_0_LoanDetails";
import Step1BasicDetails, { Step1Values } from "./steps/Step_1_BasicDetails";
import Step2Statement, {
    PickedFile,
    Step2Value,
} from "./steps/Step_2_Statement";
import Step3IdProof, { Step3Values } from "./steps/Step_3_IdProof";
import Step4AdditionalDetails, {
    Step4Values,
} from "./steps/Step_4_AdditionalDetails";

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
  initialLoanType?: string | string[];
  initialLoanCategory?: "secured" | "unsecured" | string | string[];
  editMode?: boolean;
  initialCustomerId?: string | null;
  initialApplicationId?: string | number | null;
};

type CompanyOption = {
  id: number;
  companyId: string;
  name: string;
};

const STEPS: StepConfig[] = [
  {
    id: "loan-details",
    title: "Loan Details",
    iconLib: "fa5",
    icon: "rupee-sign",
  },
  { id: "basic-details", title: "Basic Info", icon: "user" },
  { id: "statement", title: "Statement", icon: "file-text" },
  { id: "proof", title: "ID Proof", icon: "credit-card" },
  { id: "additional", title: "Additional", icon: "edit-3" },
];

const decodeJwt = (token: string | null) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
  } catch {
    return null;
  }
};

const extractCompanyIdFromClaims = (claims: any) => {
  return (
    claims?.companyId ??
    claims?.company_id ??
    claims?.company?.id ??
    claims?.company?.companyId ??
    claims?.company?.company_id ??
    claims?.user?.companyId ??
    claims?.user?.company_id ??
    claims?.data?.companyId ??
    claims?.data?.company_id ??
    claims?.tenant?.companyId ??
    claims?.tenant?.company_id
  );
};

const extractUserIdFromClaims = (claims: any) => {
  return (
    claims?.id ??
    claims?.userId ??
    claims?.sub ??
    claims?.salesUserId ??
    claims?.user_id ??
    claims?.user?.id ??
    claims?.user?.userId ??
    claims?.data?.id ??
    claims?.data?.userId
  );
};

const getCompanyId = async () => {
  const storedCompanyId = await AsyncStorage.getItem("companyId");
  if (storedCompanyId) return storedCompanyId;

  const token = await AsyncStorage.getItem("token");
  const decoded = decodeJwt(token);
  const fallback = extractCompanyIdFromClaims(decoded);
  if (fallback !== undefined && fallback !== null) {
    const stringValue = String(fallback);
    await AsyncStorage.setItem("companyId", stringValue);
    console.log(
      "[MultiStepApplicationForm] recovered companyId from token",
      stringValue,
      decoded,
    );
    return stringValue;
  }

  console.warn(
    "[MultiStepApplicationForm] companyId missing from AsyncStorage and token claims",
    decoded,
  );
  return null;
};

// Confetti particle component
const ConfettiParticle = ({ delay, theme }: any) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const translateX = useRef(
    new Animated.Value(Math.random() * 400 - 200),
  ).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const colors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.tertiary,
    "#FFB547",
    "#FF6B9D",
    "#4ECDC4",
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 800,
          duration: 2500,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, theme]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: 8,
        height: 8,
        backgroundColor: color,
        borderRadius: 4,
        transform: [
          { translateX },
          { translateY },
          { rotate: rotateInterpolate },
        ],
        opacity,
      }}
    />
  );
};

export default function MultiStepApplicationForm({
  onClose,
  onSuccess,
  initialLoanType,
  initialLoanCategory,
  editMode = false,
  initialCustomerId = null,
  initialApplicationId = null,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { config } = useAppConfig();

  const [applicationNo, setApplicationNo] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [skipped, setSkipped] = useState<Record<number, boolean>>({});
  const formScrollRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();

  // Server-like state
  const [customerId, setCustomerId] = useState<string | null>(initialCustomerId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCustomer, setIsFetchingCustomer] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileKey, setUploadingFileKey] = useState<string | null>(null);

  const [submitStatus, setSubmitStatus] = useState<{
    applicationCreated: boolean;
    docsUploaded: boolean;
    docUploadFailed: boolean;
    docUploadError?: string;
    lastStage?: string;
  }>({
    applicationCreated: false,
    docsUploaded: false,
    docUploadFailed: false,
    docUploadError: "",
    lastStage: "",
  });

  const setStage = (lastStage: string) =>
    setSubmitStatus((p) => ({ ...p, lastStage }));

  // Success toast state + animations
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.3)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkRotate = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const playSuccessToast = () => {
    setShowSuccessToast(true);

    overlayOpacity.setValue(0);
    cardScale.setValue(0.3);
    cardOpacity.setValue(0);
    checkScale.setValue(0);
    checkRotate.setValue(0);
    circleScale.setValue(0);
    pulseAnim.setValue(1);

    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    setTimeout(() => {
      Animated.spring(circleScale, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }, 400);

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(checkRotate, {
          toValue: 1,
          duration: 500,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }, 600);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccessToast(false);
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      });
    }, 3500);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      formScrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  }, [step]);

  // -----------------------------
  // STEP STATES
  // -----------------------------
  const normalizedInitialLoanType = Array.isArray(initialLoanType)
    ? initialLoanType[0]
    : initialLoanType;
  const normalizedInitialLoanCategory = Array.isArray(initialLoanCategory)
    ? initialLoanCategory[0]
    : initialLoanCategory;

  const [step0, setStep0] = useState<Step0Values>({
    loanAmount: "",
    loanType: String(normalizedInitialLoanType || "").toLowerCase(),
    loanCategory:
      normalizedInitialLoanCategory === "secured" ||
      normalizedInitialLoanCategory === "unsecured"
        ? normalizedInitialLoanCategory
        : "",
    tenure: "",
    selectedProviders: [],
    providerAmounts: [],
    caseType: "fresh",
    businessEntityType: "",
    existingLoans: [
      {
        hasRunningLoans: "no",
        whichLoan: "",
        loanAmount: "",
        runningEmi: "",
      },
    ],
    propertyPurchaseType: "",
    referralCode: "",
  });

  const [step1, setStep1] = useState<Step1Values>({
    title: "",
    name: "",
    contact: "",
    email: "",
    pan: "",
    father_name: "",
    mother_name: "",
    working_address: "",
    permanent_address: "",
    current_address: "",
    city: "",
    state: "",
    employment_type: "",
    dob: undefined,
    consent_tc: true,
    consent_marketing: true,
  });

  const [step2, setStep2] = useState<Step2Value>({
    files: [],
    bankingPassword: "",
    personDetails: [],
  });

  useEffect(() => {
    if (editMode) return;
    setStep2({
      files: [],
      bankingPassword: "",
      personDetails: [],
    });
  }, [step0.loanType, step0.businessEntityType]);

  const [step3, setStep3] = useState<Step3Values>({
    aadharFront: null,
    aadharBack: null,
    pancard: null,
    passportPhoto: null,
  });

  const [step4, setStep4] = useState<Step4Values>({
    salary: "",
    totalExperience: "",
    existingEmi: "",
    existingLiability: "",
    certificates: [],
  });

  useEffect(() => {
    if (editMode && initialCustomerId) {
      const loadCustomerData = async () => {
        setIsFetchingCustomer(true);
        try {
          const res = await fetchCustomerFullDetails(initialCustomerId);
          console.log("[MultiStepApplicationForm] fetchCustomerFullDetails response:", res);
          const data = res?.data;
          console.log("[MultiStepApplicationForm] customer data:", data);
          if (data) {
            setStep1(prev => ({
              ...prev,
              name: data.name || "",
              contact: data.contact || "",
              email: data.email || "",
              pan: data.info?.pan || "",
              father_name: data.info?.father_name || "",
              mother_name: data.info?.mother_name || "",
              working_address: data.info?.working_address || "",
              permanent_address: data.info?.permanent_address || "",
              current_address: data.info?.current_address || "",
              city: data.info?.city || "",
              state: data.info?.state || "",
              employment_type: data.info?.employment_type || "",
              dob: data.dob ? new Date(data.dob).toISOString() : undefined,
            }));
            
            // Populate step 0 and step 4 from the latest application
            if (data.applications && data.applications.length > 0) {
              const sortedApps = data.applications.sort(
                (a: any, b: any) =>
                  new Date(b.application_date).getTime() -
                  new Date(a.application_date).getTime()
              );

              let latestApp: any = {};
              if (initialApplicationId) {
                latestApp =
                  data.applications.find(
                    (a: any) => String(a.id) === String(initialApplicationId)
                  ) ||
                  sortedApps[0] ||
                  {};
              } else {
                latestApp = sortedApps[0] || {};
              }
              
              setStep0(prev => ({
                ...prev,
                loanAmount: latestApp.amount ? String(latestApp.amount) : "",
                loanType: latestApp.loan_type ? latestApp.loan_type.toLowerCase() : "",
                loanCategory: latestApp.loan_category ? latestApp.loan_category.toLowerCase() : "",
                tenure: latestApp.tenure || "",
                businessEntityType: data.info?.company_type || "",
                professionalType: data.info?.occupation || "",
              }));
              
              setStep4(prev => ({
                ...prev,
                salary: data.info?.salary ? String(data.info.salary) : (latestApp.salary ? String(latestApp.salary) : ""),
                existingEmi: data.info?.existing_emi ? String(data.info.existing_emi) : (latestApp.existing_emi ? String(latestApp.existing_emi) : ""),
                existingLiability: data.info?.existing_liability ? String(data.info.existing_liability) : (latestApp.existing_liability ? String(latestApp.existing_liability) : ""),
              }));
            }
            if (data.customerDocuments && data.customerDocuments.length > 0) {
              const reverseDocTypeMap: Record<string, string> = {
                "form 16": "form16",
                "itr": "itr",
                "salary slip": "salarySlip",
                "bank statement": "banking",
                "computation of income": "computationOfIncome",
                "financials": "financials",
                "udhyam certificate": "udhyamCertificate",
                "gst": "gst",
                "form 26 as": "form26as",
                "list of directors": "listOfDirectors",
                "list of shareholders": "listOfShareholders",
                "aoa": "aoa",
                "moa": "moa",
                "company pan": "companyPan",
                "directors kyc": "directorsKyc",
                "partners kyc": "partnersKyc",
                "partnership deed": "partnershipDeed",
                "board resolution": "boardResolution",
                "mca report": "mcaReport",
                "coi": "coi",
                "ug certificate": "ugCertificate",
                "pg certificate": "pgCertificate",
                "registration": "registration",
                "address proof": "currentAddressProof",
                "company id card": "companyIdCard",
                "ownership proof": "ownershipProof",
                "utility bill": "utilityBill",
                "company address proof": "companyAddressProof",
                "share holding pattern": "shareHoldingPattern",
                "cop": "cop",
                "com": "com",
                "firm card": "firmCard",
                "property papers": "propertyPapers",
                "ats": "ats",
                "seller kyc": "sellerKyc",
                "seller cancelled cheque": "sellerCancelledCheque",
                "ptm": "ptm",
                "allotment letter": "allotmentLetter",
                "customer ledger": "customerLedger",
                "payment receipts": "paymentReceipts",
                "tpa": "tpa",
                "project noc": "projectNoc",
                "existing sanction letter": "existingSanctionLetter",
                "lod": "lod",
                "title deed": "titleDeed",
                "electricity bill": "electricityBill",
                "marksheet 10": "marksheet10",
                "marksheet 12": "marksheet12",
                "graduation marksheet": "marksheetGrad",
                "offer letter": "offerLetter",
                "fee structure": "feeStructure",
                "entrance exam result": "entranceExamResult",
                "co-applicant aadhaar front": "coApplicantAadhaarFront",
                "co-applicant aadhaar back": "coApplicantAadhaarBack",
                "co-applicant pan": "coApplicantPan",
                "co-applicant bank": "coApplicantBank",
                "co-applicant cheque": "coApplicantCheque",
                "co-applicant income docs": "coApplicantIncomeDocs",
                "cancel cheque": "cancelCheque",
              };

              const findDoc = (typeNames: string[]) => 
                data.customerDocuments.find((d: any) => typeNames.includes(String(d.type).toLowerCase()));

              const aadharFront = findDoc(['aadhaar front', 'aadhar front']);
              const aadharBack = findDoc(['aadhaar back', 'aadhar back']);
              const pancard = findDoc(['pancard', 'pan card']);
              const passportPhoto = findDoc(['photo', 'profile photo']);
              
              setStep3(prev => ({
                ...prev,
                aadharFront: aadharFront ? { uri: aadharFront.document_url, uploaded: true, name: aadharFront.document_name || "Aadhaar Front" } as any : null,
                aadharBack: aadharBack ? { uri: aadharBack.document_url, uploaded: true, name: aadharBack.document_name || "Aadhaar Back" } as any : null,
                pancard: pancard ? { uri: pancard.document_url, uploaded: true, name: pancard.document_name || "PAN Card" } as any : null,
                passportPhoto: passportPhoto ? { uri: passportPhoto.document_url, uploaded: true, name: passportPhoto.document_name || "Profile Photo" } as any : null,
              }));

              const step3Types = ['aadhaar front', 'aadhar front', 'aadhaar back', 'aadhar back', 'pancard', 'pan card', 'photo', 'profile photo', 'certificate'];
              
              const step2Files = data.customerDocuments
                .filter((d: any) => !step3Types.includes(String(d.type).toLowerCase()))
                .map((s: any) => {
                  const typeKey = String(s.type).toLowerCase();
                  return {
                    uri: s.document_url,
                    uploaded: true,
                    name: s.document_name || s.name || s.document_url.split('/').pop(),
                    fieldKey: reverseDocTypeMap[typeKey] || typeKey.replace(/\s+/g, '_')
                  };
                });
              
              if (step2Files.length > 0) {
                 setStep2(prev => ({
                   ...prev,
                   files: step2Files
                 }));
              }

              const certificates = data.customerDocuments
                .filter((d: any) => String(d.type).toLowerCase() === 'certificate')
                .map((s: any) => ({
                  uri: s.document_url,
                  uploaded: true,
                  name: s.document_name || s.name || s.document_url.split('/').pop(),
                }));

              if (certificates.length > 0) {
                 setStep4(prev => ({
                   ...prev,
                   certificates: certificates
                 }));
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch customer data for edit mode", error);
        } finally {
          setIsFetchingCustomer(false);
        }
      };
      loadCustomerData();
    }
  }, [editMode, initialCustomerId]);

  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(
    null,
  );
  const [isOmsStaff, setIsOmsStaff] = useState(false);

  const loadCompanies = useCallback(async () => {
    try {
      const response = await restApi.get("/companies", {
        params: { page: 1, limit: 100 },
      });
      const payload = response?.data;
      const results =
        payload?.data?.results || payload?.results || payload?.data || [];

      const items = Array.isArray(results)
        ? results.map((item: any) => ({
            id: Number(
              item.id ?? item._id ?? item.companyId ?? item.company_id ?? 0,
            ),
            companyId: String(
              item.companyId ?? item.company_id ?? item.id ?? "",
            ),
            name:
              item.name ||
              item.company_name ||
              item.displayName ||
              String(item.id),
          }))
        : [];

      setCompanies(items);
    } catch (error: any) {
      console.error(
        "[MultiStepApplicationForm] failed to load companies",
        error,
      );
    }
  }, []);

  useEffect(() => {
    const initializeCompanySelection = async () => {
      const token = await AsyncStorage.getItem("token");
      const decoded = decodeJwt(token);
      const authSource = await AsyncStorage.getItem("authSource");
      const userType = await AsyncStorage.getItem("userType");
      const decodedRole = String(decoded?.role || "").toLowerCase();
      const oms =
        authSource === "oms" &&
        (userType === "sales" || decodedRole === "sales") &&
        decodedRole !== "aggregator_member";
      setIsOmsStaff(oms);

      if (oms) {
        setSelectedCompanyId("101");
        await loadCompanies();
        return;
      }

      const savedCompanyIdLegacy = await AsyncStorage.getItem("companyId");
      setSelectedCompany(null);
      setSelectedCompanyId(savedCompanyIdLegacy || "");
    };

    initializeCompanySelection();
  }, [loadCompanies]);

  useEffect(() => {
    if (!selectedCompanyId || !companies.length) return;

    const match = companies.find(
      (company) =>
        company.companyId === selectedCompanyId ||
        String(company.id) === selectedCompanyId,
    );

    if (match) {
      setSelectedCompany(match);
    }
  }, [companies, selectedCompanyId]);

  // -----------------------------
  // VALIDITY FLAGS
  // -----------------------------
  const [step0Valid, setStep0Valid] = useState(false);
  const [step4Valid, setStep4Valid] = useState(false);

  const isStep2Skipped = !!skipped[2];

  const step1Valid = useMemo(() => {
    const isTitleOk = normalizeString(step1.title).length > 0;
    const isNameOk = normalizeString(step1.name).length >= 2;
    const isEmailOk = normalizeString(step1.email).includes("@");
    const isPhoneOk = normalizeString(step1.contact).length >= 10;

    const pan = normalizeString(step1.pan);
    const isPanOk = pan.length === 10;

    const isParentsOk =
      normalizeString(step1.mother_name).length > 0;

    const isAddressOk =
      normalizeString(step1.current_address).length > 0 &&
      normalizeString(step1.permanent_address).length > 0 &&
      normalizeString(step1.working_address).length > 0;

    const isCityStateOk =
      normalizeString(step1.city).length > 0 &&
      normalizeString(step1.state).length > 0;

    const isEmploymentOk = normalizeString(step1.employment_type).length > 0;
    const isDobOk = !!step1.dob;
    const isConsentOk = !!step1.consent_tc;

    return (
      isTitleOk &&
      isNameOk &&
      isEmailOk &&
      isPhoneOk &&
      isPanOk &&
      isParentsOk &&
      isAddressOk &&
      isCityStateOk &&
      isEmploymentOk &&
      isDobOk &&
      isConsentOk
    );
  }, [step1]);

  const isLocalPendingFile = (file?: PickedFile | null) =>
    !!file?.uri && !file.uri.startsWith("http") && !file.uploaded;

  const step2HasAtLeastOneDoc = step2.files.length >= 1;
  const step2HasPendingDocs = step2.files.some(isLocalPendingFile);

  const step3Files = [
    step3.aadharFront,
    step3.aadharBack,
    step3.pancard,
    step3.passportPhoto,
  ].filter(Boolean) as PickedFile[];
  const step3HasAnyDoc = step3Files.length > 0;
  const step3HasPendingDocs = step3Files.some(isLocalPendingFile);

  const step4HasAnyDoc = step4.certificates.length > 0;
  const step4HasPendingDocs = step4.certificates.some(isLocalPendingFile);

  const currentStepHasDocs =
    (step === 2 && step2HasAtLeastOneDoc) ||
    (step === 3 && step3HasAnyDoc) ||
    (step === 4 && step4HasAnyDoc);
  const currentStepHasPendingDocs =
    (step === 2 && step2HasPendingDocs) ||
    (step === 3 && step3HasPendingDocs) ||
    (step === 4 && step4HasPendingDocs);

  const step2EffectiveValid =
    isStep2Skipped || (step2HasAtLeastOneDoc && !step2HasPendingDocs);
  const step3EffectiveValid = !step3HasPendingDocs;

  useEffect(() => {
    if (skipped[2] && step2.files.length > 0) {
      setSkipped((prev) => {
        const next = { ...prev };
        delete next[2];
        return next;
      });
    }
  }, [skipped, step2.files.length]);

  useEffect(() => {
    const hasAny =
      !!step3.aadharFront ||
      !!step3.aadharBack ||
      !!step3.pancard ||
      !!step3.passportPhoto;

    if (skipped[3] && hasAny) {
      setSkipped((prev) => {
        const next = { ...prev };
        delete next[3];
        return next;
      });
    }
  }, [skipped, step3]);

  const maxStepAllowed = useMemo(() => {
    if (editMode) return 4;
    let allowed = 0;

    if (step0Valid) allowed = 1;
    else return 0;

    if (step1Valid) allowed = 2;
    else return allowed;

    if (step2EffectiveValid) allowed = 3;
    else return allowed;

    if (step3EffectiveValid) allowed = 4;
    else return allowed;

    return allowed;
  }, [step0Valid, step1Valid, step2EffectiveValid, step3EffectiveValid, editMode]);

  const canGoNext = useMemo(() => {
    if (editMode) return true;
    if (step === 0) return step0Valid;
    if (step === 1) return step1Valid;
    if (step === 2) return step2EffectiveValid;
    if (step === 3) return step3EffectiveValid;
    return true;
  }, [step, step0Valid, step1Valid, step2EffectiveValid, step3EffectiveValid, editMode]);

  const canSubmit = useMemo(
    () => {
      if (editMode) return !isSubmitting && !isUploading;
      return step === 4 &&
      step4Valid &&
      !step4HasPendingDocs &&
      !isSubmitting &&
      !isUploading;
    },
    [step, step4Valid, step4HasPendingDocs, isSubmitting, isUploading, editMode],
  );

  // -----------------------------
  // NAV ACTIONS
  // -----------------------------
  const next = () => {
    if (canGoNext) setStep((s0) => Math.min(STEPS.length - 1, s0 + 1));
  };

  const back = () => {
    if (step === 0) onClose();
    else setStep((s0) => Math.max(0, s0 - 1));
  };

  const canSkip = step === 2 || step === 3;

  const skipThisStep = () => {
    if (!canSkip) return;
    setSkipped((prev) => ({ ...prev, [step]: true }));
    setStep((s0) => Math.min(STEPS.length - 1, s0 + 1));
  };

  // -----------------------------
  // API HELPERS
  // -----------------------------
  const createDocument = async (payload: any, config?: any) => {
    await coreApi.post("/create-document", payload, config);
  };

  const createCustomerPartners = async (partnersData: any[], config?: any) => {
    if (!partnersData.length) return;
    await coreApi.post("/create-customer-partners", partnersData, config);
  };

  const updateCustomerInfo = async (
    payload: {
      customer_id: string;
      salary: string;
      existing_emi?: string;
      existing_liability?: string;
    },
    config?: Record<string, any>,
  ) => {
    await coreApi.patch("/customer-info-update", payload, config);
  };

  const randomFourDigit = 8462;
  const password = `${step1.name.replace(/\s/g, "")}@${randomFourDigit}`;

  const createCustomerEarly = useCallback(async () => {
    try {
      if (customerId) return customerId;

      console.log("🚀 Creating customer early...");

      const storedCompanyId = await getCompanyId();
      const useCompanyId = isOmsStaff
        ? (selectedCompany?.companyId ?? selectedCompanyId)
        : (selectedCompany?.companyId ?? storedCompanyId);
      const useCompanyIdString = useCompanyId ? String(useCompanyId) : "";

      if (isOmsStaff && !useCompanyIdString) return null;

      const requestConfig = {
        headers: {
          ...(useCompanyIdString ? { companyid: useCompanyIdString } : {}),
        },
      };

      const customerPayload = {
        title: step1.title,
        name: `${step1.title} ${step1.name}`.trim(),
        email: step1.email,
        contact: step1.contact,
        dob: step1.dob,
        password,
        status: "active",
        ...(useCompanyIdString
          ? { company_id: Number(useCompanyIdString) }
          : {}),
        ...(selectedCompany?.id ? { aggregator_id: selectedCompany.id } : {}),
      };

      const res = await coreApi.post(
        "/create-customer",
        customerPayload,
        requestConfig,
      );

      const newCustomerId =
        res?.data?.data?.id || res?.data?.data?.customerId || res?.data?.id;

      if (!newCustomerId) throw new Error("CustomerId not returned");

      setCustomerId(String(newCustomerId));

      console.log("✅ Early customer created:", newCustomerId);
      return String(newCustomerId);
    } catch (err) {
      console.error("❌ Early customer creation failed:", err);
    }
  }, [
    step1,
    selectedCompany,
    selectedCompanyId,
    isOmsStaff,
    customerId,
    password,
  ]);

  useEffect(() => {
    if (step === 1 && step1Valid) {
      createCustomerEarly();
    }
  }, [step, step1Valid, createCustomerEarly]);

  // ==========================================
  // DYNAMIC STEPS
  // ==========================================
  const dynamicSteps = STEPS.map((step) => {
    if (step.id === "loan-details") {
      return {
        ...step,
        title: config.isReviewMode ? `${config.terminology.loanWord} Details` : "Loan Details",
      };
    }
    return step;
  });

  // ==========================================
  // STATE & REFS
  // ==========================================
  const uploadFileInstantly = useCallback(
    async (file: PickedFile, docType: string) => {
      if (!file?.uri) return;

      if (!customerId) {
        console.warn("⏳ Customer not ready, skipping upload");
        return;
      }

      try {
        const url = await uploadToS3(file, `document/${file.name || docType}`);
        const finalUrl =
          docType === "bank statement" && step2.bankingPassword
            ? `${url}#pwd=${encodeURIComponent(step2.bankingPassword)}`
            : url;
        await createDocument(
          {
            customer_id: customerId,
            document_url: finalUrl,
            type: docType,
          },
          {
            headers: {
              ...((await getCompanyId())
                ? { companyid: await getCompanyId() }
                : {}),
            },
          },
        );
        if (file.fieldKey) {
          setStep2((prev) => ({
            ...prev,
            files: prev.files.map((item) =>
              item.fieldKey === file.fieldKey
                ? { ...item, uploaded: true }
                : item,
            ),
          }));
        }
        console.log(`✅ Instant upload successful: ${docType} - ${file.name}`);
      } catch (err: any) {
        console.error(`❌ Instant upload failed for ${docType}:`, err);
      }
    },
    [customerId, step2.bankingPassword],
  );

  const buildRequestConfig = useCallback(async () => {
    const storedCompanyId = await getCompanyId();
    const useCompanyId = isOmsStaff
      ? (selectedCompany?.companyId ?? selectedCompanyId)
      : (selectedCompany?.companyId ?? storedCompanyId);
    const useCompanyIdString = useCompanyId ? String(useCompanyId) : "";

    return {
      headers: {
        ...(useCompanyIdString ? { companyid: useCompanyIdString } : {}),
      },
    };
  }, [isOmsStaff, selectedCompany, selectedCompanyId]);

  const uploadDocumentFile = useCallback(
    async (
      file: PickedFile,
      docType: string,
      activeCustomerId: string,
      requestConfig: any,
    ) => {
      const url = await uploadToS3(file, `document/${file.name || docType}`);
      const finalUrl =
        docType === "bank statement" && step2.bankingPassword
          ? `${url}#pwd=${encodeURIComponent(step2.bankingPassword)}`
          : url;

      await createDocument(
        {
          customer_id: activeCustomerId,
          document_url: finalUrl,
          type: docType,
          document_name: file.name || docType,
          name: file.name || docType,
        },
        requestConfig,
      );
    },
    [step2.bankingPassword],
  );

  const getStep2DocumentType = (file: PickedFile) => {
    const fieldKey = String(file.fieldKey || "").toLowerCase();
    if (file.docType) return file.docType;
    if (fieldKey.includes("aadhaar_back")) return "aadhaar back";
    if (fieldKey.includes("aadhaar")) return "aadhaar front";
    if (fieldKey.includes("pan")) return "pancard";
    if (fieldKey.includes("currentaddress")) return "current address proof";
    if (fieldKey.includes("cop")) return "cop";
    if (fieldKey.includes("com")) return "com";
    if (fieldKey.includes("firmcard")) return "firm card";
    if (fieldKey.includes("cancelcheque")) return "cancel cheque";
    if (fieldKey.includes("companyid")) return "company id card";
    if (fieldKey.includes("coapplicantaadhaar")) return "co-applicant aadhaar";
    if (fieldKey.includes("coapplicantpan")) return "co-applicant pan";
    if (fieldKey.includes("marksheet10")) return "marksheet 10";
    if (fieldKey.includes("marksheet12")) return "marksheet 12";
    if (fieldKey.includes("graduationmarksheet")) return "graduation marksheet";
    if (fieldKey.includes("offerletter")) return "offer letter";
    if (fieldKey.includes("feestructure")) return "fee structure";
    if (fieldKey.includes("entranceexam")) return "entrance exam result";
    if (fieldKey.includes("propertypapers")) return "property papers";
    if (fieldKey.includes("sellerkyc")) return "seller kyc";
    if (fieldKey.includes("allotmentletter")) return "allotment letter";
    if (fieldKey.includes("titledeed")) return "title deed";
    if (fieldKey.includes("boardresolution")) return "board resolution";
    if (fieldKey.includes("mcareport")) return "mca report";
    if (fieldKey.includes("coi")) return "coi";
    if (fieldKey.includes("aoa")) return "aoa";
    if (fieldKey.includes("moa")) return "moa";
    if (fieldKey.includes("companypan")) return "company pan";
    if (fieldKey.includes("ptm")) return "ptm";
    if (fieldKey.includes("tpa")) return "tpa";
    if (fieldKey.includes("projectnoc")) return "project noc";
    if (fieldKey.includes("lod")) return "lod";
    if (fieldKey.includes("ats")) return "ats";
    if (fieldKey.includes("electricitybill")) return "electricity bill";
    if (fieldKey.includes("utilitybill")) return "utility bill";
    if (fieldKey.includes("ownershipproof")) return "ownership proof";
    if (fieldKey.includes("shareholdingpattern")) return "share holding pattern";
    if (fieldKey.includes("registration")) return "registration";
    if (fieldKey.includes("ug_certificate")) return "ug certificate";
    if (fieldKey.includes("pg_certificate")) return "pg certificate";
    if (fieldKey.includes("partnership_deed")) return "partnership deed";
    if (fieldKey.includes("directors_kyc")) return "directors kyc";
    if (fieldKey.includes("list_of_shareholders")) return "list of shareholders";
    if (fieldKey.includes("list_of_directors")) return "list of directors";
    if (fieldKey.includes("form_26_as")) return "form 26 as";
    if (fieldKey.includes("gst")) return "gst";
    if (fieldKey.includes("udhyam_certificate")) return "udhyam certificate";
    if (fieldKey.includes("financials")) return "financials";
    if (fieldKey.includes("computation_of_income")) return "computation of income";
    if (fieldKey.includes("salary_slip")) return "salary slip";
    if (fieldKey.includes("itr")) return "itr";
    if (fieldKey.includes("form_16")) return "form 16";
    if (fieldKey.includes("photo")) return "photo";
    if (fieldKey.includes("certificate")) return "certificate";
    if (fieldKey.includes("audio")) return "audio";
    
    return "bank statement";
  };

  const uploadCurrentStepDocuments = useCallback(async () => {
    if (!currentStepHasDocs || !currentStepHasPendingDocs || isUploading) {
      return;
    }

    setIsUploading(true);
    setStage("Uploading selected documents");

    try {
      const activeCustomerId = customerId || (await createCustomerEarly());
      if (!activeCustomerId) {
        throw new Error(
          "Customer is not ready. Please complete customer details first.",
        );
      }

      const requestConfig = await buildRequestConfig();

      if (step === 2) {
        const pendingFiles = step2.files.filter(isLocalPendingFile);
        for (const file of pendingFiles) {
          await uploadDocumentFile(
            file,
            getStep2DocumentType(file),
            activeCustomerId,
            requestConfig,
          );
        }

        setStep2((prev) => ({
          ...prev,
          files: prev.files.map((file) =>
            isLocalPendingFile(file) ? { ...file, uploaded: true } : file,
          ),
        }));
      }

      if (step === 3) {
        const step3Entries: Array<[keyof Step3Values, string]> = [
          ["aadharFront", "aadhaar front"],
          ["aadharBack", "aadhaar back"],
          ["pancard", "pancard"],
          ["passportPhoto", "photo"],
        ];

        for (const [key, docType] of step3Entries) {
          const file = step3[key];
          if (isLocalPendingFile(file)) {
            await uploadDocumentFile(
              file as PickedFile,
              docType,
              activeCustomerId,
              requestConfig,
            );
          }
        }

        setStep3((prev) => ({
          aadharFront: isLocalPendingFile(prev.aadharFront)
            ? { ...prev.aadharFront!, uploaded: true }
            : prev.aadharFront,
          aadharBack: isLocalPendingFile(prev.aadharBack)
            ? { ...prev.aadharBack!, uploaded: true }
            : prev.aadharBack,
          pancard: isLocalPendingFile(prev.pancard)
            ? { ...prev.pancard!, uploaded: true }
            : prev.pancard,
          passportPhoto: isLocalPendingFile(prev.passportPhoto)
            ? { ...prev.passportPhoto!, uploaded: true }
            : prev.passportPhoto,
        }));
      }

      if (step === 4) {
        const pendingFiles = step4.certificates.filter(isLocalPendingFile);
        for (const file of pendingFiles) {
          await uploadDocumentFile(
            file,
            "certificate",
            activeCustomerId,
            requestConfig,
          );
        }

        setStep4((prev) => ({
          ...prev,
          certificates: prev.certificates.map((file) => isLocalPendingFile(file) ? { ...file, uploaded: true } : file),
        }));
      }

      setSubmitStatus((prev) => ({
        ...prev,
        docsUploaded: false,
        docUploadFailed: false,
        docUploadError: "",
        lastStage: "",
      }));
    } catch (err: any) {
      const msg = getPrettyError(err);
      setSubmitStatus((prev) => ({
        ...prev,
        docUploadFailed: true,
        docUploadError: msg,
        lastStage: "Document upload failed.",
      }));
      console.error(
        "Document upload failed:",
        err?.response?.data || err?.message || err,
      );
    } finally {
      setIsUploading(false);
    }
  }, [
    buildRequestConfig,
    createCustomerEarly,
    currentStepHasDocs,
    currentStepHasPendingDocs,
    customerId,
    isUploading,
    step,
    step2.files,
    step3,
    step4.certificates,
    uploadDocumentFile,
  ]);

  const uploadSingleDocument = useCallback(
    async (
      file: PickedFile | null | undefined,
      docType: string,
      fileKey: string,
      markUploaded: () => void,
    ) => {
      if (!isLocalPendingFile(file) || isUploading) {
        return;
      }

      setIsUploading(true);
      setUploadingFileKey(fileKey);
      setStage("Uploading selected document");

      try {
        const activeCustomerId = customerId || (await createCustomerEarly());
        if (!activeCustomerId) {
          throw new Error(
            "Customer is not ready. Please complete customer details first.",
          );
        }

        const requestConfig = await buildRequestConfig();
        await uploadDocumentFile(
          file as PickedFile,
          docType,
          activeCustomerId,
          requestConfig,
        );
        markUploaded();

        setSubmitStatus((prev) => ({
          ...prev,
          docsUploaded: false,
          docUploadFailed: false,
          docUploadError: "",
          lastStage: "",
        }));
      } catch (err: any) {
        const msg = getPrettyError(err);
        setSubmitStatus((prev) => ({
          ...prev,
          docUploadFailed: true,
          docUploadError: msg,
          lastStage: "Document upload failed.",
        }));
        console.error(
          "Document upload failed:",
          err?.response?.data || err?.message || err,
        );
      } finally {
        setUploadingFileKey(null);
        setIsUploading(false);
      }
    },
    [
      buildRequestConfig,
      createCustomerEarly,
      customerId,
      isUploading,
      uploadDocumentFile,
    ],
  );

  const uploadStep2File = useCallback(
    (file: PickedFile) => {
      const fileKey = file.fieldKey || file.uri;
      uploadSingleDocument(file, getStep2DocumentType(file), fileKey, () => {
        setStep2((prev) => ({
          ...prev,
          files: prev.files.map((item) =>
            item.fieldKey === file.fieldKey || item.uri === file.uri
              ? { ...item, uploaded: true }
              : item,
          ),
        }));
      });
    },
    [uploadSingleDocument],
  );

  const uploadStep3File = useCallback(
    (field: keyof Step3Values) => {
      const file = step3[field];
      const docTypeMap: Record<keyof Step3Values, string> = {
        aadharFront: "aadhaar front",
        aadharBack: "aadhaar back",
        pancard: "pancard",
        passportPhoto: "photo",
      };

      uploadSingleDocument(file, docTypeMap[field], field, () => {
        setStep3((prev) => ({
          ...prev,
          [field]: prev[field]
            ? { ...prev[field]!, uploaded: true }
            : prev[field],
        }));
      });
    },
    [step3, uploadSingleDocument],
  );



  // 1. Add this state at the top of your component with your other useState hooks:
  // const [applicationNo, setApplicationNo] = useState<string | null>(null);

  const submit = async () => {
    if (!canSubmit) return;

    setSubmitStatus({
      applicationCreated: false,
      docsUploaded: false,
      docUploadFailed: false,
      docUploadError: "",
      lastStage: "",
    });

    setIsSubmitting(true);

    // Local array to track generated numbers for the UI
    const generatedNumbers: string[] = [];

    try {
      const storedCompanyId = await getCompanyId();
      const token = await AsyncStorage.getItem("token");
      const decoded = decodeJwt(token);
      const isAggregatorMember = String(decoded?.role || "").toLowerCase() === "aggregator_member";
      const aggregatorMemberId = isAggregatorMember ? extractUserIdFromClaims(decoded) : undefined;
      const appliedByUserId = isOmsStaff
        ? extractUserIdFromClaims(decoded)
        : undefined;
      const useCompanyId = isOmsStaff
        ? (selectedCompany?.companyId ?? selectedCompanyId)
        : (selectedCompany?.companyId ?? storedCompanyId);
      const useCompanyIdString = useCompanyId ? String(useCompanyId) : "";
      const appliedByNumber =
        appliedByUserId !== undefined && appliedByUserId !== null
          ? Number(appliedByUserId)
          : undefined;

      if (isOmsStaff && !useCompanyIdString) {
        throw new Error("First select the company name.");
      }

      if (
        isOmsStaff &&
        (appliedByNumber === undefined || !Number.isFinite(appliedByNumber))
      ) {
        throw new Error("Unable to identify OMS staff user for application.");
      }

      if (useCompanyIdString) {
        await AsyncStorage.setItem("companyId", useCompanyIdString);
      }

      const requestConfig = {
        headers: {
          ...(useCompanyIdString ? { companyid: useCompanyIdString } : {}),
        },
      };

      const customerPayload = {
        title: step1.title,
        name: `${step1.title} ${step1.name}`.trim(),
        email: step1.email,
        contact: step1.contact,
        dob: step1.dob,
        password,
        status: "active",
        ...(useCompanyIdString
          ? { company_id: Number(useCompanyIdString) }
          : {}),
        ...(selectedCompany?.id ? { aggregator_id: selectedCompany.id } : {}),
        ...(aggregatorMemberId ? { aggregator_member_id: aggregatorMemberId } : {}),
      };
      console.log("[MultiStepApplicationForm] create-customer payload", {
        selectedCompany,
        companyId: useCompanyIdString,
        isOmsStaff,
        appliedBy: appliedByNumber,
        customerPayload,
      });
      let newCustomerId = customerId;

      if (!editMode && !newCustomerId) {
        console.log("⚠️ Creating customer in submit fallback...");

        const customerRes = await coreApi.post(
          "/create-customer",
          customerPayload,
          requestConfig,
        );

        newCustomerId =
          customerRes?.data?.data?.id ||
          customerRes?.data?.data?.customerId ||
          customerRes?.data?.id;

        if (!newCustomerId) throw new Error("CustomerId not returned");

        setCustomerId(String(newCustomerId));
      }

      if (!newCustomerId) throw new Error("CustomerId not returned from API");
      setCustomerId(String(newCustomerId));

      if (!editMode) {
        setStage("Creating customer info");

        // 2) create-customer-info
        await coreApi.post(
          "/create-customer-info",
          {
            customer_id: newCustomerId,
            pan: step1.pan,
            father_name: step1.father_name,
            mother_name: step1.mother_name,
            working_address: step1.working_address,
            permanent_address: step1.permanent_address,
            current_address: step1.current_address,
            city: step1.city,
            state: step1.state,
            employment_type: step1.employment_type,
            company_type: step0.businessEntityType,
            occupation: step0.professionalType,
            
            // Co-Applicant details sent to backend
            co_applicant_name: step1.co_applicant_name,
            co_applicant_email: step1.co_applicant_email,
            co_applicant_contact: step1.co_applicant_contact,
            co_applicant_mother_name: step1.co_applicant_mother_name,
          },
          requestConfig,
        );
      }

      const pendingStep2Files = (step2.files || []).filter(
        (file) => file.uri && !file.uri.startsWith("http") && !file.uploaded,
      );

      if (pendingStep2Files.length > 0) {
        setStage(config.isReviewMode ? `Uploading ${config.terminology.loanWord.toLowerCase()} documents` : "Uploading loan documents");

        for (const file of pendingStep2Files) {
          const docType = getStep2DocumentType(file);
          const url = await uploadToS3(
            file,
            `document/${file.name || docType}`,
          );
          const finalUrl =
            docType === "bank statement" && step2.bankingPassword
              ? `${url}#pwd=${encodeURIComponent(step2.bankingPassword)}`
              : url;

          await createDocument(
            {
              customer_id: newCustomerId,
              document_url: finalUrl,
              type: docType,
              document_name: docType,
              name: docType,
            },
            requestConfig,
          );
        }

        setStep2((prev) => ({
          ...prev,
          files: prev.files.map((file) => ({ ...file, uploaded: true })),
        }));
      }

      const partnerRows = (step2.personDetails || []).filter(
        (person) => person.aadhaar || person.pan || person.mobile,
      );

      if (partnerRows.length > 0) {
        await createCustomerPartners(
          partnerRows.map((person) => ({
            customer_id: newCustomerId,
            aadhaar: person.aadhaar,
            pan: person.pan,
            mobile: person.mobile,
          })),
          requestConfig,
        );
      }

      // 3) create one application record with all providers, matching web.
      if (!step0.providerAmounts?.length) {
        throw new Error("No provider selected for application");
      }

      if (editMode) {
         setSubmitStatus((prev) => ({
          ...prev,
          applicationCreated: true,
          docsUploaded: true,
        }));

        playSuccessToast();
        return;
      }

      setStage("Creating applications");

      const application_no = generateApplicationNumber();
      generatedNumbers.push(application_no);

      const providersString = step0.providerAmounts
        .map((pa) => pa.provider)
        .filter(Boolean)
        .join(", ");

      const numericTenure = step0.tenure
        ? Number(String(step0.tenure).split(" ")[0])
        : 5;

      const applicationPayload = {
        application_no,
        customer_id: newCustomerId,
        provider: providersString,
        amount: Number(step0.loanAmount || 100000),
        loan_type: step0.loanType || "personal loan",
        loan_category: step0.loanCategory || "unsecured",
        tenure: numericTenure,
        has_running_loans: step0.existingLoans?.[0]?.hasRunningLoans === "yes" ? 1 : 0,
        which_loan:
          step0.existingLoans?.[0]?.hasRunningLoans === "yes"
            ? step0.existingLoans[0].whichLoan || ""
            : "",
        running_loan_amount:
          step0.existingLoans?.[0]?.hasRunningLoans === "yes" &&
          step0.existingLoans[0].loanAmount
            ? Number(step0.existingLoans[0].loanAmount)
            : null,
        existing_loans: JSON.stringify(
          (step0.existingLoans || []).map((l: any) => ({
            has_running_loans: l.hasRunningLoans === "yes" ? 1 : 0,
            which_loan: l.hasRunningLoans === "yes" ? l.whichLoan || null : null,
            loan_amount:
              l.hasRunningLoans === "yes" && l.loanAmount
                ? Number(l.loanAmount)
                : null,
            running_emi:
              l.hasRunningLoans === "yes" && l.runningEmi
                ? Number(l.runningEmi)
                : null,
          })),
        ),
        case_type: step0.caseType || "fresh",
        application_date: new Date().toISOString(),
        ...(useCompanyIdString
          ? { company_id: Number(useCompanyIdString) }
          : {}),
        ...(isOmsStaff && appliedByNumber
          ? { applied_by: appliedByNumber, source: "oms", is_picked: 0 }
          : { source: "lendgrid", is_picked: 0 }),
        ...(selectedCompany?.id ? { aggregator_id: selectedCompany.id } : {}),
        ...(aggregatorMemberId ? { aggregator_member_id: aggregatorMemberId } : {}),
        ...(step0.referralCode?.trim() ? { referral_code: step0.referralCode.trim() } : {}),
      };

      console.log("[MultiStepApplicationForm] create-application payload", {
        selectedCompany,
        companyId: useCompanyIdString,
        isOmsStaff,
        appliedBy: appliedByNumber,
        applicationPayload,
      });

      const appRes = await coreApi.post(
        "/create-application",
        applicationPayload,
        requestConfig,
      );

      const applicationId =
        appRes?.data?.data?.applicationId ||
        appRes?.data?.data?.id ||
        appRes?.data?.id;

      if (applicationId) {
        try {
          await coreApi.post(
            "/create-loan-tracking",
            {
              customer_application_id: applicationId,
              status: "submitted",
              ...(useCompanyIdString
                ? { company_id: Number(useCompanyIdString) }
                : {}),
            },
            requestConfig,
          );
        } catch (e) {
          console.warn("Tracking creation failed, continuing...", e);
        }
      }

      // Update the state with the numbers (comma separated if multiple)
      setApplicationNo(generatedNumbers.join(", "));
      setSubmitStatus((p) => ({ ...p, applicationCreated: true }));

      // 4) Update salary if present
      if (step4?.salary) {
        try {
          await updateCustomerInfo(
            {
              customer_id: String(newCustomerId),
              salary: step4.salary,
              existing_emi: step4.existingEmi || "",
              existing_liability: step4.existingLiability || "",
            },
            requestConfig,
          );
        } catch (err: any) {
          console.error("Salary update failed:", err);
        }
      }

      setSubmitStatus((p) => ({
        ...p,
        docsUploaded: true,
        docUploadFailed: false,
        lastStage: "Application & documents submitted successfully.",
      }));

      playSuccessToast();

      queryClient.invalidateQueries({ queryKey: ["customer-applications"] });
    } catch (e: any) {
      const msg = getPrettyError(e);
      setSubmitStatus((p) => ({
        ...p,
        docUploadFailed: true,
        docUploadError: msg,
        lastStage: p.applicationCreated
          ? "Application created but final submission failed."
          : "Application submission failed.",
      }));
      console.log("❌ SUBMIT ERROR:", e?.response?.data || e?.message || e);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const checkRotateInterpolate = checkRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
    >
      <HorizontalStepper
        steps={dynamicSteps}
        currentStep={step}
        skippedSteps={skipped}
        maxStepAllowed={maxStepAllowed}
        onStepPress={(index) => {
          if (index <= step) return setStep(index);
          if (index <= maxStepAllowed) setStep(index);
        }}
      />

      {(submitStatus.applicationCreated ||
        submitStatus.docUploadFailed ||
        submitStatus.docsUploaded) && (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: submitStatus.docUploadFailed
              ? "rgba(239,68,68,0.25)"
              : "rgba(34,197,94,0.25)",
            backgroundColor: submitStatus.docUploadFailed
              ? "rgba(239,68,68,0.06)"
              : "rgba(34,197,94,0.06)",
          }}
        >
          {/* Colored accent strip */}
          <View
            style={{
              height: 4,
              backgroundColor: submitStatus.docUploadFailed ? "#EF4444" : "#22C55E",
            }}
          />
          <View style={{ padding: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Feather
                name={submitStatus.docUploadFailed ? "alert-circle" : submitStatus.docsUploaded ? "check-circle" : "clock"}
                size={18}
                color={submitStatus.docUploadFailed ? "#EF4444" : "#22C55E"}
              />
              <Text
                style={{
                  color: submitStatus.docUploadFailed ? "#EF4444" : "#22C55E",
                  fontWeight: "800",
                  fontSize: 14,
                }}
              >
                {submitStatus.docUploadFailed
                  ? "Action Required"
                  : submitStatus.docsUploaded
                  ? "Application Submitted"
                  : "Processing…"}
              </Text>
            </View>

            {submitStatus.docUploadFailed && (
              <>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13, lineHeight: 18 }}>
                  Upload failed — application was created. Please retry.
                </Text>
                {!!submitStatus.docUploadError && (
                  <Text
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      fontSize: 12,
                      lineHeight: 18,
                      marginTop: 4,
                      opacity: 0.8,
                    }}
                  >
                    {submitStatus.docUploadError}
                  </Text>
                )}
              </>
            )}

            {!!submitStatus.lastStage && (
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant,
                  marginTop: 4,
                  fontSize: 12,
                  opacity: 0.75,
                }}
              >
                {submitStatus.lastStage}
              </Text>
            )}

            {!!customerId && (
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant,
                  marginTop: 4,
                  fontSize: 11,
                  opacity: 0.65,
                }}
              >
                Customer ID: {customerId}
              </Text>
            )}
          </View>
        </View>
      )}

      <ScrollView
        ref={formScrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 220 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <Step0LoanDetails
            value={step0}
            onChange={setStep0}
            onValidityChange={setStep0Valid}
            disabled={editMode}
          />
        )}

        {step === 1 && (
          <Step1BasicDetails
            value={step1}
            onChange={setStep1}
            onValidityChange={() => {}}
            loanType={step0.loanType}
            disabled={editMode}
          />
        )}

        {step === 2 && (
          <Step2Statement
            value={step2}
            onChange={setStep2}
            maxFiles={60}
            customerId={customerId}
            loanType={step0.loanType}
            businessEntityType={step0.businessEntityType}
            propertyPurchaseType={step0.propertyPurchaseType}
            professionalType={step0.professionalType}
            employmentType={step1.employment_type}
            onUploadFile={uploadStep2File}
            uploadingFileKey={uploadingFileKey}
            disabled={editMode}
          />
        )}

        {step === 3 && (
          <Step3IdProof
            value={step3}
            onChange={setStep3}
            customerId={customerId}
            onUploadFile={uploadStep3File}
            uploadingFileKey={uploadingFileKey}
            disabled={editMode}
          />
        )}

        {step === 4 && (
          <Step4AdditionalDetails
            value={step4}
            onChange={setStep4}
            onValidityChange={setStep4Valid}
            customerId={customerId}
            disabled={editMode}
          />
        )}

        {currentStepHasDocs && (
          <TouchableOpacity
            onPress={uploadCurrentStepDocuments}
            disabled={!currentStepHasPendingDocs || isUploading}
            activeOpacity={0.85}
            style={{
              marginTop: 16,
              paddingVertical: 15,
              borderRadius: 14,
              backgroundColor:
                currentStepHasPendingDocs && !isUploading
                  ? theme.colors.secondary
                  : theme.colors.surfaceVariant,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              shadowColor:
                currentStepHasPendingDocs && !isUploading
                  ? theme.colors.secondary
                  : "transparent",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: currentStepHasPendingDocs && !isUploading ? 4 : 0,
            }}
          >
            <Feather
              name={isUploading ? "loader" : "upload-cloud"}
              size={16}
              color={
                currentStepHasPendingDocs && !isUploading
                  ? "#FFFFFF"
                  : theme.colors.onSurfaceVariant
              }
            />
            <Text
              style={{
                color:
                  currentStepHasPendingDocs && !isUploading
                    ? "#FFFFFF"
                    : theme.colors.onSurfaceVariant,
                fontWeight: "800",
                fontSize: 14,
              }}
            >
              {isUploading ? "Uploading…" : "Upload All Documents"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {showSuccessToast && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.65)",
            opacity: overlayOpacity,
          }}
          pointerEvents="box-none"
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle key={i} delay={i * 50} theme={theme} />
          ))}

          <Animated.View
            style={{
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
              backgroundColor: theme.colors.surface,
              borderRadius: 28,
              paddingVertical: 44,
              paddingHorizontal: 32,
              width: "88%",
              maxWidth: 360,
              alignItems: "center",
              elevation: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 24,
              // Top accent strip
              borderTopWidth: 4,
              borderTopColor: "#00C853",
            }}
          >
            {/* ── Circle icon ── */}
            <Animated.View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: "#00C853",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
                transform: [{ scale: circleScale }],
                shadowColor: "#00C853",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.45,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Animated.View
                style={{
                  position: "absolute",
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: "#00C853",
                  opacity: 0.25,
                  transform: [{ scale: pulseAnim }],
                }}
              />
              <Animated.View
                style={{
                  transform: [
                    { scale: checkScale },
                    { rotate: checkRotateInterpolate },
                  ],
                }}
              >
                <Feather name="check" size={46} color="#FFFFFF" />
              </Animated.View>
            </Animated.View>

            <Text
              style={{
                color: theme.colors.onSurface,
                fontWeight: "900",
                fontSize: 22,
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              Application Submitted!
            </Text>

            {/* Application number badge */}
            {applicationNo && (
              <View
                style={{
                  backgroundColor: `${theme.colors.primary}18`,
                  borderWidth: 1,
                  borderColor: `${theme.colors.primary}30`,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 12,
                  marginBottom: 14,
                  marginTop: 4,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}
                >
                  Application No.
                </Text>
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontWeight: "900",
                    fontSize: 15,
                    letterSpacing: 1.5,
                  }}
                >
                  {applicationNo}
                </Text>
              </View>
            )}

            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                fontSize: 14,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Your {config.isReviewMode ? config.terminology.loanWord.toLowerCase() : "loan"} application has been
              successfully submitted for processing.
            </Text>

            {/* Bottom accent bar */}
            <View
              style={{
                marginTop: 24,
                flexDirection: "row",
                gap: 4,
              }}
            >
              {[1, 2, 3].map((n) => (
                <View
                  key={n}
                  style={{
                    height: 4,
                    width: n === 2 ? 28 : 12,
                    borderRadius: 2,
                    backgroundColor:
                      n === 2 ? theme.colors.primary : `${theme.colors.primary}40`,
                  }}
                />
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      )}

      {/* ── Footer action buttons ───────────────────────────── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingTop: 14,
          paddingHorizontal: 16,
          paddingBottom: 16 + insets.bottom,
          flexDirection: "row",
          gap: 10,
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outlineVariant,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
        }}
      >
        {/* Back / Cancel */}
        <TouchableOpacity
          onPress={back}
          style={{
            flex: 1,
            paddingVertical: 15,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: theme.colors.outline,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 6,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Feather
            name={step === 0 ? "x" : "chevron-left"}
            size={16}
            color={theme.colors.onSurface}
          />
          <Text
            style={{
              color: theme.colors.onSurface,
              fontWeight: "700",
              fontSize: 15,
            }}
          >
            {step === 0 ? "Cancel" : "Back"}
          </Text>
        </TouchableOpacity>

        {step === 4 ? (
          /* Submit */
          <TouchableOpacity
            onPress={submit}
            disabled={!canSubmit}
            style={{
              flex: 2,
              paddingVertical: 15,
              borderRadius: 14,
              backgroundColor: canSubmit
                ? theme.colors.primary
                : theme.colors.surfaceVariant,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 6,
              shadowColor: canSubmit ? theme.colors.primary : "transparent",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: canSubmit ? 6 : 0,
            }}
          >
            <Feather
              name={isSubmitting || isUploading ? "loader" : "send"}
              size={16}
              color={canSubmit ? "#FFFFFF" : theme.colors.onSurfaceVariant}
            />
            <Text
              style={{
                color: canSubmit ? "#FFFFFF" : theme.colors.onSurfaceVariant,
                fontWeight: "900",
                fontSize: 15,
                letterSpacing: 0.3,
              }}
            >
              {isSubmitting || isUploading
                ? isUploading
                  ? "Uploading…"
                  : "Submitting…"
                : "Submit Application"}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            {/* Skip button (steps 2 & 3) */}
            {(step === 2 || step === 3) && (
              <TouchableOpacity
                onPress={skipThisStep}
                activeOpacity={0.85}
                style={{
                  paddingVertical: 15,
                  paddingHorizontal: 20,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: theme.colors.tertiaryContainer,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: `${theme.colors.tertiaryContainer}80`,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.onTertiaryContainer,
                    fontWeight: "800",
                    fontSize: 14,
                  }}
                >
                  Skip
                </Text>
              </TouchableOpacity>
            )}

            {/* Next */}
            <TouchableOpacity
              onPress={next}
              disabled={!canGoNext}
              style={{
                flex: 1,
                paddingVertical: 15,
                borderRadius: 14,
                backgroundColor: canGoNext
                  ? theme.colors.primary
                  : theme.colors.surfaceVariant,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 6,
                shadowColor: canGoNext ? theme.colors.primary : "transparent",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
                elevation: canGoNext ? 6 : 0,
              }}
            >
              <Text
                style={{
                  color: canGoNext ? "#FFFFFF" : theme.colors.onSurfaceVariant,
                  fontWeight: "800",
                  fontSize: 15,
                }}
              >
                Continue
              </Text>
              <Feather
                name="chevron-right"
                size={16}
                color={canGoNext ? "#FFFFFF" : theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
