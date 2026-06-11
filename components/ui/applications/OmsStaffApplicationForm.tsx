import { coreApi, restApi } from "@/apis/config/axiosConfig";
import { generateApplicationNumber, getPrettyError } from "@/lib/utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { Buffer } from "buffer";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "react-native-paper";
import HorizontalStepper, { StepConfig } from "./Verticalstepper";
import Step0LoanDetails, { Step0Values } from "./steps/Step_0_LoanDetails";
import Step1BasicDetails, { Step1Values } from "./steps/Step_1_BasicDetails";

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
};

const STEPS: StepConfig[] = [
  {
    id: "loan-details",
    title: "Loan Details",
    iconLib: "fa5",
    icon: "rupee-sign",
  },
  {
    id: "basic-info",
    title: "Customer Info",
    iconLib: "feather",
    icon: "user",
  },
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
      "[OmsStaffApplicationForm] recovered companyId from token",
      stringValue,
      decoded,
    );
    return stringValue;
  }

  console.warn(
    "[OmsStaffApplicationForm] companyId missing from AsyncStorage and token claims",
    decoded,
  );
  return null;
};

const INITIAL_STEP0: Step0Values = {
  loanAmount: "",
  loanType: "",
  loanCategory: "",
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
};

const INITIAL_STEP1: Step1Values = {
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
};

type CompanyOption = {
  id: number;
  companyId: number | string;
  name: string;
};

