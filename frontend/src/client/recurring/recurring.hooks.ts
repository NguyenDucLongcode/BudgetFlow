import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recurringService } from "./recurring.service";
import { recurringKeys } from "./recurring.keys";
import type {
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
  RecurringQueryParams,
} from "@/src/types/api";

export function useRecurringTransactions(params?: RecurringQueryParams) {
  return useQuery({
    queryKey: recurringKeys.list(params),
    queryFn: () => recurringService.getAll(params),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecurringTransactionInput) =>
      recurringService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: recurringKeys.all,
        exact: false,
      });
    },
  });
}

export function useUpdateRecurringTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRecurringTransactionInput;
    }) => recurringService.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: recurringKeys.all,
        exact: false,
      });
    },
  });
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recurringService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: recurringKeys.all,
        exact: false,
      });
    },
  });
}

export function useToggleRecurringStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? recurringService.resume(id) : recurringService.pause(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: recurringKeys.all,
        exact: false,
      });
    },
  });
}
