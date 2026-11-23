import type { GoalQueryParams } from "@/src/types/api";

export const goalKeys = {
  all: ["goals"] as const,
  lists: () => [...goalKeys.all, "list"] as const,
  list: (params?: GoalQueryParams | Record<string, unknown>) =>
    [...goalKeys.lists(), params] as const,
  details: () => [...goalKeys.all, "detail"] as const,
  detail: (id: string) => [...goalKeys.details(), id] as const,
  summary: () => [...goalKeys.all, "summary"] as const,
  contributions: (id: string) => [...goalKeys.detail(id), "contributions"] as const,
};
