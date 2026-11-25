import type { RecurringQueryParams } from "@/src/types/api";

export const recurringKeys = {
  all: ["recurring-transactions"] as const,
  lists: () => [...recurringKeys.all, "list"] as const,
  list: (params?: RecurringQueryParams) =>
    [...recurringKeys.lists(), params ?? {}] as const,
  details: () => [...recurringKeys.all, "detail"] as const,
  detail: (id: string) => [...recurringKeys.details(), id] as const,
};
