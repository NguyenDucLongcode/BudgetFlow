import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { debtService } from "./debt.service";
import { debtKeys } from "./debt.keys";
import { invalidateDashboardQueries } from "@/src/lib/react-query/invalidate-dashboard";
import type {
  CreateDebtInput,
  UpdateDebtInput,
  CreateDebtPaymentInput,
  DebtQueryParams,
} from "@/src/types/api";

export function useDebts(params?: DebtQueryParams) {
  return useQuery({
    queryKey: debtKeys.list(params),
    queryFn: () => debtService.getDebts(params),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useDebt(id: string) {
  return useQuery({
    queryKey: debtKeys.detail(id),
    queryFn: () => debtService.getDebt(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useDebtSummary() {
  return useQuery({
    queryKey: debtKeys.summary(),
    queryFn: () => debtService.getSummary(),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useDebtPayments(id: string) {
  return useQuery({
    queryKey: debtKeys.payments(id),
    queryFn: () => debtService.getPayments(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDebtInput) => debtService.createDebt(data),
    onSuccess: async () => {
      await invalidateDashboardQueries(queryClient);
      await queryClient.refetchQueries({ queryKey: ["debts"], exact: false });
    },
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDebtInput }) =>
      debtService.updateDebt(id, data),
    onSuccess: async () => {
      await invalidateDashboardQueries(queryClient);
      await queryClient.refetchQueries({ queryKey: ["debts"], exact: false });
    },
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => debtService.deleteDebt(id),
    onSuccess: async () => {
      await invalidateDashboardQueries(queryClient);
      await queryClient.refetchQueries({ queryKey: ["debts"], exact: false });
    },
  });
}

export function usePayDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateDebtPaymentInput }) =>
      debtService.addPayment(id, data),
    onSuccess: async () => {
      // Invalidate các queries liên quan
      await invalidateDashboardQueries(queryClient);

      // Ép tải lại ngay lập tức
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["debts"], exact: false }),
        queryClient.refetchQueries({ queryKey: ["wallets"], exact: false }),
        queryClient.refetchQueries({ queryKey: ["transactions"], exact: false }),
        queryClient.refetchQueries({ queryKey: ["statistics"], exact: false }),
      ]);
    },
  });
}
