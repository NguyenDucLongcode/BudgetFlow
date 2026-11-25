import type { DebtQueryParams } from "@/src/types/api";

export const debtKeys = {
  all: ["debts"] as const,
  lists: () => [...debtKeys.all, "list"] as const,
  list: (params?: DebtQueryParams | Record<string, unknown>) =>
    [...debtKeys.lists(), params] as const,
  details: () => [...debtKeys.all, "detail"] as const,
  detail: (id: string) => [...debtKeys.details(), id] as const,
  summary: () => [...debtKeys.all, "summary"] as const,
  payments: (id: string) => [...debtKeys.detail(id), "payments"] as const,
};
