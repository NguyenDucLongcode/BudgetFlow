import type { RecurringFrequency, TransactionType } from "../enums";
import type { TransactionCategory, Wallet } from ".";

export interface RecurringTransaction {
  id: string;
  userId: string;
  walletId: string;
  wallet?: Pick<Wallet, "id" | "nameVi" | "nameEn" | "name" | "type" | "currency">;
  categoryId?: string | null;
  category?: Pick<
    TransactionCategory,
    "id" | "nameVi" | "nameEn" | "name" | "type" | "icon" | "color"
  > | null;
  name: string;
  amount: string | number;
  type: TransactionType;
  currency: string;
  frequency: RecurringFrequency;
  interval: number;
  startDate: string;
  endDate?: string | null;
  lastRunDate?: string | null;
  nextRunDate: string;
  isActive: boolean;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringTransactionInput {
  name: string;
  walletId: string;
  categoryId?: string;
  amount: number;
  type: TransactionType;
  currency?: string;
  frequency: RecurringFrequency;
  interval?: number;
  startDate: string;
  endDate?: string;
  nextRunDate: string;
  isActive?: boolean;
  description?: string;
}

export interface UpdateRecurringTransactionInput {
  name?: string;
  walletId?: string;
  categoryId?: string;
  amount?: number;
  type?: TransactionType;
  currency?: string;
  frequency?: RecurringFrequency;
  interval?: number;
  startDate?: string;
  endDate?: string | null;
  nextRunDate?: string;
  isActive?: boolean;
  description?: string;
}

export interface RecurringQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: TransactionType;
  frequency?: RecurringFrequency;
  walletId?: string;
  categoryId?: string;
  isActive?: boolean;
  sortBy?: string;
  order?: "asc" | "desc";
}
