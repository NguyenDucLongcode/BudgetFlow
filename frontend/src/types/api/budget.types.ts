import { BudgetPeriod, BudgetType } from "../enums";
import type { TransactionCategory } from "./category.types";

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  category?: TransactionCategory | undefined;
  amount: number | string;
  spent: number | string;
  startDate: string;
  endDate: string;
  period: BudgetPeriod;
  type: BudgetType;
  alertThreshold?: number | string | null | undefined;
  isAlertEnabled: boolean;
  description?: string | null | undefined;
  notes?: string | null | undefined;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetInput {
  categoryId: string;
  amount: number;
  startDate: string;
  endDate: string;
  period?: BudgetPeriod | undefined;
  type?: BudgetType | undefined;
  alertThreshold?: number | undefined;
  isAlertEnabled?: boolean | undefined;
  description?: string | undefined;
  notes?: string | undefined;
}

export interface UpdateBudgetInput {
  categoryId?: string | undefined;
  amount?: number | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  period?: BudgetPeriod | undefined;
  type?: BudgetType | undefined;
  alertThreshold?: number | undefined;
  isAlertEnabled?: boolean | undefined;
  description?: string | undefined;
  notes?: string | undefined;
  isActive?: boolean | undefined;
}

export interface BudgetQueryParams {
  page?: number | string | undefined;
  limit?: number | string | undefined;
  search?: string | undefined;
  type?: BudgetType | "ALL" | undefined;
  period?: BudgetPeriod | "ALL" | undefined;
  categoryId?: string | undefined;
  isActive?: boolean | string | undefined;
  fromDate?: string | undefined;
  toDate?: string | undefined;
  month?: number | string | undefined;
  year?: number | string | undefined;
  sortBy?: string | undefined;
  order?: "asc" | "desc" | undefined;
}

export interface BudgetSummary {
  totalBudgets: number;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  activeBudgets: number;
  alertEnabledBudgets: number;
  overBudgetBudgets: number;
}
