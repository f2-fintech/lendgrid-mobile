import { useState } from "react";
import { SafeAreaView, ScrollView, StatusBar } from "react-native";

import { CommissionHeader } from "../../components/ui/commissions/CommissionHeader";
import { CommissionHistory } from "../../components/ui/commissions/CommissionHistory";
import { CommissionMetrics } from "../../components/ui/commissions/CommissionMetrics";
import { CommissionTabs } from "../../components/ui/commissions/CommissionTabs";
import { CommissionTrends } from "../../components/ui/commissions/CommissionTrends";
import { LenderBreakdown } from "../../components/ui/commissions/LenderBreakdown";
import { commissionsStyles } from "../../styles/components/commissions/commissions.styles";

// Mock data (can be moved to separate file if needed)
const mockData = {
  metrics: {
    totalEarned: 485000,
    pendingAmount: 125000,
    paidAmount: 360000,
    avgCommissionRate: 4.2,
  },
  commissionTrends: [
    { month: "Jan", earned: 35000, paid: 32000, pending: 3000 },
    { month: "Feb", earned: 42000, paid: 38000, pending: 4000 },
    { month: "Mar", earned: 58000, paid: 52000, pending: 6000 },
    { month: "Apr", earned: 45000, paid: 41000, pending: 4000 },
    { month: "May", earned: 68000, paid: 62000, pending: 6000 },
    { month: "Jun", earned: 75000, paid: 68000, pending: 7000 },
  ],
  lenderWiseCommission: [
    {
      name: "HDFC Bank",
      commission: 125000,
      percentage: 25.8,
      color: "#FFD700",
    },
    {
      name: "ICICI Bank",
      commission: 98000,
      percentage: 20.2,
      color: "#007AFF",
    },
    {
      name: "Bajaj Finance",
      commission: 87000,
      percentage: 17.9,
      color: "#22c55e",
    },
    {
      name: "Axis Bank",
      commission: 76000,
      percentage: 15.7,
      color: "#f97316",
    },
    { name: "Others", commission: 99000, percentage: 20.4, color: "#8b5cf6" },
  ],
  commissionHistory: [
    {
      id: "COM001",
      applicationId: "APP001",
      lenderName: "HDFC Bank",
      loanType: "Personal Loan",
      disbursedAmount: 500000,
      commissionRate: 4.0,
      commissionAmount: 20000,
      status: "Paid",
      disbursedDate: "15 Jan 2025",
      paidDate: "20 Jan 2025",
    },
    {
      id: "COM002",
      applicationId: "APP002",
      lenderName: "ICICI Bank",
      loanType: "Home Loan",
      disbursedAmount: 2500000,
      commissionRate: 3.5,
      commissionAmount: 87500,
      status: "Pending",
      disbursedDate: "18 Jan 2025",
      paidDate: null,
    },
    {
      id: "COM003",
      applicationId: "APP003",
      lenderName: "Bajaj Finance",
      loanType: "Business Loan",
      disbursedAmount: 1000000,
      commissionRate: 4.5,
      commissionAmount: 45000,
      status: "Paid",
      disbursedDate: "20 Jan 2025",
      paidDate: "25 Jan 2025",
    },
    {
      id: "COM004",
      applicationId: "APP004",
      lenderName: "Axis Bank",
      loanType: "Car Loan",
      disbursedAmount: 800000,
      commissionRate: 3.8,
      commissionAmount: 30400,
      status: "Processing",
      disbursedDate: "22 Jan 2025",
      paidDate: null,
    },
    {
      id: "COM005",
      applicationId: "APP005",
      lenderName: "Kotak Bank",
      loanType: "Personal Loan",
      disbursedAmount: 350000,
      commissionRate: 4.2,
      commissionAmount: 14700,
      status: "Disputed",
      disbursedDate: "19 Jan 2025",
      paidDate: null,
    },
  ],
};

export default function CommissionsScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTab, setSelectedTab] = useState("trends");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "#10B981";
      case "Pending":
        return "#F59E0B";
      case "Processing":
        return "#3B82F6";
      case "Disputed":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid":
        return "check-circle";
      case "Pending":
        return "pending";
      case "Processing":
        return "sync";
      case "Disputed":
        return "error";
      default:
        return "schedule";
    }
  };

  const filteredCommissions = mockData.commissionHistory.filter(
    (commission) => {
      const matchesSearch =
        commission.applicationId
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        commission.lenderName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || commission.status === filterStatus;
      return matchesSearch && matchesStatus;
    }
  );

  const renderSelectedTab = () => {
    switch (selectedTab) {
      case "trends":
        return (
          <CommissionTrends
            trends={mockData.commissionTrends}
            formatCurrency={formatCurrency}
          />
        );
      case "breakdown":
        return (
          <LenderBreakdown
            lenders={mockData.lenderWiseCommission}
            formatCurrency={formatCurrency}
          />
        );
      case "history":
        return (
          <CommissionHistory
            commissions={filteredCommissions}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            formatCurrency={formatCurrency}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={commissionsStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      <ScrollView
        style={commissionsStyles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <CommissionHeader />

        <CommissionMetrics
          metrics={mockData.metrics}
          formatCurrency={formatCurrency}
        />

        <CommissionTabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />

        {renderSelectedTab()}
      </ScrollView>
    </SafeAreaView>
  );
}
