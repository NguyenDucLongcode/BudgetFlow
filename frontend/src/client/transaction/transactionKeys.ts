import type { TransactionFilterParams } from "@/src/types/api";

export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (params?: TransactionFilterParams) =>
    [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, "detail"] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  statistics: (params?: { fromDate?: string; toDate?: string }) =>
    [...transactionKeys.all, "statistics", params] as const,
};
