// app/(tab)/profile.tsx

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

import { updateField } from "@/redux/features/profileSlice";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

import BankingTab from "@/components/ui/profile/BankingTab";
import BusinessTab from "@/components/ui/profile/BusinessTab";
import KYCTab from "@/components/ui/profile/KYCTab";
import ProfileTab from "@/components/ui/profile/ProfileTab";

import { MasterProfileSchema } from "@/Validation/ProfileMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";

export default function ProfileScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const s = useSelector((state: RootState) => state.profile);

  const [activeTab, setActiveTab] = useState("profile");

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

  // SAVE handler
  const onSave = (values: any) => {
    console.log("🔥 FULL MASTER SUBMIT:", values);

    for (const [key, value] of Object.entries(values)) {
      dispatch(updateField({ key: key as any, value }));
    }

    console.log("🟢 Saved to Redux");
  };

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
