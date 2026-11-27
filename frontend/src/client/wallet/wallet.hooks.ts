import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { walletKeys } from "./wallet.keys";
import { walletService } from "./wallet.service";
import { invalidateDashboardQueries } from "@/src/lib/react-query/invalidate-dashboard";
import type {
  CreateWalletInput,
  UpdateWalletInput,
  WalletQueryParams,
} from "@/src/types/api";

export function useWallets(params?: WalletQueryParams) {
  return useQuery({
    queryKey: walletKeys.list(params),
    queryFn: () => walletService.getWallets(params),
    staleTime: 60 * 1000, // 1 phút
  });
}

export function useWallet(id: string) {
  return useQuery({
    queryKey: walletKeys.detail(id),
    queryFn: () => walletService.getWallet(id),
    enabled: Boolean(id),
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

export function useCreateWallet() {
  const queryClient = useQueryClient();
  const t = useTranslations("wallets");

  return useMutation({
    mutationFn: (data: CreateWalletInput) => walletService.createWallet(data),
    onSuccess: async () => {
      toast.success(t("toastCreated"));
      await invalidateDashboardQueries(queryClient);
      await queryClient.refetchQueries({ queryKey: ["wallets"] });
    },
    onError: (error: unknown) => {
      const errObj = typeof error === "object" && error !== null ? (error as Record<string, unknown>) : null;
      const response = errObj?.response as Record<string, unknown> | undefined;
      const responseData = (response?.data || error) as Record<string, unknown> | undefined;
      const message = responseData?.message || errObj?.message || "";
      const isMaxWallets =
        responseData?.error === "MAX_WALLETS_REACHED" ||
        responseData?.code === "MAX_WALLETS_REACHED" ||
        (typeof message === "string" &&
          (message.includes("tối đa") ||
            message.includes("MAX_WALLETS") ||
            message.includes("maximum")));

      if (isMaxWallets) {
        const max = (responseData?.maxWallets as number) || 5;
        toast.error(t("maxWalletsError", { max }));
      } else {
        toast.error(typeof message === "string" && message ? message : t("errorSave"));
      }
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  const t = useTranslations("wallets");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWalletInput }) =>
      walletService.updateWallet(id, data),
    onSuccess: async (_, variables) => {
      toast.success(t("toastUpdated"));
      await invalidateDashboardQueries(queryClient);
      await queryClient.invalidateQueries({ queryKey: walletKeys.detail(variables.id) });
      await queryClient.refetchQueries({ queryKey: ["wallets"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, t("errorSave")));
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();
  const t = useTranslations("wallets");

  return useMutation({
    mutationFn: (id: string) => walletService.deleteWallet(id),
    onSuccess: async () => {
      toast.success(t("toastDeleted"));
      await invalidateDashboardQueries(queryClient);
      await queryClient.refetchQueries({ queryKey: ["wallets"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Không thể xóa ví đã có giao dịch!"));
    },
  });
}

export function useSetDefaultWallet() {
  const queryClient = useQueryClient();
  const t = useTranslations("wallets");

  return useMutation({
    mutationFn: (id: string) => walletService.setDefault(id),
    onSuccess: async () => {
      toast.success(t("toastSetDefault"));
      await queryClient.invalidateQueries({ queryKey: ["wallets"] });
      await queryClient.refetchQueries({ queryKey: ["wallets"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Không thể đặt làm ví mặc định!"));
    },
  });
}

export function useArchiveWallet() {
  const queryClient = useQueryClient();
  const t = useTranslations("wallets");

  return useMutation({
    mutationFn: ({ id, archive }: { id: string; archive: boolean }) =>
      archive ? walletService.archiveWallet(id) : walletService.unarchiveWallet(id),
    onSuccess: async (_, variables) => {
      toast.success(
        variables.archive
          ? t("toastArchived")
          : "Đã khôi phục ví thành công!"
      );
      await queryClient.invalidateQueries({ queryKey: ["wallets"] });
      await queryClient.refetchQueries({ queryKey: ["wallets"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Có lỗi xảy ra khi thao tác lưu trữ ví!"));
    },
  });
}
