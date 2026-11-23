import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { transactionService } from "./transaction.service";
import { transactionKeys } from "./transactionKeys";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterParams,
} from "@/src/types/api";

export function useTransactions(params?: TransactionFilterParams) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => transactionService.getTransactions(params),
    staleTime: 60 * 1000, // 1 phút
  });
}

export function useTransactionDetail(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionService.getTransaction(id),
    enabled: Boolean(id),
  });
}

export function useTransactionStatistics(params?: {
  fromDate?: string;
  toDate?: string;
}) {
  return useQuery({
    queryKey: transactionKeys.statistics(params),
    queryFn: () => transactionService.getStatistics(params),
    staleTime: 60 * 1000, // 1 phút
  });
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    const response = errObj.response as Record<string, unknown> | undefined;
    const responseData = (response?.data || error) as Record<string, unknown> | undefined;
    const msg = responseData?.message || errObj.message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg.join(", ");
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const t = useTranslations("transactions");

  return useMutation({
    mutationFn: (data: CreateTransactionInput) =>
      transactionService.createTransaction(data),
    onSuccess: async () => {
      toast.success(t("toastCreated"));
      await queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      await queryClient.invalidateQueries({ queryKey: ["wallets"], exact: false });
      await queryClient.invalidateQueries({ queryKey: ["budgets"], exact: false });
      await queryClient.invalidateQueries({ queryKey: ["budget-summary"], exact: false });
      await queryClient.refetchQueries({ queryKey: transactionKeys.all });
      await queryClient.refetchQueries({ queryKey: ["budgets"], exact: false });
      await queryClient.refetchQueries({ queryKey: ["budget-summary"], exact: false });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, t("errorSave")));
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const t = useTranslations("transactions");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionInput }) =>
      transactionService.updateTransaction(id, data),
    onSuccess: async (_, variables) => {
      toast.success(t("toastUpdated"));
      await queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      await queryClient.invalidateQueries({
        queryKey: transactionKeys.detail(variables.id),
      });
      await queryClient.invalidateQueries({ queryKey: ["wallets"], exact: false });
      await queryClient.invalidateQueries({ queryKey: ["budgets"], exact: false });
      await queryClient.invalidateQueries({ queryKey: ["budget-summary"], exact: false });
      await queryClient.refetchQueries({ queryKey: transactionKeys.all });
      await queryClient.refetchQueries({ queryKey: ["budgets"], exact: false });
      await queryClient.refetchQueries({ queryKey: ["budget-summary"], exact: false });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, t("errorSave")));
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const t = useTranslations("transactions");

  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: async () => {
      toast.success(t("toastDeleted"));
      await queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      await queryClient.invalidateQueries({ queryKey: ["wallets"], exact: false });
      await queryClient.invalidateQueries({ queryKey: ["budgets"], exact: false });
      await queryClient.invalidateQueries({ queryKey: ["budget-summary"], exact: false });
      await queryClient.refetchQueries({ queryKey: transactionKeys.all });
      await queryClient.refetchQueries({ queryKey: ["budgets"], exact: false });
      await queryClient.refetchQueries({ queryKey: ["budget-summary"], exact: false });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, t("errorSave")));
    },
  });
}
