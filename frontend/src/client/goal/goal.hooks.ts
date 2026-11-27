import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { goalService } from "./goal.service";
import { goalKeys } from "./goal.keys";
import { invalidateDashboardQueries } from "@/src/lib/react-query/invalidate-dashboard";
import type {
  CreateGoalInput,
  UpdateGoalInput,
  ContributeGoalInput,
  GoalQueryParams,
} from "@/src/types/api";

export function useGoals(params?: GoalQueryParams) {
  return useQuery({
    queryKey: goalKeys.list(params),
    queryFn: () => goalService.getGoals(params),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: goalKeys.detail(id),
    queryFn: () => goalService.getGoal(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useGoalSummary() {
  return useQuery({
    queryKey: goalKeys.summary(),
    queryFn: () => goalService.getSummary(),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGoalInput) => goalService.createGoal(data),
    onSuccess: async () => {
      await invalidateDashboardQueries(queryClient);
      await queryClient.refetchQueries({ queryKey: ["goals"], exact: false });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalInput }) =>
      goalService.updateGoal(id, data),
    onSuccess: async () => {
      await invalidateDashboardQueries(queryClient);
      await queryClient.refetchQueries({ queryKey: ["goals"], exact: false });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalService.deleteGoal(id),
    onSuccess: async () => {
      await invalidateDashboardQueries(queryClient);
      await queryClient.refetchQueries({ queryKey: ["goals"], exact: false });
    },
  });
}

export function useContributeGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContributeGoalInput }) =>
      goalService.contribute(id, data),
    onSuccess: async () => {
      await invalidateDashboardQueries(queryClient);

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["goals"], exact: false }),
        queryClient.refetchQueries({ queryKey: ["wallets"], exact: false }),
        queryClient.refetchQueries({ queryKey: ["transactions"], exact: false }),
        queryClient.refetchQueries({ queryKey: ["statistics"], exact: false }),
      ]);
    },
  });
}
