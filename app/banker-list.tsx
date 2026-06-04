import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Platform,
  StatusBar,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createBankerStyles } from "../styles/components/bankerStyles";
import type {
  BankerCardItem,
  BankerDirectoryBankOption,
  BankerDirectoryFilterResponse,
  BankerDirectoryRow,
  DsaCodeDetails,
  SearchStage,
  StateCityMeta,
} from "../types/banker-list";

// ── DSA codes per bank (F2 Fintech codes) ────

const DSA_CODES: Record<string, DsaCodeDetails> = {
  "Aditya Birla Capital": { code: "ABC0000007988", type: "Un-Secured" },
  "Aditya Birla Housing Fin. Ltd.": { code: "DAA113034298", type: "Secured" },
  "Axis Bank": { code: "C170000164", type: "Cards" },
  "Bajaj Finserv": { code: "10007067", type: "Un-Secured" },
  "Bajaj Housing Finance Ltd.": { code: "191934", type: "Secured" },
  Cholamandalam: { code: "219647", type: "Un-Secured" },
  "Credit Saisan PL/BL": { code: "BLGMU0456", type: "Un-Secured" },
  Godrej: { code: "DSNATDEL1114", type: "Un-Secured" },
  "Godrej LAP": { code: "DSNATDEL1114", type: "Secured" },
  "HDFC Bank": { code: "680037", type: "Un-Secured/Secured" },
  "HDFC Credila": { code: "E2405070004", type: "Un-Secured" },
  "Sammaan Capital": { code: "DBA43170", type: "Secured" },
  "Karur Vaishya Bank": { code: "DSARDE0063", type: "Un-Secured" },
  "L & T Finance": { code: "DSA_F2FPL", type: "Secured" },
  "Lending Cart": { code: "DSA8000", type: "Un-Secured" },
  "No Broker": { code: "1758883692661", type: "Secured" },
  "Paisa Bazar": { code: "PB08521552918", type: "Secured" },
  "Piramal Finance": { code: "P04E961PNS", type: "Secured" },
  "PNB Cards & Services": { code: "PCSLSDA10316", type: "Secured" },
  Poonawala: { code: "PUPO0084", type: "Un-Secured/Secured" },
  "Ratnakar Bank Ltd": { code: "DSAF2FIN", type: "Secured" },
  "Shriram Finance": { code: "CPPDSDL020", type: "Un-Secured" },
  "Tata Capital": { code: "8097953", type: "Un-Secured" },
  "Tata Capital Housing Fin. Ltd.": { code: "8162787", type: "Secured" },
  "UCO Bank": { code: "VO202602071197", type: "Secured" },
  Incred: { code: "6973582275961093P", type: "Un-Secured" },
  Finnable: { code: "N/A", type: "Un-Secured" },
};

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const getSafeEnvString = (value: unknown) =>
  typeof value === "string" ? value.trim().replace(/\/$/, "") : "";

const extra = (Constants.expoConfig?.extra ??
  (Constants.manifest as any)?.extra) as Record<string, unknown> | undefined;

const BANKER_DIRECTORY_URL = getSafeEnvString(extra?.BANKER_DIRECTORY_URL);
const BANKER_ASSOCIATED_BANKS_URL = getSafeEnvString(
  extra?.BANKER_ASSOCIATED_BANKS_URL,
);
const BANKER_STATE_CITY_URL = getSafeEnvString(extra?.BANKER_STATE_CITY_URL);

const SPEC_COLORS: Record<string, string> = {
  "Home Loan": "#3B82F6",
  "Home Loans": "#3B82F6",
  "Business Loan": "#10B981",
  "Business Loans": "#10B981",
  "Personal Loan": "#F59E0B",
  "Personal Loans": "#F59E0B",
  "MSME Loan": "#8B5CF6",
  "MSME Loans": "#8B5CF6",
  "Auto Loan": "#EF4444",
  "Auto Loans": "#EF4444",
};

