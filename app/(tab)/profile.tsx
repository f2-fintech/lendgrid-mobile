// app/(tab)/profile.tsx

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

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

import { useAggregatorDetails } from "@/hooks/useAggregator";
import { useProfile } from "@/hooks/useAuth";

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

  // ---------------- FETCH AUTH PROFILE ----------------
  const { data: user, isLoading: loadingUser } = useProfile();
  const profileId = user?.profileId;

  // ---------------- FETCH AGGREGATOR PROFILE ----------------
  const { data: aggProfile, isLoading: loadingAgg } = useAggregatorDetails(
    profileId ?? ""
  );

  // ---------------- REACT-HOOK-FORM ----------------
  const methods = useForm({
    resolver: yupResolver(MasterProfileSchema),
    defaultValues: {
      ...s,
      documents: { ...s.documents },
    },
    shouldUnregister: false,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  // ---------------- MAP BACKEND DATA → FORM + REDUX ----------------
  useEffect(() => {
    if (aggProfile) {
      console.log("🟢 Aggregator Profile Loaded:", aggProfile);

      // Extract first + last from user.username
      const { firstName, lastName } = splitName(aggProfile.user?.username);

      // 1️⃣ Update Redux store
      Object.entries(aggProfile).forEach(([key, value]) => {
        dispatch(updateField({ key: key as any, value }));
      });

      // Add user-level fields to Redux
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

      //  Inject into form
      methods.reset({
        ...aggProfile,

        email: aggProfile.user?.email || "",
        phone: aggProfile.user?.contact || "",
        status: aggProfile.user?.status || "ACTIVE",

        firstName,
        lastName,
      });
    }
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
  const onSave = (values: any) => {
    console.log(" FULL MASTER SUBMIT:", values);

    for (const [key, value] of Object.entries(values)) {
      dispatch(updateField({ key: key as any, value }));
    }

    console.log(" Saved to Redux");
  };

  // ---------------- TAB RENDER ----------------
  const renderTab = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab />;
      case "business":
        return <BusinessTab />;
      case "banking":
        return <BankingTab />;
      case "kyc":
        return <KYCTab />;
    }
  };

  // ---------------- UI (UNCHANGED) ----------------
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

          <Button
            mode="contained"
            icon="content-save"
            onPress={methods.handleSubmit(onSave)}
            style={{
              borderRadius: 10,
              paddingHorizontal: 16,
              height: 44,
              justifyContent: "center",
              backgroundColor: theme.colors.primary,
            }}
            labelStyle={{ fontSize: 15, fontWeight: "600", color: "white" }}
          >
            Save
          </Button>
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
    </FormProvider>
  );
}
