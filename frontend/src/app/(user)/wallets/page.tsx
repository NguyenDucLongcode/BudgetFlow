"use client";

import { useState } from "react";
import { Plus, Wallet as WalletIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useWallets,
  useCreateWallet,
  useUpdateWallet,
  useDeleteWallet,
  useSetDefaultWallet,
  useArchiveWallet,
} from "@/src/client/wallet";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { WalletCard } from "./components/WalletCard";
import { WalletDialog } from "./components/WalletDialog";
import { WalletSkeleton } from "./components/WalletSkeleton";
import type { Wallet, CreateWalletInput, UpdateWalletInput } from "@/src/types/api";

export default function WalletsPage() {
  const t = useTranslations("wallets");
  const [showArchived, setShowArchived] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  // 1. Lấy danh sách ví (Tự động kích hoạt ngay khi mount, xử lý hiển thị ví lưu trữ)
  const { data: rawWallets, isLoading, isFetching } = useWallets({
    page: 1,
    limit: 100,
    ...(showArchived ? {} : { isArchived: false }),
  });

  // Đảm bảo dữ liệu nhận được luôn là Array
  const wallets: Wallet[] = Array.isArray(rawWallets) ? rawWallets : [];

  // 2. Các mutations thao tác ví (tự động thông báo qua react-toastify)
  const createMutation = useCreateWallet();
  const updateMutation = useUpdateWallet();
  const deleteMutation = useDeleteWallet();
  const setDefaultMutation = useSetDefaultWallet();
  const archiveMutation = useArchiveWallet();

  const handleOpenCreate = () => {
    setEditingWallet(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateWalletInput | UpdateWalletInput) => {
    try {
      if (editingWallet) {
        await updateMutation.mutateAsync({
          id: editingWallet.id,
          data: data as UpdateWalletInput,
        });
      } else {
        await createMutation.mutateAsync(data as CreateWalletInput);
      }
      setDialogOpen(false);
      setEditingWallet(null);
    } catch {
      // Đã có onError trong hook hiển thị toast thông báo lỗi
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultMutation.mutateAsync(id);
    } catch {
      // Đã có onError trong hook hiển thị toast thông báo lỗi
    }
  };

  const handleArchive = async (id: string, archive: boolean) => {
    try {
      await archiveMutation.mutateAsync({ id, archive });
    } catch {
      // Đã có onError trong hook hiển thị toast thông báo lỗi
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Đã có onError trong hook hiển thị toast thông báo lỗi
    }
  };

  const hasWallets = wallets.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {t("title")}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className={`text-xs font-semibold px-3 py-2 rounded-xl border ${
              wallets.length >= 5
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-slate-800/60 text-slate-300 border-slate-700"
            }`}
          >
            {t("walletCount", { current: wallets.length, max: 5 })}
          </span>

          <Button
            onClick={handleOpenCreate}
            className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("create")}
          </Button>
        </div>
      </div>

      {/* Filter and Status */}
      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
          />
          <span>{t("showArchived")}</span>
        </label>

        {isFetching && !isLoading && (
          <span className="text-xs text-indigo-400 animate-pulse font-medium">
            {t("loading")}
          </span>
        )}
      </div>

      {/* Content State */}
      {isLoading ? (
        <WalletSkeleton />
      ) : !hasWallets ? (
        /* Empty State */
        <Card className="border-dashed border-slate-800 bg-[#111827]/60 rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 p-5 text-indigo-400">
              <WalletIcon className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-white">{t("emptyTitle")}</h2>
            <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t("emptyDescription")}
            </p>
            <Button
              onClick={handleOpenCreate}
              className="mt-6 bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("createFirst")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Grid Cards (3 cột trên desktop, 1 cột trên mobile) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onEdit={handleOpenEdit}
              onSetDefault={handleSetDefault}
              onArchive={handleArchive}
              onDelete={handleDelete}
              isSettingDefault={setDefaultMutation.isPending}
              isArchiving={archiveMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Wallet Dialog */}
      <WalletDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        walletToEdit={editingWallet}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
