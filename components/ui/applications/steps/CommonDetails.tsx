import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useTheme } from "react-native-paper";

type Props = {
  label?: string;
  value?: string; // selected state name
  placeholder?: string;
  error?: string;
  onSelect: (stateName: string) => void;
  onTouched?: () => void; // mark touched in parent
};

const INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export default function IndianStatePicker({
  label = "State*",
  value,
  placeholder = "Search and select state",
  error,
  onSelect,
  onTouched,
}: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return INDIAN_STATES_AND_UTS;
    return INDIAN_STATES_AND_UTS.filter((s) => s.toLowerCase().includes(query));
  }, [q]);

  return (
    <View style={{ marginBottom: 16 }}>
      {/* label */}
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: theme.colors.onSurface,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>

      {/* picker row */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          onTouched?.();
          setOpen(true);
        }}
        style={{
          padding: 14,
          borderWidth: 1.5,
          borderColor: error ? "#EF4444" : theme.colors.outline,
          borderRadius: 12,
          backgroundColor: theme.colors.surface,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Feather
          name="map-pin"
          size={18}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          style={{
            flex: 1,
            color: value
              ? theme.colors.onSurface
              : theme.colors.onSurfaceVariant,
            fontSize: 15,
            fontWeight: "600",
          }}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>

        <Feather
          name="chevron-down"
          size={18}
          color={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>

      {!!error && (
        <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>
          {error}
        </Text>
      )}

      <Modal visible={open} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          {/* ✅ fixed-height bottom sheet */}
          <View
            style={{
              height: "75%", // ✅ fixed sheet height (stable)
              // OR use minHeight: "75%" if you want it to grow (but stable best is height)
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
            }}
          >
            {/* ✅ make inside layout fixed */}
            <View style={{ flex: 1 }}>
              {/* header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.onSurface,
                    fontWeight: "900",
                    fontSize: 16,
                  }}
                >
                  Select State / UT
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setOpen(false);
                    setQ("");
                  }}
                  style={{ padding: 6 }}
                >
                  <Feather name="x" size={20} color={theme.colors.onSurface} />
                </TouchableOpacity>
              </View>

              {/* search */}
              <View
                style={{
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1.2,
                  borderColor: theme.colors.outline,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  backgroundColor: theme.colors.surfaceVariant,
                }}
              >
                <Feather
                  name="search"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <TextInput
                  value={q}
                  onChangeText={setQ}
                  placeholder="Search state..."
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    color: theme.colors.onSurface,
                    fontSize: 14,
                  }}
                />
                {!!q && (
                  <TouchableOpacity
                    onPress={() => setQ("")}
                    style={{ padding: 6 }}
                  >
                    <Feather
                      name="x-circle"
                      size={18}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* ✅ list area must take remaining space always */}
              <View style={{ flex: 1, marginTop: 12 }}>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{
                    paddingBottom: 24, // little space below
                  }}
                >
                  {filtered.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => {
                        onSelect(s);
                        setOpen(false);
                        setQ("");
                      }}
                      style={{
                        paddingVertical: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.outlineVariant,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.onSurface,
                          fontWeight: "700",
                        }}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {filtered.length === 0 && (
                    <View style={{ paddingVertical: 20 }}>
                      <Text style={{ color: theme.colors.onSurfaceVariant }}>
                        No state found.
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
