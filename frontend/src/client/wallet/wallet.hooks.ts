import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { walletKeys } from "./wallet.keys";
import { walletService } from "./wallet.service";
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

export function useCreateWallet() {
  const queryClient = useQueryClient();
  const t = useTranslations("wallets");

  return useMutation({
    mutationFn: (data: CreateWalletInput) => walletService.createWallet(data),
    onSuccess: async () => {
      toast.success(t("toastCreated"));
      await queryClient.invalidateQueries({ queryKey: ["wallets"] });
      await queryClient.refetchQueries({ queryKey: ["wallets"] });
    },
    onError: (error: any) => {
      const responseData = error?.response?.data || error;
      const message = responseData?.message || error?.message || "";
      const isMaxWallets =
        responseData?.error === "MAX_WALLETS_REACHED" ||
        responseData?.code === "MAX_WALLETS_REACHED" ||
        (typeof message === "string" &&
          (message.includes("tối đa") ||
            message.includes("MAX_WALLETS") ||
            message.includes("maximum")));

      if (isMaxWallets) {
        const max = responseData?.maxWallets || 5;
        toast.error(t("maxWalletsError", { max }));
      } else {
        toast.error(message || t("errorSave"));
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
      await queryClient.invalidateQueries({ queryKey: ["wallets"] });
      await queryClient.invalidateQueries({ queryKey: walletKeys.detail(variables.id) });
      await queryClient.refetchQueries({ queryKey: ["wallets"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || t("errorSave"));
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
      await queryClient.invalidateQueries({ queryKey: ["wallets"] });
      await queryClient.refetchQueries({ queryKey: ["wallets"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể xóa ví đã có giao dịch!");
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
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể đặt làm ví mặc định!");
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
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi thao tác lưu trữ ví!");
    },
  });
}
