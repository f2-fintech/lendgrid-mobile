import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Snackbar, Text, useTheme } from "react-native-paper";

import { updateField } from "@/redux/features/profileSlice";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

import BankingTab from "@/components/ui/profile/BankingTab";
import BusinessTab from "@/components/ui/profile/BusinessTab";
import KYCTab from "@/components/ui/profile/KYCTab";
import ProfileTab from "@/components/ui/profile/ProfileTab";

import { MasterProfileSchema } from "@/lib/validators/ProfileMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";

import {
  useAggregatorDetails,
  useUpdateAggregator,
} from "@/hooks/useAggregator";
import { useProfile, useUpdateUser } from "@/hooks/useAuth";

function splitName(fullName?: string) {
  if (!fullName) return { firstName: "", lastName: "" };
  const parts = fullName.trim().split(" ");
  const firstName = parts.shift() ?? "";
  const lastName = parts.join(" ");
  return { firstName, lastName };
}

export default function ProfileScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const s = useSelector((state: RootState) => state.profile);

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditMode, setIsEditMode] = useState(false);

  // Snackbar
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const showSnack = (msg: string) => {
    setSnackMsg(msg);
    setSnackVisible(true);
  };

  // ---------------- FETCH AUTH PROFILE ----------------
  const { data: user, isLoading: loadingUser } = useProfile();
  const profileId = user?.profileId;

  // ---------------- FETCH AGGREGATOR PROFILE ----------------
  const { data: aggProfile, isLoading: loadingAgg } = useAggregatorDetails(
    profileId ?? ""
  );

  // ---------------- UPDATE MUTATION ----------------
  const updateAgg = useUpdateAggregator();
  const updateUser = useUpdateUser();

  // -------- helpers: backend url <-> RHF file object --------
  const urlToFile = (v: any) => {
    if (!v) return null;
    if (typeof v === "string") return { uri: v }; // backend URL
    if (typeof v?.uri === "string") return v; // already { uri }
    return null;
  };

  const normalizeDocsFromBackend = (docs: any) => ({
    aadhaarFront: urlToFile(docs?.aadhaarFront),
    aadhaarBack: urlToFile(docs?.aadhaarBack),
    panCard: urlToFile(docs?.panCard),
    gstCertificate: urlToFile(docs?.gstCertificate),
    incorporationCertificate: urlToFile(docs?.incorporationCertificate),
    bankStatement: urlToFile(docs?.bankStatement),
    cancelledCheque: urlToFile(docs?.cancelledCheque),
    addressProof: urlToFile(docs?.addressProof),
    authorizedSignatory: urlToFile(docs?.authorizedSignatory),
  });

  const toDocUrl = (f: any) => {
    if (!f) return null;
    if (typeof f === "string") return f; 
    if (typeof f?.uri === "string") return f.uri; 
    return null;
  };

  // ---------------- REACT-HOOK-FORM ----------------
  const methods = useForm({
    resolver: yupResolver(MasterProfileSchema),
    defaultValues: {
      ...s,
      aadhaarNumber: (s as any)?.aadhaarNumber || "",
      documents: {
        aadhaarFront: s.documents?.aadhaarFront || null,
        aadhaarBack: s.documents?.aadhaarBack || null,
        panCard: s.documents?.panCard || null,
        gstCertificate: s.documents?.gstCertificate || null,
        incorporationCertificate: s.documents?.incorporationCertificate || null,
        bankStatement: s.documents?.bankStatement || null,
        cancelledCheque: s.documents?.cancelledCheque || null,
        addressProof: s.documents?.addressProof || null,
        authorizedSignatory: s.documents?.authorizedSignatory || null,
      },
    },
    shouldUnregister: false,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const formContextValue = useMemo(() => {
    return {
      isEditMode,
      activeTab,
    };
  }, [isEditMode, activeTab]);

  // ---------------- MAP BACKEND DATA → FORM + REDUX ----------------
  useEffect(() => {
    if (!aggProfile) return;

    const { firstName, lastName } = splitName(aggProfile.user?.username);

    //normalize docs for RHF (backend gives string URLs)
    const normalizedDocs = normalizeDocsFromBackend(aggProfile.documents);

    // redux update
    Object.entries(aggProfile).forEach(([key, value]) => {
      dispatch(updateField({ key: key as any, value }));
    });

    dispatch(
      updateField({ key: "email", value: aggProfile.user?.email || "" })
    );
    dispatch(
      updateField({ key: "phone", value: aggProfile.user?.contact || "" })
    );
    dispatch(
      updateField({
        key: "status",
        value: aggProfile.user?.status || "ACTIVE",
      })
    );
    dispatch(updateField({ key: "firstName", value: firstName }));
    dispatch(updateField({ key: "lastName", value: lastName }));

    // reset RHF values including aadhaarNumber + docs
    methods.reset({
      ...aggProfile,

      aadhaarNumber: aggProfile.aadhaarNumber || "",

      documents: normalizedDocs,

      email: aggProfile.user?.email || "",
      phone: aggProfile.user?.contact || "",
      status: aggProfile.user?.status || "ACTIVE",
      firstName,
      lastName,
    });
  }, [aggProfile]);

  // ---------------- LOADING STATES ----------------
  if (loadingUser || loadingAgg) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading your profile…</Text>
      </View>
    );
  }

  if (!profileId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No aggregator profile found.</Text>
      </View>
    );
  }

  // ---------------- SAVE HANDLER ----------------
  const onSave = async (values: any) => {
    try {
      //  update USER (profile tab)
      const username = `${values.firstName || ""} ${
        values.lastName || ""
      }`.trim();

      if (user?._id) {
        await updateUser.mutateAsync({
          id: user._id,
          username,
          contact: values.phone,
          photoUrl: values.avatar?.uri || null,
        });
      }

      // update AGGREGATOR
      const normalizedDocuments = {
        aadhaarFront: toDocUrl(values.documents?.aadhaarFront),
        aadhaarBack: toDocUrl(values.documents?.aadhaarBack),
        panCard: toDocUrl(values.documents?.panCard),
        gstCertificate: toDocUrl(values.documents?.gstCertificate),
        incorporationCertificate: toDocUrl(
          values.documents?.incorporationCertificate
        ),
        bankStatement: toDocUrl(values.documents?.bankStatement),
        cancelledCheque: toDocUrl(values.documents?.cancelledCheque),
        addressProof: toDocUrl(values.documents?.addressProof),
        authorizedSignatory: toDocUrl(values.documents?.authorizedSignatory),
      };

      await updateAgg.mutateAsync({
        id: aggProfile?._id,

        // Business
        companyName: values.companyName,
        businessType: values.businessType,
        registeredAddress: values.registeredAddress,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        gstNumber: values.gstNumber,
        panNumber: values.panNumber,
        tanNumber: values.tanNumber,
        cinNumber: values.cinNumber,
        websiteUrl: values.websiteUrl,
        pocName: values.pocName,

        aadhaarNumber: values.aadhaarNumber,

        // Documents
        documents: normalizedDocuments,

        // Banking
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        ifscCode: values.ifscCode,
        accountHolderName: values.accountHolderName,
        isBankVerified: values.isBankVerified,

        // KYC & metrics
        kycStatus: values.kycStatus,
        kycRejectionReason: values.kycRejectionReason,
        totalApplicationsSubmitted: values.totalApplicationsSubmitted,
        totalApplicationsDisbursed: values.totalApplicationsDisbursed,
        totalCommissionEarned: values.totalCommissionEarned,
        totalPaidOut: values.totalPaidOut,
        pendingPayout: values.pendingPayout,
      });

      setIsEditMode(false);
      showSnack("Profile updated successfully");
    } catch (e: any) {
      showSnack(e?.message || "Failed to update profile");
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab uiState={formContextValue} />;
      case "business":
        return <BusinessTab uiState={formContextValue} />;
      case "banking":
        return <BankingTab uiState={formContextValue} />;
      case "kyc":
        return <KYCTab uiState={formContextValue} />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* HEADER */}
        <View
          style={{
            marginBottom: 30,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexShrink: 1 }}>
            <Text
              variant="headlineLarge"
              style={{ fontWeight: "700", marginBottom: 4 }}
            >
              Settings
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Manage your account.
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            {/* EDIT/CANCEL BUTTON */}
            <TouchableOpacity
              onPress={() => setIsEditMode((p) => !p)}
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: isEditMode
                  ? theme.colors.errorContainer
                  : theme.colors.primaryContainer,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: isEditMode
                    ? theme.colors.onErrorContainer
                    : theme.colors.onPrimaryContainer,
                }}
              >
                {isEditMode ? "Cancel" : "Edit"}
              </Text>
            </TouchableOpacity>

            {/* SAVE BUTTON */}
            {isEditMode && (
              <TouchableOpacity
                onPress={() =>
                  methods.handleSubmit(onSave, () => {
                    showSnack(
                      "Please fill all the required details correctly."
                    );
                  })()
                }
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: theme.colors.primary,
                }}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "500", color: "white" }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* TABS */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: 10,
            paddingVertical: 4,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outline,
          }}
        >
          {[
            { key: "profile", label: "Profile", icon: "person-circle-outline" },
            { key: "business", label: "Business", icon: "briefcase-outline" },
            { key: "banking", label: "Banking", icon: "business-outline" },
            { key: "kyc", label: "KYC", icon: "shield-checkmark-outline" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{ alignItems: "center", width: 70, paddingVertical: 2 }}
            >
              <Ionicons
                name={tab.icon as any}
                size={23}
                color={
                  activeTab === tab.key
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant
                }
              />

              <Text
                style={{
                  marginTop: 3,
                  fontSize: 13,
                  fontWeight: activeTab === tab.key ? "700" : "500",
                  color:
                    activeTab === tab.key
                      ? theme.colors.primary
                      : theme.colors.onSurface,
                }}
              >
                {tab.label}
              </Text>

              {activeTab === tab.key && (
                <View
                  style={{
                    marginTop: 4,
                    height: 2,
                    width: "100%",
                    backgroundColor: theme.colors.primary,
                    borderRadius: 10,
                  }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View key={activeTab}>{renderTab()}</View>
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Snackbar */}
      <View
        style={{
          position: "absolute",
          top: 25,
          left: 0,
          right: 0,
          alignItems: "center",
          zIndex: 999,
        }}
      >
        <Snackbar
          visible={snackVisible}
          onDismiss={() => setSnackVisible(false)}
          duration={2200}
          style={{ backgroundColor: theme.colors.primary }}
        >
          {snackMsg}
        </Snackbar>
      </View>
    </FormProvider>
  );
}
