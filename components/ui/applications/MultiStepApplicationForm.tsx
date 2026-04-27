import { coreApi } from "@/apis/config/axiosConfig";
import {
  generateApplicationNumber,
  getPrettyError,
  normalizeString,
  uploadToS3,
} from "@/lib/utils/utils";
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

import HorizontalStepper, { StepConfig } from "./Verticalstepper";

import { Feather } from "@expo/vector-icons";
import Step0LoanDetails, { Step0Values } from "./steps/Step_0_LoanDetails";
import Step1BasicDetails, { Step1Values } from "./steps/Step_1_BasicDetails";
import Step2Statement, { PickedFile } from "./steps/Step_2_Statement";
import Step3IdProof, { Step3Values } from "./steps/Step_3_IdProof";
import Step4AdditionalDetails, {
  Step4Values,
} from "./steps/Step_4_AdditionalDetails";

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
  { id: "basic-details", title: "Basic Info", icon: "user" },
  { id: "statement", title: "Statement", icon: "file-text" },
  { id: "proof", title: "ID Proof", icon: "credit-card" },
  { id: "additional", title: "Additional", icon: "edit-3" },
];

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
    "#FFD700",
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
}: Props) {
  const theme = useTheme();

  const [applicationNo, setApplicationNo] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [skipped, setSkipped] = useState<Record<number, boolean>>({});
  const formScrollRef = useRef<ScrollView>(null);

  // Server-like state
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
        onSuccess?.();
        onClose();
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
  const [step0, setStep0] = useState<Step0Values>({
    loanAmount: "",
    loanType: "",
    loanCategory: "",
    tenure: "",
    selectedProviders: [],
    providerAmounts: [],
    hasRunningLoans: "no",
    whichLoan: "",
    runningLoanAmount: "",
    caseType: "fresh",
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

  const [step2Files, setStep2Files] = useState<PickedFile[]>([]);

  const [step3, setStep3] = useState<Step3Values>({
    aadharFront: null,
    aadharBack: null,
    pancard: null,
    passportPhoto: null,
  });

  const [step4, setStep4] = useState<Step4Values>({
    salary: "",
    existingEmi: "",
    existingLiability: "",
    certificates: [],
  });

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
      normalizeString(step1.father_name).length > 0 &&
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

  const step2HasAtLeastOneDoc = step2Files.length >= 1;

  const step2EffectiveValid = isStep2Skipped || step2HasAtLeastOneDoc;
  const step3EffectiveValid = !!step3.aadharFront && !!step3.pancard;

  useEffect(() => {
    if (skipped[2] && step2Files.length > 0) {
      setSkipped((prev) => {
        const next = { ...prev };
        delete next[2];
        return next;
      });
    }
  }, [skipped, step2Files.length]);

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
  }, [step0Valid, step1Valid, step2EffectiveValid, step3EffectiveValid]);

  const canGoNext = useMemo(() => {
    if (step === 0) return step0Valid;
    if (step === 1) return step1Valid;
    if (step === 2) return step2EffectiveValid;
    if (step === 3) return step3EffectiveValid;
    return true;
  }, [step, step0Valid, step1Valid, step2EffectiveValid, step3EffectiveValid]);

  const canSubmit = useMemo(
    () => step === 4 && step4Valid && !isSubmitting && !isUploading,
    [step, step4Valid, isSubmitting, isUploading],
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
  const createDocument = async (payload: {
    customer_id: string;
    document_url: string;
    type: string;
  }) => {
    await coreApi.post("/create-document", payload);
  };

  const updateCustomerInfo = async (payload: {
    customer_id: string;
    salary: string;
    existing_emi?: string;
    existing_liability?: string;
  }) => {
    await coreApi.patch("/customer-info-update", payload);
  };

  // ==================== INSTANT UPLOAD ====================
  const uploadFileInstantly = useCallback(
    async (file: PickedFile, docType: string) => {
      if (!customerId || !file?.uri) return;

      try {
        const url = await uploadToS3(file, `document/${file.name || docType}`);
        await createDocument({
          customer_id: customerId,
          document_url: url,
          type: docType,
        });
        console.log(`✅ Instant upload successful: ${docType} - ${file.name}`);
      } catch (err: any) {
        console.error(`❌ Instant upload failed for ${docType}:`, err);
      }
    },
    [customerId],
  );

  const randomFourDigit = 8462;
  const password = `${step1.name.replace(/\s/g, "")}@${randomFourDigit}`;

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
      setStage("Creating customer");

      // 1) create-customer
      const customerRes = await coreApi.post("/create-customer", {
        title: step1.title,
        name: `${step1.title} ${step1.name}`.trim(),
        email: step1.email,
        contact: step1.contact,
        dob: step1.dob,
        password,
        status: "active",
      });

      const newCustomerId =
        customerRes?.data?.data?.id ||
        customerRes?.data?.data?.customerId ||
        customerRes?.data?.id;

      if (!newCustomerId) throw new Error("CustomerId not returned from API");
      setCustomerId(String(newCustomerId));

      setStage("Creating customer info");

      // 2) create-customer-info
      await coreApi.post("/create-customer-info", {
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
      });

      // 3) create application per provider
      if (!step0.providerAmounts?.length) {
        throw new Error("No provider selected for application");
      }

      setStage("Creating applications");

      for (const pa of step0.providerAmounts) {
        const application_no = generateApplicationNumber();

        // Store the number to display in the success toast
        generatedNumbers.push(application_no);

        const appRes = await coreApi.post("/create-application", {
          application_no,
          customer_id: newCustomerId,
          provider: pa.provider,
          amount: pa.amount || step0.loanAmount,
          loan_type: step0.loanType,
          loan_category: step0.loanCategory,
          tenure: step0.tenure,
          has_running_loans: step0.hasRunningLoans,
          which_loan: step0.hasRunningLoans === "yes" ? step0.whichLoan : "",
          running_loan_amount:
            step0.hasRunningLoans === "yes" ? step0.runningLoanAmount : "",
          case_type: step0.caseType,
          application_date: new Date().toISOString(),
        });

        const applicationId =
          appRes?.data?.data?.applicationId ||
          appRes?.data?.data?.id ||
          appRes?.data?.id;

        if (applicationId) {
          try {
            await coreApi.post("/create-loan-tracking", {
              customer_application_id: applicationId,
              status: "submitted",
            });
          } catch (e) {
            console.warn("Tracking creation failed, continuing...", e);
          }
        }
      }

      // Update the state with the numbers (comma separated if multiple)
      setApplicationNo(generatedNumbers.join(", "));
      setSubmitStatus((p) => ({ ...p, applicationCreated: true }));

      // 4) Update salary if present
      if (step4?.salary) {
        try {
          await updateCustomerInfo({
            customer_id: String(newCustomerId),
            salary: step4.salary,
            existing_emi: step4.existingEmi || "",
            existing_liability: step4.existingLiability || "",
          });
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

      // Trigger the animation
      playSuccessToast();
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <HorizontalStepper
        steps={STEPS}
        currentStep={step}
        maxStepAllowed={maxStepAllowed}
        skippedSteps={skipped}
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
            borderRadius: 14,
            padding: 12,
            borderWidth: 1,
            borderColor: submitStatus.docUploadFailed ? "#EF4444" : "#22C55E",
            backgroundColor: submitStatus.docUploadFailed
              ? "rgba(239,68,68,0.08)"
              : "rgba(34,197,94,0.08)",
          }}
        >
          <Text
            style={{
              color: theme.colors.onSurface,
              fontWeight: "800",
              marginBottom: 4,
            }}
          >
            {submitStatus.docUploadFailed
              ? "Action Required"
              : submitStatus.docsUploaded
                ? "Success"
                : "Status"}
          </Text>

          {submitStatus.docUploadFailed && (
            <>
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 6,
                }}
              >
                ❌ Upload Failed (Application is created)
              </Text>
              {!!submitStatus.docUploadError && (
                <Text
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    lineHeight: 18,
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
                marginTop: 6,
                fontSize: 12,
              }}
            >
              {submitStatus.lastStage}
            </Text>
          )}

          {!!customerId && (
            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                marginTop: 6,
                fontSize: 12,
              }}
            >
              Customer ID: {customerId}
            </Text>
          )}
        </View>
      )}

      <ScrollView
        ref={formScrollRef}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
            onValidityChange={() => {}}
          />
        )}

        {step === 2 && (
          <Step2Statement
            value={step2Files}
            onChange={setStep2Files}
            maxFiles={10}
            customerId={customerId}
            onInstantUpload={uploadFileInstantly}
          />
        )}

        {step === 3 && (
          <Step3IdProof
            value={step3}
            onChange={setStep3}
            customerId={customerId}
            onInstantUpload={uploadFileInstantly}
          />
        )}

        {step === 4 && (
          <Step4AdditionalDetails
            value={step4}
            onChange={setStep4}
            onValidityChange={setStep4Valid}
            customerId={customerId}
            onInstantUpload={uploadFileInstantly}
          />
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
            backgroundColor: "rgba(0,0,0,0.6)",
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
              borderRadius: 24,
              paddingVertical: 40,
              paddingHorizontal: 32,
              width: "85%",
              maxWidth: 360,
              alignItems: "center",
              elevation: 20,
            }}
          >
            {/* Icon Section */}
            <Animated.View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#00C853",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
                transform: [{ scale: circleScale }],
              }}
            >
              <Animated.View
                style={{
                  position: "absolute",
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "#00C853",
                  opacity: 0.3,
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
                <Feather name="check" size={48} color="#FFFFFF" />
              </Animated.View>
            </Animated.View>

            <Text
              style={{
                color: theme.colors.onSurface,
                fontWeight: "900",
                fontSize: 22,
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              Application Submitted!
            </Text>

            {/* --- NEW APPLICATION NUMBER SECTION --- */}
            {applicationNo && (
              <View
                style={{
                  backgroundColor: theme.colors.secondaryContainer,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  marginBottom: 16,
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.onSecondaryContainer,
                    fontWeight: "700",
                    fontSize: 13,
                    letterSpacing: 1,
                  }}
                >
                  Application Number is: {applicationNo}
                </Text>
              </View>
            )}
            {/* --------------------------------------- */}

            <Text
              style={{
                color: theme.colors.onSurfaceVariant,
                fontSize: 14,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Your loan application has been successfully submitted for
              processing.
            </Text>

            <View
              style={{
                marginTop: 24,
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.colors.primary,
              }}
            />
          </Animated.View>
        </Animated.View>
      )}

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          flexDirection: "row",
          gap: 12,
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outlineVariant,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <TouchableOpacity
          onPress={back}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: theme.colors.outline,
            alignItems: "center",
            backgroundColor: theme.colors.surface,
          }}
        >
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
          <TouchableOpacity
            onPress={submit}
            disabled={!canSubmit}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: canSubmit
                ? theme.colors.primary
                : theme.colors.surfaceVariant,
              alignItems: "center",
              shadowColor: canSubmit ? theme.colors.primary : "transparent",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: canSubmit ? 4 : 0,
            }}
          >
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
                  ? "Uploading Docs..."
                  : "Submitting..."
                : "Submit Application"}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            {step === 2 && (
              <TouchableOpacity
                onPress={skipThisStep}
                activeOpacity={0.85}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: theme.colors.tertiaryContainer,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.colors.tertiaryContainer,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.onTertiaryContainer,
                    fontWeight: "900",
                    fontSize: 15,
                  }}
                >
                  Skip
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={next}
              disabled={!canGoNext}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: canGoNext
                  ? theme.colors.primary
                  : theme.colors.surfaceVariant,
                alignItems: "center",
                shadowColor: canGoNext ? theme.colors.primary : "transparent",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: canGoNext ? 4 : 0,
              }}
            >
              <Text
                style={{
                  color: canGoNext ? "#FFFFFF" : theme.colors.onSurfaceVariant,
                  fontWeight: "800",
                  fontSize: 15,
                }}
              >
                Go Next
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
