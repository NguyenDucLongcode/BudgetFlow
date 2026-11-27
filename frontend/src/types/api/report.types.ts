export interface DailyReportPoint {
  date: string;
  day: number;
  income: number;
  expense: number;
  net: number;
}

export interface TopCategoryReportItem {
  categoryId: string | null;
  nameVi: string;
  nameEn: string | null;
  icon: string | null;
  color: string | null;
  amount: number;
  percentage: number;
}

export interface TopTransactionReportItem {
  id: string;
  description: string | null;
  amount: number;
  date: string;
  category: {
    id: string;
    nameVi: string;
    nameEn: string | null;
    icon: string | null;
    color: string | null;
  } | null;
  wallet: {
    id: string;
    nameVi: string;
    nameEn: string | null;
  } | null;
}

export interface MonthlyReportSummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  previousMonth: {
    totalIncome: number;
    totalExpense: number;
    net: number;
  };
  comparison: {
    incomeChangePercent: number | null;
    expenseChangePercent: number | null;
    netChangePercent: number | null;
  };
}

export interface CashFlowBreakdownItem {
  key: "living" | "debt" | "savings";
  name: string;
  value: number;
  color: string;
}

export interface MonthlyReportResponse {
  year: number;
  month: number;
  summary: MonthlyReportSummary;
  daily: DailyReportPoint[];
  topCategories: TopCategoryReportItem[];
  topTransactions: TopTransactionReportItem[];
  cashFlowBreakdown: CashFlowBreakdownItem[];
}
