"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import {
  X,
  Wallet as WalletIcon,
  Loader2,
  AlertCircle,
  Coins,
  CheckCircle2,
} from "lucide-react";
import { CurrencyInput } from "@/src/components/ui/currency-input";
import { useWallets } from "@/src/client/wallet/wallet.hooks";
import { useContributeGoal } from "@/src/client/goal/goal.hooks";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedName } from "@/src/utils";
import type { Goal, Wallet } from "@/src/types/api";

const contributeSchema = z.object({
  amount: z.number().min(1000, "Số tiền nạp tối thiểu là 1,000 ₫"),
  walletId: z.string().min(1, "Vui lòng chọn ví nguồn"),
  note: z.string().max(255).optional(),
});

type ContributeFormValues = z.infer<typeof contributeSchema>;

interface ContributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
}

export function ContributeDialog({
  open,
  onOpenChange,
  goal,
}: ContributeDialogProps) {
  const t = useTranslations("goals");
  const locale = useLocale();
  const { data: wallets = [] } = useWallets();
  const contributeMutation = useContributeGoal();

  // Lọc chỉ lấy các ví đang hoạt động (không archive) và có số dư > 0
  const activeWallets = (wallets as Wallet[]).filter(
    (w: Wallet) => !w.isArchived && Number(w.balance) > 0,
  );

  const targetAmount = Number(goal?.targetAmount || 0);
  const savedAmount = Number(goal?.savedAmount || 0);
  const remainingAmount = Math.max(0, targetAmount - savedAmount);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContributeFormValues>({
    resolver: zodResolver(contributeSchema),
    defaultValues: {
      amount: remainingAmount > 0 ? Math.min(1000000, remainingAmount) : 100000,
      walletId: "",
      note: "",
    },
  });

  const selectedWalletId = watch("walletId");
  const selectedWallet = activeWallets.find((w: Wallet) => w.id === selectedWalletId);
  const walletBalance = Number(selectedWallet?.balance || 0);

  useEffect(() => {
    if (open && goal) {
      const defaultWallet = activeWallets.find((w: Wallet) => w.isDefault) || activeWallets[0];
      const remaining = Math.max(0, Number(goal.targetAmount) - Number(goal.savedAmount));
      reset({
        amount: remaining > 0 ? Math.min(1000000, remaining) : 100000,
        walletId: goal.walletId || defaultWallet?.id || "",
        note: `Nạp tiền vào mục tiêu ${goal.name}`,
      });
    }
  }, [open, goal, reset]);

  const onFormSubmit = async (values: ContributeFormValues) => {
    if (!goal) return;

    if (selectedWallet && values.amount > walletBalance) {
      toast.error(
        `Số dư ví "${getLocalizedName(selectedWallet, locale)}" không đủ (${walletBalance.toLocaleString("vi-VN")} ₫)`,
      );
      return;
    }

    try {
      await contributeMutation.mutateAsync({
        id: goal.id,
        data: {
          amount: values.amount,
          walletId: values.walletId,
          note: values.note?.trim() || undefined,
        },
      });

      const newSaved = savedAmount + values.amount;
      if (newSaved >= targetAmount) {
        toast.success(
          `Tuyệt vời! Bạn đã hoàn thành 100% mục tiêu "${goal.name}"! 🎉`,
          { autoClose: 6000 },
        );
      } else {
        toast.success(
          `Nạp thành công ${values.amount.toLocaleString("vi-VN")} ₫ vào mục tiêu!`,
        );
      }
      onOpenChange(false);
    } catch (err: unknown) {
      let msg = "Có lỗi xảy ra khi nạp tiền, vui lòng thử lại!";
      if (typeof err === "object" && err !== null && "response" in err) {
        const res = (err as Record<string, unknown>).response as Record<string, unknown> | undefined;
        const resData = res?.data as Record<string, unknown> | undefined;
        if (typeof resData?.message === "string") {
          msg = resData.message;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      toast.error(msg);
    }
  };

  if (!open || !goal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{t("contributeTitle")}</h2>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">{goal.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status card */}
        <div className="p-5 mx-6 mt-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t("savedLabel")}
            </p>
            <p className="text-base font-bold text-emerald-400 mt-0.5">
              {savedAmount.toLocaleString("vi-VN")} ₫
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t("remainingLabel")}
            </p>
            <p className="text-base font-bold text-amber-400 mt-0.5">
              {remainingAmount.toLocaleString("vi-VN")} ₫
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          {/* Số tiền nạp */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                {t("contributeAmount")} <span className="text-rose-400">*</span>
              </label>
              {remainingAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setValue("amount", remainingAmount)}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {t("contributeAllRemaining")}
                </button>
              )}
            </div>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-base text-white font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              )}
            />
            {errors.amount && (
              <p className="text-xs text-rose-400 mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Chọn ví nguồn */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("fromWallet")} <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <select
                {...register("walletId")}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">{t("selectWallet")}</option>
                {activeWallets.map((w: Wallet) => (
                  <option key={w.id} value={w.id}>
                    {getLocalizedName(w, locale)} ({t("availableLabel")}: {Number(w.balance).toLocaleString("vi-VN")} ₫)
                  </option>
                ))}
              </select>
              <WalletIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {errors.walletId && (
              <p className="text-xs text-rose-400 mt-1">{errors.walletId.message}</p>
            )}
            {selectedWallet && (
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {t("availableBalance")}{" "}
                <span className="font-semibold text-slate-200">
                  {walletBalance.toLocaleString("vi-VN")} ₫
                </span>
              </p>
            )}
            {activeWallets.length === 0 && (
              <div className="flex items-center gap-2 p-2.5 mt-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{t("noPositiveWallets")}</span>
              </div>
            )}
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("note")}
            </label>
            <input
              type="text"
              placeholder={t("contributeNotePlaceholder")}
              {...register("note")}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              disabled={contributeMutation.isPending}
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={contributeMutation.isPending || activeWallets.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {contributeMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              {t("confirmContribute")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
