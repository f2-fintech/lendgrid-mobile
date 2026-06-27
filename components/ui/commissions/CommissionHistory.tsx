// components/ui/commissions/CommissionHistory.tsx
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";

import * as LegacyFileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import * as Notifications from "expo-notifications";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { commissionsStyles } from "../../../styles/components/commissions/commissions.styles";
import { CommissionItem } from "./CommissionItem";

import { CommissionStatus } from "@/types/commissions";

interface CommissionHistoryProps {
  commissions: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  dateRange: string;
  setDateRange: (range: "7d" | "30d" | "90d" | "1y") => void;
  metrics: any;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
  total: number;
}

export const CommissionHistory = ({
  commissions,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  dateRange,
  setDateRange,
  metrics,
  formatCurrency,
  getStatusColor,
  getStatusIcon,
  total,
}: CommissionHistoryProps) => {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  const [exporting, setExporting] = useState(false);

  // Handle notification tap for opening exported files
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const fileUri = response.notification.request.content.data?.fileUri as
          | string
          | undefined;
        if (!fileUri) return;

        try {
          const mimeType = fileUri.endsWith(".pdf")
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

          if (Platform.OS === "android") {
            await IntentLauncher.startActivityAsync(
              "android.intent.action.VIEW",
              {
                data: fileUri,
                flags: 268435456,
                type: mimeType,
              },
            );
          } else {
            await Sharing.shareAsync(fileUri, {
              dialogTitle: `Open Commission Report`,
              mimeType,
            });
          }
        } catch (err) {
          console.log("Direct open failed, using share fallback", err);
          await Sharing.shareAsync(fileUri, {
            dialogTitle: `Open Commission Report`,
            mimeType: fileUri.endsWith(".pdf")
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
        }
      },
    );

    return () => subscription.remove();
  }, []);

  const showExportOptions = () => {
    if (commissions.length === 0) {
      Alert.alert("No Data", "There are no commission transactions to export.");
      return;
    }

    Alert.alert("Export Commission Report", "Choose your preferred format", [
      { text: "Export as Excel (.xlsx)", onPress: () => handleExport("xlsx") },
      { text: "Export as PDF", onPress: () => handleExport("pdf") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleExport = async (format: "xlsx" | "pdf") => {
    setExporting(true);
    try {
      let fileUri: string;
      let fileName: string;

      if (format === "xlsx") {
        fileUri = await exportToExcel();
        fileName = `Commission_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      } else {
        fileUri = await exportToPDF();
        fileName = `Commission_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Export Completed ✅",
          body: `${fileName} downloaded successfully`,
          data: { fileUri },
        },
        trigger: null,
      });
    } catch (err: any) {
      console.error("Export Error:", err);
      Alert.alert("Export Failed", err.message || "Something went wrong.");
    } finally {
      setExporting(false);
    }
  };

  // ==================== EXCEL EXPORT ====================
  const exportToExcel = async (): Promise<string> => {
    const XLSX = require("xlsx");

    const excelData = commissions.map((t, index) => ({
      "S.No": index + 1,
      "Ticket ID": `F2FIN-${t.applicationId}`,
      Lender: t.lenderName || "N/A",
      "Loan Type": t.loanType || "N/A",
      "Loan Amount (₹)": t.disbursedAmount,
      "Commission Rate (%)": t.commissionRate,
      "Commission Amount (₹)": t.commissionAmount,
      Status: t.status,
      "Calculated Date": t.disbursedDate,
      "Paid Date": t.paidDate || "-",
      UTR: t.utrNumber || "-",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wsSummary = XLSX.utils.json_to_sheet([
      {
        Metric: "Total Commission Earned",
        Value: formatCurrency(metrics.totalEarned),
      },
      { Metric: "Paid Amount", Value: formatCurrency(metrics.paidAmount) },
      {
        Metric: "Pending Amount",
        Value: formatCurrency(metrics.pendingAmount),
      },
      {
        Metric: "Average Commission Rate",
        Value: `${metrics.avgCommissionRate}%`,
      },
      { Metric: "Total Transactions", Value: total || commissions.length },
      { Metric: "Generated On", Value: new Date().toLocaleString("en-IN") },
    ]);

    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");

    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    const fileName = `Commission_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const uri = `${LegacyFileSystem.cacheDirectory}${fileName}`;

    await LegacyFileSystem.writeAsStringAsync(uri, wbout, {
      encoding: "base64" as any,
    });

    return uri;
  };

  // ==================== PDF EXPORT ====================
  const exportToPDF = async (): Promise<string> => {
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #0066cc; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #0066cc; color: white; }
          </style>
        </head>
        <body>
          <h1>Commission Report</h1>
          <p><strong>Generated:</strong> ${new Date().toLocaleString("en-IN")}</p>
          
          <h2>Summary</h2>
          <p><strong>Total Earned:</strong> ${formatCurrency(metrics.totalEarned)}</p>
          <p><strong>Paid:</strong> ${formatCurrency(metrics.paidAmount)}</p>
          <p><strong>Pending:</strong> ${formatCurrency(metrics.pendingAmount)}</p>
          <p><strong>Average Rate:</strong> ${metrics.avgCommissionRate}%</p>

          <h2>Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>S.No</th><th>Ticket ID</th><th>Lender</th><th>Loan Type</th>
                <th>Loan Amount</th><th>Rate</th><th>Commission</th><th>Status</th>
                <th>Calculated</th><th>Paid Date</th>
              </tr>
            </thead>
            <tbody>
              ${commissions
                .map(
                  (t, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>F2FIN-${t.applicationId}</td>
                  <td>${t.lenderName || "N/A"}</td>
                  <td>${t.loanType || "N/A"}</td>
                  <td>₹${t.disbursedAmount}</td>
                  <td>${t.commissionRate}%</td>
                  <td>₹${t.commissionAmount}</td>
                  <td>${t.status}</td>
                  <td>${t.disbursedDate}</td>
                  <td>${t.paidDate || "-"}</td>
                </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>`;

    const { uri: tempUri } = await Print.printToFileAsync({ html });
    const fileName = `Commission_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    const finalUri = `${LegacyFileSystem.cacheDirectory}${fileName}`;

    await LegacyFileSystem.copyAsync({ from: tempUri, to: finalUri });
    return finalUri;
  };

  // Status options with correct enum values for backend
  const statusOptions = [
    { value: "all", label: "All" },
    { value: CommissionStatus.PAID, label: "Paid" },
    { value: CommissionStatus.PENDING, label: "Pending" },
    { value: CommissionStatus.CALCULATED, label: "Calculated" },
    { value: CommissionStatus.APPROVED, label: "Approved" },
    { value: CommissionStatus.DISPUTED, label: "Disputed" },
  ];

  return (
    <View style={styles.contentCard}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View style={{ flexShrink: 1, maxWidth: "68%" }}>
          <Text style={styles.cardTitle}>Commission History</Text>
        </View>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 18,
            paddingVertical: 9,
            borderRadius: 999,
            borderWidth: 1.8,
            borderColor: theme.colors.primary,
            backgroundColor: exporting
              ? theme.colors.primary + "20"
              : "transparent",
          }}
          onPress={showExportOptions}
          disabled={exporting}
        >
          <MaterialIcons
            name="file-download"
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              fontWeight: "600",
              color: theme.colors.primary,
              fontSize: 14.5,
            }}
          >
            {exporting ? "Exporting..." : "Export"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={theme.colors.onSurfaceVariant}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Ticket ID or Lender..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Status Filters (Capsules) - Fixed with correct backend values */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {statusOptions.map(({ value, label }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.filterChip,
              filterStatus === value && {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => setFilterStatus(value)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterStatus === value && { color: "#fff" },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {commissions.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons
            name="search-off"
            size={48}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={styles.emptyStateText}>No commissions found</Text>
          <Text style={styles.emptyStateSubtext}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <FlashList
          data={commissions}
          renderItem={({ item }) => (
            <CommissionItem
              item={item}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          )}
          keyExtractor={(item) => item.id}
          estimatedItemSize={140}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};
