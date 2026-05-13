import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
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

const firstDefined = (...values: any[]) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const getOmsProfileValues = (claims: any, storedUser: any) => {
  const username = firstDefined(
    claims?.username,
    claims?.name,
    claims?.fullName,
    claims?.user?.username,
    claims?.user?.name,
    claims?.data?.username,
    storedUser?.username,
    storedUser?.name,
  );
  const { firstName, lastName } = splitName(username);

  return {
    firstName: firstDefined(claims?.firstName, claims?.first_name, firstName),
    lastName: firstDefined(claims?.lastName, claims?.last_name, lastName),
    email: firstDefined(
      claims?.email,
      claims?.user?.email,
      claims?.data?.email,
      storedUser?.email,
    ),
    phone: String(
      firstDefined(
        claims?.contact,
        claims?.phone,
        claims?.mobile,
        claims?.user?.contact,
        claims?.user?.phone,
        claims?.data?.contact,
        storedUser?.contact,
        storedUser?.phone,
        "",
      ),
    ),
    status: String(
      firstDefined(
        claims?.status,
        claims?.user?.status,
        claims?.data?.status,
        storedUser?.status,
        "ACTIVE",
      ),
    ).toUpperCase(),
    avatar: null,
  };
};

export default function ProfileScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const s = useSelector((state: RootState) => state.profile);

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditMode, setIsEditMode] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [isOmsStaff, setIsOmsStaff] = useState(false);

  // Snackbar
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const showSnack = (msg: string) => {
    setSnackMsg(msg);
    setSnackVisible(true);
  };

  // ---------------- FETCH AUTH PROFILE ----------------
  const { data: user, isLoading: loadingUser } = useProfile(
    authLoaded && !isOmsStaff,
  );
  const profileId = user?.profileId;

  // ---------------- FETCH AGGREGATOR PROFILE ----------------
  const { data: aggProfile, isLoading: loadingAgg } = useAggregatorDetails(
    !isOmsStaff ? (profileId ?? "") : "",
  );

  // ---------------- UPDATE MUTATION ----------------
  const updateAgg = useUpdateAggregator();
  const updateUser = useUpdateUser();

  // -------- helpers: backend url <-> RHF file object --------
  const urlToFile = (v: any) => {
    if (!v) return null;
    if (typeof v === "string") return { uri: v };
    if (typeof v?.uri === "string") return v;
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
    // authorizedSignatory: urlToFile(docs?.authorizedSignatory),
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
      avatar: null,
      documents: {
        aadhaarFront: s.documents?.aadhaarFront || null,
        aadhaarBack: s.documents?.aadhaarBack || null,
        panCard: s.documents?.panCard || null,
        gstCertificate: s.documents?.gstCertificate || null,
        incorporationCertificate: s.documents?.incorporationCertificate || null,
        bankStatement: s.documents?.bankStatement || null,
        cancelledCheque: s.documents?.cancelledCheque || null,
        addressProof: s.documents?.addressProof || null,
        // authorizedSignatory: s.documents?.authorizedSignatory || null,
      },
    },
    shouldUnregister: false,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const formContextValue = useMemo(() => {
    return { isEditMode, activeTab };
  }, [isEditMode, activeTab]);

  useEffect(() => {
    let mounted = true;

    const loadOmsProfile = async () => {
      const [storedUserType, storedAuthSource, storedToken, storedUser] =
        await Promise.all([
          AsyncStorage.getItem("userType"),
          AsyncStorage.getItem("authSource"),
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("user"),
        ]);

      const claims = decodeJwt(storedToken);
      const role = String(claims?.role || "").toLowerCase();
      const isStaff =
        storedAuthSource === "oms" &&
        (storedUserType === "sales" || role === "sales");

      if (!mounted) return;

      setIsOmsStaff(isStaff);
      if (isStaff) {
        let parsedUser = null;
        try {
          parsedUser = storedUser ? JSON.parse(storedUser) : null;
        } catch {
          parsedUser = null;
        }
        methods.reset({
          ...methods.getValues(),
          ...getOmsProfileValues(claims, parsedUser),
        });
        setActiveTab("profile");
        setIsEditMode(false);
      }
      setAuthLoaded(true);
    };

    loadOmsProfile();

    return () => {
      mounted = false;
    };
  }, [methods]);

  // ---------------- MAP BACKEND DATA → FORM + REDUX ----------------
  useEffect(() => {
    if (isOmsStaff || !aggProfile) return;

    const { firstName, lastName } = splitName(aggProfile.user?.username);
    const normalizedDocs = normalizeDocsFromBackend(aggProfile.documents);

    Object.entries(aggProfile).forEach(([key, value]) => {
      dispatch(updateField({ key: key as any, value }));
    });

    dispatch(
      updateField({ key: "email", value: aggProfile.user?.email || "" }),
    );
    dispatch(
      updateField({ key: "phone", value: aggProfile.user?.contact || "" }),
    );
    dispatch(
      updateField({
        key: "status",
        value: aggProfile.user?.status || "ACTIVE",
      }),
    );
    dispatch(updateField({ key: "firstName", value: firstName }));
    dispatch(updateField({ key: "lastName", value: lastName }));

    const avatarFromBackend = urlToFile(aggProfile.user?.photoUrl);

    const currentAvatar = methods.getValues("avatar");
    const avatarToUse = currentAvatar?.uri ? currentAvatar : avatarFromBackend;

    methods.reset({
      ...aggProfile,
      aadhaarNumber: aggProfile.aadhaarNumber || "",
      documents: normalizedDocs,
      email: aggProfile.user?.email || "",
      phone: aggProfile.user?.contact || "",
      status: aggProfile.user?.status || "ACTIVE",
      firstName,
      lastName,
      avatar: avatarToUse,
    });
  }, [aggProfile, dispatch, isOmsStaff, methods]);

  // ---------------- LOADING STATES ----------------
  if (!authLoaded || (!isOmsStaff && (loadingUser || loadingAgg))) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.onSurfaceVariant }}>
          Loading your profile...
        </Text>
      </View>
    );
  }

  if (!isOmsStaff && !profileId) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <Text style={{ color: theme.colors.onSurface }}>
          No aggregator profile found.
        </Text>
      </View>
    );
  }

  // ---------------- SAVE HANDLER ----------------
  const onSave = async (values: any) => {
    try {
      const username =
        `${values.firstName || ""} ${values.lastName || ""}`.trim();

      const photoUrl = values.avatar?.uri || null;

      if (user?._id) {
        await updateUser.mutateAsync({
          id: user._id,
          username,
          contact: values.phone,
          photoUrl,
        });
      }

      const normalizedDocuments = {
        aadhaarFront: toDocUrl(values.documents?.aadhaarFront),
        aadhaarBack: toDocUrl(values.documents?.aadhaarBack),
        panCard: toDocUrl(values.documents?.panCard),
        gstCertificate: toDocUrl(values.documents?.gstCertificate),
        incorporationCertificate: toDocUrl(
          values.documents?.incorporationCertificate,
        ),
        bankStatement: toDocUrl(values.documents?.bankStatement),
        cancelledCheque: toDocUrl(values.documents?.cancelledCheque),
        addressProof: toDocUrl(values.documents?.addressProof),
        // authorizedSignatory: toDocUrl(values.documents?.authorizedSignatory),
      };

      await updateAgg.mutateAsync({
        id: aggProfile?._id,

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

        documents: normalizedDocuments,

        bankName: values.bankName,
        accountNumber: values.accountNumber,
        ifscCode: values.ifscCode,
        accountHolderName: values.accountHolderName,
        isBankVerified: values.isBankVerified,

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
    if (isOmsStaff) {
      return <ProfileTab uiState={formContextValue} onSnack={showSnack} />;
    }

    switch (activeTab) {
      case "profile":
        return <ProfileTab uiState={formContextValue} onSnack={showSnack} />;
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

          {!isOmsStaff && (
            <View style={{ flexDirection: "row", gap: 8 }}>
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

              {isEditMode && (
                <TouchableOpacity
                  onPress={() =>
                    methods.handleSubmit(onSave, () =>
                      showSnack(
                        "Please fill all the required details correctly.",
                      ),
                    )()
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
          )}
        </View>

        {!isOmsStaff && (
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
              {
                key: "profile",
                label: "Profile",
                icon: "person-circle-outline",
              },
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
        )}

        <View>{renderTab()}</View>
        <View style={{ height: 60 }} />
      </ScrollView>

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