export default function OmsStaffApplicationForm({ onClose, onSuccess }: Props) {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [step0, setStep0] = useState<Step0Values>(INITIAL_STEP0);
  const [step1, setStep1] = useState<Step1Values>(INITIAL_STEP1);
  const [step0Valid, setStep0Valid] = useState(false);
  const [step1Valid, setStep1Valid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [applicationNo, setApplicationNo] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(
    null,
  );

  const maxStepAllowed = useMemo(() => {
    if (step0Valid) return 1;
    return 0;
  }, [step0Valid]);

  const canGoNext = useMemo(() => {
    if (step === 0) return step0Valid;
    return true;
  }, [step, step0Valid]);

  const canSubmit = useMemo(() => {
    return step === 1 && step1Valid && !isSubmitting;
  }, [step, step1Valid, isSubmitting]);

  useEffect(() => {
    if (step === 0) setSubmitError(null);
  }, [step]);

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
            companyId:
              item.companyId ?? item.company_id ?? item.companyId ?? item.id,
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
        "[OmsStaffApplicationForm] failed to load companies",
        error,
      );
    }
  }, []);

  useEffect(() => {
    loadCompanies();

    (async () => {
      const savedCompanyId = await AsyncStorage.getItem("selectedCompanyId");
      const savedCompany = await AsyncStorage.getItem("selectedAggregatorId");
      if (savedCompanyId) {
        setSelectedCompanyId(savedCompanyId);
      } else {
        const storedCompanyId = await AsyncStorage.getItem("companyId");
        if (storedCompanyId) setSelectedCompanyId(storedCompanyId);
      }
      if (savedCompany) {
        const parsedId = Number(savedCompany);
        if (!Number.isNaN(parsedId)) {
          setSelectedCompany({
            id: parsedId,
            companyId:
              savedCompanyId || (await AsyncStorage.getItem("companyId")) || "",
            name: "",
          });
        }
      }
    })();
  }, [loadCompanies]);

  useEffect(() => {
    if (!companies.length || !selectedCompanyId) return;
    const match = companies.find(
      (company) =>
        String(company.companyId) === selectedCompanyId ||
        String(company.id) === selectedCompanyId,
    );
    if (match) {
      setSelectedCompany(match);
    }
  }, [companies, selectedCompanyId]);

  const next = useCallback(() => {
    if (!canGoNext) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }, [canGoNext]);

  const back = useCallback(() => {
    if (step === 0) {
      onClose();
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  }, [onClose, step]);

  const submit = useCallback(async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setStatusMessage("Creating application...");

    try {
      const storedCompanyId = await getCompanyId();
      const token = await AsyncStorage.getItem("token");
      const decoded = decodeJwt(token);
      const appliedByUserId = extractUserIdFromClaims(decoded);
      const useCompanyId = selectedCompany?.companyId ?? storedCompanyId;
      const useCompanyIdString = useCompanyId ? String(useCompanyId) : "";
      const appliedByNumber =
        appliedByUserId !== undefined && appliedByUserId !== null
          ? Number(appliedByUserId)
          : undefined;

      if (!useCompanyIdString) {
        throw new Error(
          "Please select an aggregator before submitting the application.",
        );
      }

      if (appliedByNumber === undefined || !Number.isFinite(appliedByNumber)) {
        throw new Error("Unable to identify OMS staff user for application.");
      }

      const requestConfig = {
        headers: {
          companyid: useCompanyIdString,
        },
      };

      await AsyncStorage.setItem("companyId", useCompanyIdString);
      if (selectedCompany?.id) {
        await AsyncStorage.setItem(
          "selectedAggregatorId",
          String(selectedCompany.id),
        );
      }

      const customerPayload = {
        title: step1.title,
        name: `${step1.title} ${step1.name}`.trim(),
        email: step1.email,
        contact: step1.contact,
        dob: step1.dob,
        password: `${step1.name.replace(/\s/g, "")}@${Math.floor(1000 + Math.random() * 9000)}`,
        status: "active",
        company_id: Number(useCompanyIdString),
        ...(selectedCompany?.id ? { aggregator_id: selectedCompany.id } : {}),
      };
      console.log("[OmsStaffApplicationForm] create-customer payload", {
        selectedCompany,
        companyId: useCompanyIdString,
        appliedBy: appliedByNumber,
        customerPayload,
      });
      const customerRes = await coreApi.post(
        "/create-customer",
        customerPayload,
        requestConfig,
      );

      const newCustomerId =
        customerRes?.data?.data?.id ||
        customerRes?.data?.data?.customerId ||
        customerRes?.data?.id;

      if (!newCustomerId) {
        throw new Error("Customer ID not returned from API");
      }

      setStatusMessage("Saving customer details...");
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
        },
        requestConfig,
      );

      const providerAmount =
        step0.providerAmounts.length > 0
          ? step0.providerAmounts[0]
          : {
              provider: step0.selectedProviders[0] ?? "",
              amount: step0.loanAmount,
            };

      if (!providerAmount?.provider) {
        throw new Error("Please select a lender/provider.");
      }

      const applicationNoValue = generateApplicationNumber();
      setStatusMessage("Submitting application...");

      const applicationPayload = {
        application_no: applicationNoValue,
        customer_id: newCustomerId,
        provider: providerAmount.provider,
        amount: providerAmount.amount || step0.loanAmount,
        loan_type: step0.loanType,
        loan_category: step0.loanCategory,
        tenure: step0.tenure,
        has_running_loans: step0.existingLoans?.[0]?.hasRunningLoans || "no",
        which_loan:
          step0.existingLoans?.[0]?.hasRunningLoans === "yes"
            ? step0.existingLoans[0].whichLoan || ""
            : "",
        running_loan_amount:
          step0.existingLoans?.[0]?.hasRunningLoans === "yes" &&
          step0.existingLoans[0].loanAmount
            ? step0.existingLoans[0].loanAmount
            : "",
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
        case_type: step0.caseType,
        application_date: new Date().toISOString(),
        company_id: Number(useCompanyIdString),
        applied_by: appliedByNumber,
        source: "oms",
        is_picked: 0,
        ...(selectedCompany?.id ? { aggregator_id: selectedCompany.id } : {}),
      };

      console.log("[OmsStaffApplicationForm] create-application payload", {
        selectedCompany,
        companyId: useCompanyIdString,
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
        setStatusMessage("Recording application tracking...");
        await coreApi.post(
          "/create-loan-tracking",
          {
            customer_application_id: applicationId,
            status: "submitted",
            company_id: Number(useCompanyIdString),
          },
          requestConfig,
        );
      }

      setApplicationNo(applicationNoValue);
      setStatusMessage("Application created successfully.");
      queryClient.invalidateQueries({ queryKey: ["customer-applications"] });

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 800);
    } catch (err: any) {
      console.error(
        "❌ OmsStaff submit error:",
        err?.response?.data || err?.message || err,
      );
      setSubmitError(getPrettyError(err));
      setStatusMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canSubmit,
    onClose,
    onSuccess,
    queryClient,
    selectedCompany,
    step0,
    step1,
  ]);

  const renderFooter = () => (
    <View
      style={{
        marginTop: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <TouchableOpacity
        onPress={back}
        style={{
          flex: 1,
          padding: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          backgroundColor: theme.colors.surface,
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.colors.onSurface, fontWeight: "700" }}>
          {step === 0 ? "Cancel" : "Back"}
        </Text>
      </TouchableOpacity>

      {step < STEPS.length - 1 ? (
        <TouchableOpacity
          onPress={next}
          disabled={!canGoNext}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 14,
            backgroundColor: canGoNext
              ? theme.colors.primary
              : theme.colors.onSurfaceVariant,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: theme.colors.onPrimary,
              fontWeight: "700",
            }}
          >
            Next
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={submit}
          disabled={!canSubmit}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 14,
            backgroundColor: canSubmit
              ? theme.colors.primary
              : theme.colors.onSurfaceVariant,
            alignItems: "center",
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text
              style={{
                color: theme.colors.onPrimary,
                fontWeight: "700",
              }}
            >
              Submit
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <HorizontalStepper
        steps={STEPS}
        currentStep={step}
        maxStepAllowed={maxStepAllowed}
        onStepPress={(index) => {
          if (index <= step) setStep(index);
        }}
      />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            color: theme.colors.onSurface,
            fontSize: 16,
            fontWeight: "700",
            marginBottom: 14,
          }}
        >
          OMS Staff Application
        </Text>

        {step === 0 && (
          <Step0LoanDetails
            value={step0}
            onChange={setStep0}
            onValidityChange={setStep0Valid}
          />
        )}

        {step === 1 && (
          <Step1BasicDetails
            value={step1}
            onChange={setStep1}
            onValidityChange={setStep1Valid}
          />
        )}

        {!!submitError && (
          <View
            style={{
              marginTop: 20,
              padding: 14,
              borderRadius: 14,
              backgroundColor: "rgba(239,68,68,0.1)",
              borderWidth: 1,
              borderColor: "#EF4444",
            }}
          >
            <Text style={{ color: "#B91C1C", fontWeight: "700" }}>
              Submission failed
            </Text>
            <Text style={{ color: "#B91C1C", marginTop: 8 }}>
              {submitError}
            </Text>
          </View>
        )}

        {!!statusMessage && (
          <View
            style={{
              marginTop: 20,
              padding: 14,
              borderRadius: 14,
              backgroundColor: "rgba(34,197,94,0.1)",
              borderWidth: 1,
              borderColor: "#22C55E",
            }}
          >
            <Text style={{ color: "#166534", fontWeight: "700" }}>
              {statusMessage}
            </Text>
            {!!applicationNo && (
              <Text style={{ color: "#166534", marginTop: 8 }}>
                Application No: {applicationNo}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={{ padding: 20 }}>{renderFooter()}</View>
    </KeyboardAvoidingView>
  );
}