const BANK_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  "HDFC Bank": { bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74" },
  "ICICI Bank": { bg: "#FFF1F2", text: "#BE123C", border: "#FDA4AF" },
  SBI: { bg: "#EFF6FF", text: "#1D4ED8", border: "#93C5FD" },
  "Axis Bank": { bg: "#F0FDF4", text: "#15803D", border: "#86EFAC" },
  "Tata Capital": { bg: "#EEF2FF", text: "#4338CA", border: "#A5B4FC" },
  "Aditya Birla": { bg: "#FDF4FF", text: "#7E22CE", border: "#D8B4FE" },
  "Bajaj Finserv": { bg: "#ECFDF5", text: "#065F46", border: "#6EE7B7" },
  "Kotak Mahindra": { bg: "#FFFBEB", text: "#B45309", border: "#FCD34D" },
  "Yes Bank": { bg: "#F0FDFA", text: "#0F766E", border: "#5EEAD4" },
  "Punjab National": { bg: "#F5F3FF", text: "#6D28D9", border: "#C4B5FD" },
};

const normalizeBankNameForDsaLookup = (name: string) =>
  name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

const getDsaCodeDetailsForBank = (bank: string): DsaCodeDetails => {
  if (!bank) {
    return { code: "N/A", type: "Unknown" };
  }

  if (DSA_CODES[bank]) {
    return DSA_CODES[bank];
  }

  const normalizedBank = normalizeBankNameForDsaLookup(bank);

  for (const [key, details] of Object.entries(DSA_CODES)) {
    if (normalizeBankNameForDsaLookup(key) === normalizedBank) {
      return details;
    }
  }

  for (const [key, details] of Object.entries(DSA_CODES)) {
    const normalizedKey = normalizeBankNameForDsaLookup(key);
    if (
      normalizedBank.includes(normalizedKey) ||
      normalizedKey.includes(normalizedBank)
    ) {
      return details;
    }
  }

  return { code: "N/A", type: "Unknown" };
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const copyToClipboard = async (text: string) => {
  await Clipboard.setStringAsync(text);

  if (Platform.OS === "android") {
    ToastAndroid.show("Copied!", ToastAndroid.SHORT);
  } else {
    Alert.alert("Copied", `"${text}" copied to clipboard.`);
  }
};

const uniqueSorted = (values: string[]) =>
  [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b),
  );

const fetchBankerDirectoryJson = async <T,>(url: string): Promise<T> => {
  if (!url) {
    throw new Error(
      "Banker directory configuration is missing. Please check your EXPO_PUBLIC_BANKER_DIRECTORY_URL / EXPO_PUBLIC_BANKER_ASSOCIATED_BANKS_URL / EXPO_PUBLIC_BANKER_STATE_CITY_URL values.",
    );
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

const fetchAssociatedBankOptions = async () => {
  const banks = await fetchBankerDirectoryJson<BankerDirectoryBankOption[]>(
    BANKER_ASSOCIATED_BANKS_URL,
  );

  return uniqueSorted(
    Array.isArray(banks)
      ? banks
          .map((bank) => (typeof bank?.name === "string" ? bank.name : ""))
          .filter(Boolean)
      : [],
  );
};

const fetchStateCityMeta = async (): Promise<StateCityMeta> => {
  const meta = await fetchBankerDirectoryJson<Partial<StateCityMeta>>(
    BANKER_STATE_CITY_URL,
  );
  const stateCityMap =
    meta?.stateCityMap && typeof meta.stateCityMap === "object"
      ? meta.stateCityMap
      : {};
  const states = uniqueSorted(
    Array.isArray(meta?.states)
      ? meta.states.filter(
          (state): state is string => typeof state === "string",
        )
      : Object.keys(stateCityMap),
  );

  return {
    states,
    stateCityMap: Object.fromEntries(
      Object.entries(stateCityMap).map(([state, cities]) => [
        state,
        uniqueSorted(Array.isArray(cities) ? cities : []),
      ]),
    ),
  };
};

const firstText = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value.find((item) => item.trim().length > 0)?.trim() ?? "";
  }

  return typeof value === "string" ? value.trim() : "";
};

const normalizeProductName = (product: string) =>
  product.toLowerCase().endsWith("loan") ? product : product || "Loan";

const toBankerCardItem = (
  banker: BankerDirectoryRow,
  selectedBank: string,
  selectedState: string,
  selectedCity: string,
): BankerCardItem => {
  const email = banker.emailOfficial?.trim() || banker.emailPersonal?.trim();
  const product = firstText(banker.product);

  return {
    id: banker._id ?? `${banker.bankerName}-${banker.contact}`,
    name: banker.bankerName?.trim() || "Banker",
    state: firstText(banker.state) || selectedState,
    city: firstText(banker.city) || selectedCity,
    email: email || "",
    phone: banker.contact?.trim() || "",
    specialization: normalizeProductName(product),
    bank: banker.associatedWith?.trim() || selectedBank,
  };
};

