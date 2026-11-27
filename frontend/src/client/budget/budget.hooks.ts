import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { budgetService } from "./budget.service";
import { budgetKeys } from "./budgetKeys";
import { invalidateDashboardQueries } from "@/src/lib/react-query/invalidate-dashboard";
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetQueryParams,
} from "@/src/types/api";

export function useBudgets(params?: BudgetQueryParams) {
  return useQuery({
    queryKey: budgetKeys.list(params),
    queryFn: () => budgetService.getBudgets(params),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: () => budgetService.getBudget(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useBudgetSummary(params?: {
  fromDate?: string;
  toDate?: string;
  month?: number | string;
  year?: number | string;
}) {
  return useQuery({
    queryKey: budgetKeys.summary(params),
    queryFn: () => budgetService.getSummary(params),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBudgetInput) => budgetService.createBudget(data),
    onSuccess: async () => {
      await invalidateDashboardQueries(queryClient);
      await queryClient.refetchQueries({ queryKey: ["budgets"], exact: false });
      await queryClient.refetchQueries({ queryKey: ["budget-summary"], exact: false });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetInput }) =>
      budgetService.updateBudget(id, data),
    onSuccess: async () => {
      await invalidateDashboardQueries(queryClient);
      await queryClient.refetchQueries({ queryKey: ["budgets"], exact: false });
      await queryClient.refetchQueries({ queryKey: ["budget-summary"], exact: false });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetService.deleteBudget(id),
    onSuccess: async () => {
      await invalidateDashboardQueries(queryClient);
      await queryClient.refetchQueries({ queryKey: ["budgets"], exact: false });
      await queryClient.refetchQueries({ queryKey: ["budget-summary"], exact: false });
    },
  });
}
