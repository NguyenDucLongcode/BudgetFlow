import type { BudgetQueryParams } from "@/src/types/api";

export const budgetKeys = {
  all: ["budgets"] as const,
  lists: () => [...budgetKeys.all, "list"] as const,
  list: (params?: BudgetQueryParams) => [...budgetKeys.lists(), params] as const,
  details: () => [...budgetKeys.all, "detail"] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
  summary: (params?: {
    fromDate?: string;
    toDate?: string;
    month?: number | string;
    year?: number | string;
  }) => ["budget-summary", params] as const,
};