const fetchFilteredBankers = async ({
  bank,
  state,
  city,
}: {
  bank: string;
  state: string;
  city: string;
}) => {
  const params = new URLSearchParams({
    associatedWith: bank,
    state,
    city,
  });
  const response =
    await fetchBankerDirectoryJson<BankerDirectoryFilterResponse>(
      `${BANKER_DIRECTORY_URL}/filter?${params.toString()}`,
    );

  return Array.isArray(response?.data) ? response.data : [];
};

// ─────────────────────────────────────────────
// SELECTION SCREEN — full screen list
// ─────────────────────────────────────────────

type SelectionScreenProps = {
  stage: "bank" | "state" | "city";
  items: string[];
  onSelect: (item: string) => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  selectedBank?: string | null;
  selectedState?: string | null;
  styles: ReturnType<typeof createBankerStyles>;
};

function SelectionScreen({
  stage,
  items,
  onSelect,
  onBack,
  styles,
  isLoading = false,
  error,
  onRetry,
  selectedBank,
  selectedState,
}: SelectionScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery("");
  }, [stage]);

  const filtered = useMemo(
    () => items.filter((i) => i.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  const title =
    stage === "bank"
      ? "Select a Bank"
      : stage === "state"
        ? `States for ${selectedBank}`
        : `Cities in ${selectedState}`;

  const subtitle =
    stage === "bank"
      ? "Choose your preferred lending partner"
      : stage === "state"
        ? "Select the state"
        : "Select the city";

  const icon =
    stage === "bank"
      ? "bank-outline"
      : stage === "state"
        ? "home-city-outline"
        : "map-marker-outline";

  const iconColor =
    stage === "bank" ? "#6D28D9" : stage === "state" ? "#3B82F6" : "#10B981";

  const iconBg =
    stage === "bank" ? "#F5F3FF" : stage === "state" ? "#EFF6FF" : "#ECFDF5";

  return (
    <View style={[styles.selectionRoot, { paddingBottom: insets.bottom }]}>
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={styles.selHeader}>
        {stage !== "bank" && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.selTitle}>{title}</Text>
          <Text style={styles.selSubtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.selIconBox, { backgroundColor: iconBg }]}>
          <MaterialCommunityIcons
            name={icon as any}
            size={22}
            color={iconColor}
          />
        </View>
      </View>

      {/* Search */}
      <View style={styles.selSearchWrap}>
        <MaterialCommunityIcons
          name="magnify"
          size={18}
          color={theme.colors.onSurfaceVariant}
        />
        <TextInput
          style={styles.selSearchInput}
          placeholder={`Search ${stage}…`}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="words"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <MaterialCommunityIcons
              name="close-circle"
              size={17}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Count */}
      <View style={styles.selCountRow}>
        <Text style={styles.selCountText}>
          {isLoading
            ? "Loading options..."
            : `${filtered.length} ${stage}${filtered.length !== 1 ? "s" : ""} available`}
        </Text>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.selectionStateBox}>
          <ActivityIndicator size="small" color={iconColor} />
          <Text style={styles.selectionStateText}>
            Fetching directory options
          </Text>
        </View>
      ) : error ? (
        <View style={styles.selectionStateBox}>
          <MaterialCommunityIcons
            name="cloud-alert-outline"
            size={34}
            color={theme.colors.error}
          />
          <Text style={styles.selectionStateTitle}>Unable to load options</Text>
          <Text style={styles.selectionStateText}>{error}</Text>
          {!!onRetry && (
            <TouchableOpacity
              style={styles.selectionRetryBtn}
              onPress={onRetry}
            >
              <MaterialCommunityIcons name="refresh" size={15} color="#fff" />
              <Text style={styles.selectionRetryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.selListContent,
            { paddingBottom: 32 + insets.bottom },
          ]}
          renderItem={({ item }) => {
            const bc = stage === "bank" ? BANK_COLORS[item] : null;
            return (
              <TouchableOpacity
                style={styles.selItem}
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.selItemIcon, { backgroundColor: iconBg }]}>
                  <MaterialCommunityIcons
                    name={icon as any}
                    size={16}
                    color={iconColor}
                  />
                </View>
                <Text style={styles.selItemLabel}>{item}</Text>
                {bc && (
                  <View
                    style={[
                      styles.selBankBadge,
                      { backgroundColor: bc.bg, borderColor: bc.border },
                    ]}
                  >
                    <Text style={[styles.selBankBadgeText, { color: bc.text }]}>
                      {item.split(" ")[0]}
                    </Text>
                  </View>
                )}
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={18}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.selSep} />}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// DSA CODE CARD
// ─────────────────────────────────────────────

function DsaCodeCard({
  bank,
  styles,
}: {
  bank: string;
  styles: ReturnType<typeof createBankerStyles>;
}) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const { code, type } = getDsaCodeDetailsForBank(bank);
  const bc = BANK_COLORS[bank];

  return (
    <View style={styles.dsaCard}>
      <TouchableOpacity
        style={styles.dsaHeader}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
      >
        <View style={styles.dsaHeaderLeft}>
          <MaterialCommunityIcons
            name="shield-key-outline"
            size={18}
            color={theme.colors.primary}
          />
          <Text style={styles.dsaHeaderText}>DSA Code — F2 Fintech</Text>
        </View>
        <View style={styles.dsaHeaderRight}>
          <Text style={styles.dsaSeeText}>
            {expanded ? "Hide code" : "See code"}
          </Text>
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.colors.primary}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.dsaBody}>
          <View style={styles.dsaRow}>
            <View style={styles.dsaLabelRow}>
              <MaterialCommunityIcons
                name="bank-outline"
                size={13}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={styles.dsaLabel}>Bank</Text>
            </View>
            <Text
              style={[
                styles.dsaBankName,
                { color: bc?.text ?? theme.colors.onSurface },
              ]}
            >
              {bank}
            </Text>
          </View>

          <View style={styles.dsaDivider} />

          <View style={styles.dsaRow}>
            <View style={styles.dsaLabelRow}>
              <MaterialCommunityIcons
                name="identifier"
                size={13}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={styles.dsaLabel}>DSA Code</Text>
            </View>
            <View style={styles.dsaCodeRow}>
              <Text style={styles.dsaCodeText}>{code}</Text>
              <TouchableOpacity
                style={styles.dsaCopyBtn}
                onPress={() => copyToClipboard(code)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons
                  name="content-copy"
                  size={14}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dsaDivider} />

          <View style={styles.dsaRow}>
            <View style={styles.dsaLabelRow}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={13}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={styles.dsaLabel}>Code Type</Text>
            </View>
            <Text style={styles.dsaPartner}>{type}</Text>
          </View>

          <View style={styles.dsaDivider} />

          <View style={styles.dsaRow}>
            <View style={styles.dsaLabelRow}>
              <MaterialCommunityIcons
                name="office-building-outline"
                size={13}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={styles.dsaLabel}>DSA Partner</Text>
            </View>
            <Text style={styles.dsaPartner}>F2 Fintech Pvt. Ltd.</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function BankerListScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = useMemo(() => createBankerStyles(theme), [theme]);

  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [searchStage, setSearchStage] = useState<SearchStage>("bank");
  const [bankOptions, setBankOptions] = useState<string[]>([]);
  const [stateCityMeta, setStateCityMeta] = useState<StateCityMeta>({
    states: [],
    stateCityMap: {},
  });
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [directoryError, setDirectoryError] = useState<string | null>(null);
  const [bankers, setBankers] = useState<BankerCardItem[]>([]);
  const [bankersLoading, setBankersLoading] = useState(false);
  const [bankersError, setBankersError] = useState<string | null>(null);

  const loadDirectoryOptions = useCallback(async () => {
    setDirectoryLoading(true);
    setDirectoryError(null);

    try {
      const [banks, meta] = await Promise.all([
        fetchAssociatedBankOptions(),
        fetchStateCityMeta(),
      ]);

      setBankOptions(banks);
      setStateCityMeta(meta);
    } catch (error: any) {
      console.error("[BankerList] failed to load directory options", error);
      setDirectoryError(
        error?.message || "Please check your connection and try again.",
      );
    } finally {
      setDirectoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDirectoryOptions();
  }, [loadDirectoryOptions]);

  // ── Derived lists ─────────────────────────
  const loadFilteredBankers = useCallback(async () => {
    if (!selectedBank || !selectedState || !selectedCity) return;

    setBankersLoading(true);
    setBankersError(null);

    try {
      const rows = await fetchFilteredBankers({
        bank: selectedBank,
        state: selectedState,
        city: selectedCity,
      });

      setBankers(
        rows.map((banker) =>
          toBankerCardItem(banker, selectedBank, selectedState, selectedCity),
        ),
      );
    } catch (error: any) {
      console.error("[BankerList] failed to load filtered bankers", error);
      setBankers([]);
      setBankersError(
        error?.message || "Please check your connection and try again.",
      );
    } finally {
      setBankersLoading(false);
    }
  }, [selectedBank, selectedState, selectedCity]);

  useEffect(() => {
    if (searchStage === "done") {
      loadFilteredBankers();
    }
  }, [loadFilteredBankers, searchStage]);

  const allBanks = useMemo(() => bankOptions, [bankOptions]);

  const statesForBank = useMemo(() => {
    if (!selectedBank) return [];

    return stateCityMeta.states.filter(
      (state) => (stateCityMeta.stateCityMap[state] ?? []).length > 0,
    );
  }, [selectedBank, stateCityMeta]);

  const citiesForBankState = useMemo(() => {
    if (!selectedBank || !selectedState) return [];

    return stateCityMeta.stateCityMap[selectedState] ?? [];
  }, [selectedBank, selectedState, stateCityMeta]);

  // ── Filtered bankers — only shown when all 3 are selected ──
  const filteredBankers = bankers;

  // ── Handlers ─────────────────────────────
  const handleSelectBank = (bank: string) => {
    setSelectedBank(bank);
    setSelectedState(null);
    setSelectedCity(null);
    setBankers([]);
    setBankersError(null);
    setSearchStage("state");
  };

  const handleSelectState = (state: string) => {
    setSelectedState(state);
    setSelectedCity(null);
    setBankers([]);
    setBankersError(null);
    setSearchStage("city");
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setBankers([]);
    setBankersError(null);
    setSearchStage("done");
  };

  const handleReset = () => {
    setSelectedBank(null);
    setSelectedState(null);
    setSelectedCity(null);
    setBankers([]);
    setBankersError(null);
    setSearchStage("bank");
  };

  const handleBack = () => {
    if (searchStage === "city") {
      setSelectedState(null);
      setSearchStage("state");
    } else if (searchStage === "state") {
      setSelectedBank(null);
      setSearchStage("bank");
    }
  };

  const handleCall = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(console.error);
  };
  const handleEmail = (email: string) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(console.error);
  };

  // ── Full-screen selection ─────────────────
  if (
    searchStage === "bank" ||
    searchStage === "state" ||
    searchStage === "city"
  ) {
    const items =
      searchStage === "bank"
        ? allBanks
        : searchStage === "state"
          ? statesForBank
          : citiesForBankState;

    return (
      <SelectionScreen
        stage={searchStage}
        items={items}
        isLoading={directoryLoading}
        error={directoryError}
        onRetry={loadDirectoryOptions}
        onSelect={
          searchStage === "bank"
            ? handleSelectBank
            : searchStage === "state"
              ? handleSelectState
              : handleSelectCity
        }
        onBack={handleBack}
        selectedBank={selectedBank}
        selectedState={selectedState}
        styles={styles}
      />
    );
  }

  // ── Results view (all 3 selected) ────────
  const renderBankerCard = ({ item }: { item: BankerCardItem }) => {
    const color = SPEC_COLORS[item.specialization] ?? "#6B7280";
    const bankColor = BANK_COLORS[item.bank];
    return (
      <View style={styles.card}>
        <View style={[styles.cardStripe, { backgroundColor: color }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <View style={[styles.avatar, { backgroundColor: color + "20" }]}>
              <Text style={[styles.avatarLetter, { color }]}>
                {item.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.bankerName}>{item.name}</Text>
              <View style={styles.locationRow}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={12}
                  color="#94A3B8"
                />
                <Text style={styles.locationText}>
                  {item.city}, {item.state}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: color }]}
              onPress={() => handleCall(item.phone)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="phone" size={17} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.emailRow}>
            <View style={styles.emailPill}>
              <MaterialCommunityIcons
                name="email-outline"
                size={13}
                color="#64748B"
              />
              <Text style={styles.emailAddress} numberOfLines={1}>
                {item.email || "No email available"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.emailIconBtn}
              onPress={() => item.email && copyToClipboard(item.email)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name="content-copy"
                size={15}
                color="#94A3B8"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.emailIconBtn, styles.emailSendBtn]}
              onPress={() => handleEmail(item.email)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name="send-outline"
                size={15}
                color={color}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.chipsRow}>
            <View style={[styles.specChip, { backgroundColor: color + "15" }]}>
              <View style={[styles.specDot, { backgroundColor: color }]} />
              <Text style={[styles.specLabel, { color }]}>
                {item.specialization}
              </Text>
            </View>
            <View
              style={[
                styles.bankChip,
                {
                  backgroundColor: bankColor?.bg ?? "#F1F5F9",
                  borderColor: bankColor?.border ?? "#E2E8F0",
                },
              ]}
            >
              <MaterialCommunityIcons
                name="bank-outline"
                size={11}
                color={bankColor?.text ?? "#64748B"}
              />
              <Text
                style={[
                  styles.bankLabel,
                  { color: bankColor?.text ?? "#64748B" },
                ]}
              >
                {item.bank}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.root,
        {
          paddingBottom: insets.bottom || 0,
        },
      ]}
    >
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* ── Page Header ── */}
      <View style={styles.pageHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Bankers</Text>
          <Text style={styles.pageSubtitle} numberOfLines={1}>
            {selectedBank} · {selectedState} · {selectedCity}
          </Text>
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <MaterialCommunityIcons name="refresh" size={15} color="#3B82F6" />
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBankers}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 32 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {/* ── Breadcrumb pills ── */}
            <View style={styles.breadcrumbRow}>
              <TouchableOpacity
                style={[styles.pill, styles.pillBank]}
                onPress={() => {
                  setSelectedBank(null);
                  setSelectedState(null);
                  setSelectedCity(null);
                  setSearchStage("bank");
                }}
              >
                <MaterialCommunityIcons
                  name="bank-outline"
                  size={12}
                  color="#6D28D9"
                />
                <Text style={[styles.pillText, { color: "#6D28D9" }]}>
                  {selectedBank}
                </Text>
              </TouchableOpacity>
              <MaterialCommunityIcons
                name="chevron-right"
                size={13}
                color="#CBD5E1"
              />
              <TouchableOpacity
                style={styles.pill}
                onPress={() => {
                  setSelectedState(null);
                  setSelectedCity(null);
                  setSearchStage("state");
                }}
              >
                <MaterialCommunityIcons
                  name="home-city-outline"
                  size={12}
                  color="#3B82F6"
                />
                <Text style={styles.pillText}>{selectedState}</Text>
              </TouchableOpacity>
              <MaterialCommunityIcons
                name="chevron-right"
                size={13}
                color="#CBD5E1"
              />
              <TouchableOpacity
                style={[styles.pill, styles.pillCity]}
                onPress={() => {
                  setSelectedCity(null);
                  setSearchStage("city");
                }}
              >
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={12}
                  color="#10B981"
                />
                <Text style={[styles.pillText, { color: "#10B981" }]}>
                  {selectedCity}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── DSA Code Card ── */}
            <DsaCodeCard bank={selectedBank!} styles={styles} />

            {/* ── Results header ── */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsLocation}>{selectedCity}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {bankersLoading
                    ? "Loading..."
                    : `${filteredBankers.length} banker${filteredBankers.length !== 1 ? "s" : ""}`}
                </Text>
              </View>
            </View>
          </>
        }
        renderItem={renderBankerCard}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          bankersLoading ? (
            <View style={styles.emptyBox}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.emptyTitle}>Loading bankers</Text>
              <Text style={styles.emptySub}>Fetching matching banker list</Text>
            </View>
          ) : bankersError ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="cloud-alert-outline"
                  size={36}
                  color={theme.colors.error}
                />
              </View>
              <Text style={styles.emptyTitle}>Unable to load bankers</Text>
              <Text style={styles.emptySub}>{bankersError}</Text>
              <TouchableOpacity
                style={styles.selectionRetryBtn}
                onPress={loadFilteredBankers}
              >
                <MaterialCommunityIcons name="refresh" size={15} color="#fff" />
                <Text style={styles.selectionRetryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="account-search-outline"
                  size={36}
                  color={theme.colors.onSurfaceVariant}
                />
              </View>
              <Text style={styles.emptyTitle}>No bankers found</Text>
              <Text style={styles.emptySub}>
                No {selectedBank} bankers in {selectedCity}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
