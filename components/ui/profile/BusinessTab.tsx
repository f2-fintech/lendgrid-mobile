import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Platform, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Menu, Text, TextInput, useTheme } from "react-native-paper";

/* ------------------------------------------
   BUSINESS TYPE CONSTANTS (unchanged UI)
------------------------------------------- */
const BUSINESS_TYPES = [
  {
    label: "PRIVATE LIMITED",
    value: "private_limited",
    icon: "office-building",
  },
  { label: "PUBLIC LIMITED", value: "public_limited", icon: "bank" },
  { label: "PROPRIETORSHIP", value: "proprietorship", icon: "account" },
  { label: "PARTNERSHIP", value: "partnership", icon: "account-group" },
  { label: "LLP", value: "llp", icon: "briefcase" },
];


const normalizeBusinessType = (value?: string) =>
  value ? value.toLowerCase() : "";

/* ------------------------------------------
   Get label from dropdown
------------------------------------------- */
const getLabel = (value?: string) =>
  BUSINESS_TYPES.find((b) => b.value === value)?.label || "";

export default function BusinessTab() {
  const theme = useTheme();
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuKey, setMenuKey] = useState(0);
  const [loadingPincode, setLoadingPincode] = useState(false);

  const pincode = watch("pincode");

  const businessTypeValue = normalizeBusinessType(watch("businessType"));

  /* ----------------- PINCODE LOOKUP MOCK ----------------- */
  const fetchLocationByPincode = async (pincode: string) => {
    await new Promise((res) => setTimeout(res, 400));

    const mock = {
      "110001": { city: "New Delhi", state: "Delhi" },
      "400001": { city: "Mumbai", state: "Maharashtra" },
      "560001": { city: "Bangalore", state: "Karnataka" },
    };

    return (
      mock[pincode] ||
      (pincode.length === 6
        ? { city: "Unknown City", state: "Unknown State" }
        : null)
    );
  };

  const handlePincodeBlur = async () => {
    if (!pincode || pincode.length !== 6) return;

    setLoadingPincode(true);
    const loc = await fetchLocationByPincode(pincode);
    setLoadingPincode(false);

    if (loc) {
      setValue("city", loc.city, { shouldValidate: true });
      setValue("state", loc.state, { shouldValidate: true });
    }
  };

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraScrollHeight={Platform.select({ ios: 0, android: 20 })}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {/* ---------------- HEADER ---------------- */}
      <Text
        variant="headlineSmall"
        style={{ fontWeight: "700", marginBottom: 6 }}
      >
        Business Details
      </Text>

      <Text
        variant="bodyMedium"
        style={{ marginBottom: 22, color: theme.colors.onSurfaceVariant }}
      >
        Provide official company and registered office information.
      </Text>

      {/* ---------------- COMPANY NAME ---------------- */}
      <Controller
        control={control}
        name="companyName"
        render={({ field }) => (
          <TextInput
            label="Registered Company Name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            mode="outlined"
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.companyName && (
        <Text
          style={{ color: theme.colors.error, marginBottom: 16, fontSize: 12 }}
        >
          {errors.companyName.message}
        </Text>
      )}

      {/* ---------------- BUSINESS TYPE (Dropdown) ---------------- */}
      <View style={{ marginBottom: 4 }}>
        <Controller
          control={control}
          name="businessType"
          render={({ field }) => (
            <Menu
              key={menuKey}
              visible={menuVisible}
              onDismiss={() => {
                setMenuVisible(false);
                setMenuKey((k) => k + 1);
              }}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                  <View pointerEvents="none">
                    <TextInput
                      label="Business Type"
                      mode="outlined"
                      value={getLabel(businessTypeValue)} // ⭐ FIXED
                      editable={false}
                      left={
                        <TextInput.Icon
                          icon={
                            BUSINESS_TYPES.find(
                              (t) => t.value === businessTypeValue
                            )?.icon || "domain"
                          }
                          component={MaterialCommunityIcons}
                        />
                      }
                      right={
                        <TextInput.Icon
                          icon={menuVisible ? "chevron-up" : "chevron-down"}
                        />
                      }
                    />
                  </View>
                </TouchableOpacity>
              }
            >
              {BUSINESS_TYPES.map((item) => (
                <Menu.Item
                  key={item.value}
                  onPress={() => {
                    field.onChange(item.value); // store lowercase
                    setMenuVisible(false);
                    setMenuKey((k) => k + 1);
                  }}
                  title={item.label}
                  leadingIcon={item.icon}
                />
              ))}
            </Menu>
          )}
        />
      </View>

      {errors.businessType && (
        <Text
          style={{ color: theme.colors.error, marginBottom: 16, fontSize: 12 }}
        >
          {errors.businessType.message}
        </Text>
      )}

      {/* ---------------- CIN NUMBER ---------------- */}
      <Controller
        control={control}
        name="cinNumber"
        render={({ field }) => (
          <TextInput
            label="CIN Number (Required for Pvt Ltd, Public Ltd, LLP)"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoCapitalize="characters"
            mode="outlined"
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.cinNumber && (
        <Text
          style={{ color: theme.colors.error, marginBottom: 16, fontSize: 12 }}
        >
          {errors.cinNumber.message}
        </Text>
      )}

      {/* ---------------- GST + PAN ---------------- */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        {/* GST */}
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="gstNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="GST Number"
                value={value}
                onChangeText={(text) => onChange(text.toUpperCase())}
                onBlur={onBlur}
                mode="outlined"
                autoCapitalize="characters"
                style={{ marginBottom: 4 }}
              />
            )}
          />
          {errors.gstNumber && (
            <Text
              style={{
                color: theme.colors.error,
                marginBottom: 16,
                fontSize: 12,
              }}
            >
              {errors.gstNumber.message}
            </Text>
          )}
        </View>

        {/* PAN */}
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="panNumber"
            render={({ field }) => (
              <TextInput
                label="PAN Number"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                autoCapitalize="characters"
                mode="outlined"
                style={{ marginBottom: 4 }}
              />
            )}
          />
          {errors.panNumber && (
            <Text
              style={{
                color: theme.colors.error,
                marginBottom: 16,
                fontSize: 12,
              }}
            >
              {errors.panNumber.message}
            </Text>
          )}
        </View>
      </View>

      {/* ---------------- TAN + PINCODE ---------------- */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        {/* TAN */}
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="tanNumber"
            render={({ field }) => (
              <TextInput
                label="TAN Number"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                autoCapitalize="characters"
                mode="outlined"
                style={{ marginBottom: 4 }}
              />
            )}
          />
          {errors.tanNumber && (
            <Text
              style={{
                color: theme.colors.error,
                marginBottom: 16,
                fontSize: 12,
              }}
            >
              {errors.tanNumber.message}
            </Text>
          )}
        </View>

        {/* PINCODE */}
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="pincode"
            render={({ field }) => (
              <TextInput
                label="Pincode"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={() => {
                  field.onBlur();
                  handlePincodeBlur();
                }}
                mode="outlined"
                keyboardType="number-pad"
                maxLength={6}
                loading={loadingPincode}
                style={{ marginBottom: 4 }}
              />
            )}
          />
          {errors.pincode && (
            <Text
              style={{
                color: theme.colors.error,
                marginBottom: 16,
                fontSize: 12,
              }}
            >
              {errors.pincode.message}
            </Text>
          )}
        </View>
      </View>

      {/* ---------------- CITY + STATE ---------------- */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        {/* CITY */}
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <TextInput
                label="City"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                editable={!loadingPincode}
                mode="outlined"
                style={{ marginBottom: 4 }}
              />
            )}
          />
          {errors.city && (
            <Text
              style={{
                color: theme.colors.error,
                marginBottom: 16,
                fontSize: 12,
              }}
            >
              {errors.city.message}
            </Text>
          )}
        </View>

        {/* STATE */}
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="state"
            render={({ field }) => (
              <TextInput
                label="State"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                editable={!loadingPincode}
                mode="outlined"
                style={{ marginBottom: 4 }}
              />
            )}
          />
          {errors.state && (
            <Text
              style={{
                color: theme.colors.error,
                marginBottom: 16,
                fontSize: 12,
              }}
            >
              {errors.state.message}
            </Text>
          )}
        </View>
      </View>

      {/* ---------------- REGISTERED ADDRESS ---------------- */}
      <Controller
        control={control}
        name="registeredAddress"
        render={({ field }) => (
          <TextInput
            label="Registered Address"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.registeredAddress && (
        <Text
          style={{ color: theme.colors.error, marginBottom: 16, fontSize: 12 }}
        >
          {errors.registeredAddress.message}
        </Text>
      )}

      {/* ---------------- WEBSITE URL ---------------- */}
      <Controller
        control={control}
        name="websiteUrl"
        render={({ field }) => (
          <TextInput
            label="Website URL"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            mode="outlined"
            keyboardType="url"
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.websiteUrl && (
        <Text
          style={{ color: theme.colors.error, marginBottom: 30, fontSize: 12 }}
        >
          {errors.websiteUrl.message}
        </Text>
      )}
    </KeyboardAwareScrollView>
  );
}
