import { Currency, GoalPriority, GoalStatus } from "../enums";
import { Wallet } from "./wallet.types";

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number | string;
  savedAmount: number | string;
  currency: Currency;
  startDate: string;
  targetDate: string;
  status: GoalStatus;
  priority: GoalPriority;
  description?: string | null | undefined;
  notes?: string | null | undefined;
  icon?: string | null | undefined;
  color?: string | null | undefined;
  isArchived: boolean;
  walletId?: string | null | undefined;
  wallet?: Wallet | null | undefined;
  reminderDate?: string | null | undefined;
  reminderSent?: boolean | undefined;
  progress?: number | undefined;
  percentage?: number | undefined;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null | undefined;
  archivedAt?: string | null | undefined;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  walletId?: string | null | undefined;
  wallet?: Wallet | null | undefined;
  amount: number | string;
  contributionDate: string;
  note?: string | null | undefined;
  transactionId?: string | null | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalInput {
  name: string;
  targetAmount: number;
  startDate: string;
  targetDate: string;
  status?: GoalStatus | undefined;
  priority?: GoalPriority | undefined;
  description?: string | undefined;
  notes?: string | undefined;
  icon?: string | undefined;
  color?: string | undefined;
  walletId?: string | undefined;
  currency?: Currency | undefined;
  reminderDate?: string | undefined;
  isArchived?: boolean | undefined;
}

export interface UpdateGoalInput {
  name?: string | undefined;
  targetAmount?: number | undefined;
  startDate?: string | undefined;
  targetDate?: string | undefined;
  status?: GoalStatus | undefined;
  priority?: GoalPriority | undefined;
  description?: string | undefined;
  notes?: string | undefined;
  icon?: string | undefined;
  color?: string | undefined;
  walletId?: string | null | undefined;
  currency?: Currency | undefined;
  reminderDate?: string | null | undefined;
  isArchived?: boolean | undefined;
}

export interface ContributeGoalInput {
  amount: number;
  walletId?: string | undefined;
  note?: string | undefined;
  contributionDate?: string | undefined;
}

export interface GoalQueryParams {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  status?: GoalStatus | undefined;
  priority?: GoalPriority | undefined;
  walletId?: string | undefined;
  isArchived?: boolean | undefined;
  sortBy?: string | undefined;
  order?: "asc" | "desc" | undefined;
}

export interface GoalSummary {
  totalGoals: number;
  totalTargetAmount: number;
  totalSavedAmount: number;
  totalRemainingAmount: number;
  activeGoals: number;
  completedGoals: number;
  archivedGoals: number;
}
