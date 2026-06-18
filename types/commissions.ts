
export enum CommissionStatus {
  PENDING = "PENDING",
  CALCULATED = "CALCULATED",
  APPROVED = "APPROVED",
  PAID = "PAID",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  DISPUTED = "DISPUTED",
}

export interface CommissionTransaction {
  id: string;
  ticketId: string;
  aggregatorId: string;
  ruleId?: string | null;
  disbursedAmount: number;
  commissionAmount: number;
  commissionType: string;
  commissionRate: number;
  status: CommissionStatus;
  aggregatorRank?: number | null;
  productType?: string | null;
  provider?: string | null;
  calculatedAt?: string | null;
  approvedAt?: string | null;
  paidAt?: string | null;
  paymentReference?: string | null;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string | null;
  paidBy?: string | null;
}

export interface PaginatedCommissionTransactions {
  success: boolean;
  message?: string;
  data: CommissionTransaction[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CommissionTransactionFilterInput {
  aggregatorId?: string;
  status?: CommissionStatus;
  productType?: string;
  // extend later if you add date ranges to backend
}

export interface RuleLenderCommission {
  lenderName: string;
  securedRate?: number | null;
  unsecuredRate?: number | null;
}

export interface CommissionRule {
  id: string;
  ruleName: string;
  icon?: string | null;
  badgeLabel?: string | null;
  commissionType: string;
  commissionRate: number;
  productType?: string | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  applicableFor: string;
  aggregatorType?: string | null;
  status: string;
  priority?: number | null;
  description?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  lenderCommissions?: RuleLenderCommission[] | null;
}

export interface CommissionRuleResponse {
  success: boolean;
  message?: string | null;
  data?: CommissionRule | null;
}

