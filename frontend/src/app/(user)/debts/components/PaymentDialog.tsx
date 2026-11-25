"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import {
  X,
  CreditCard,
  Wallet as WalletIcon,
  Loader2,
  Banknote,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { CurrencyInput } from "@/src/components/ui/currency-input";
import { useWallets } from "@/src/client/wallet/wallet.hooks";
import { usePayDebt } from "@/src/client/debt/debt.hooks";
import { DebtType, PaymentMethod } from "@/src/types/enums";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedName } from "@/src/utils";
import type { Debt, Wallet } from "@/src/types/api";

const paymentSchema = z.object({
  amount: z.number().min(1000, "Số tiền thanh toán tối thiểu là 1,000 ₫"),
  walletId: z.string().optional(),
  method: z.nativeEnum(PaymentMethod),
  note: z.string().max(255).optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: Debt | null;
}

export function PaymentDialog({
  open,
  onOpenChange,
  debt,
}: PaymentDialogProps) {
  const t = useTranslations("debts");
  const locale = useLocale();
  const { data: wallets = [] } = useWallets();
  const payDebtMutation = usePayDebt();

  const isLoan = debt?.type === DebtType.LOAN;
  const total = Number(debt?.totalAmount || 0);
  const paid = Number(debt?.paidAmount || 0);
  const remaining = Math.max(0, total - paid);

  // Lấy TẤT CẢ các ví đang hoạt động (không bị archive)
  const activeWallets = useMemo(
    () => (wallets as Wallet[]).filter((w: Wallet) => !w.isArchived),
    [wallets],
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      walletId: "",
      method: PaymentMethod.BANK_TRANSFER,
      note: "",
    },
  });

  const selectedWalletId = watch("walletId");
  const currentAmount = watch("amount") || 0;
  const selectedWallet = activeWallets.find((w: Wallet) => w.id === selectedWalletId);
  const walletBalance = Number(selectedWallet?.balance || 0);

  // Dùng ref để đảm bảo CHỈ reset form 1 lần duy nhất khi Dialog vừa được mở ra
  // Tuyệt đối không re-run khi user đang gõ phím hoặc đổi ví
  const prevOpenRef = useRef(false);
  const prevDebtIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (open && debt) {
      const isNewOpen = !prevOpenRef.current;
      const isNewDebt = prevDebtIdRef.current !== debt.id;

      if (isNewOpen || isNewDebt) {
        const defaultWallet =
          activeWallets.find((w: Wallet) => w.id === debt.walletId) ||
          activeWallets.find((w: Wallet) => w.isDefault) ||
          activeWallets[0];

        reset({
          amount: 0, // Bắt đầu bằng 0, không tự động điền remaining để người dùng tùy ý gõ
          walletId: defaultWallet?.id || "",
          method: PaymentMethod.BANK_TRANSFER,
          note: isLoan
            ? `Thanh toán nợ cho ${debt.contactName || debt.name}`
            : `Thu tiền nợ từ ${debt.contactName || debt.name}`,
        });
      }
    }
    prevOpenRef.current = open;
    prevDebtIdRef.current = debt ? debt.id : null;
  }, [open, debt, isLoan, activeWallets, reset]);

  const onFormSubmit = async (values: PaymentFormValues) => {
    if (!debt) return;

    if (isLoan && selectedWallet && values.amount > walletBalance) {
      toast.error(
        `Số dư ví "${getLocalizedName(selectedWallet, locale)}" không đủ (${walletBalance.toLocaleString("vi-VN")} ₫). Vui lòng chọn ví khác hoặc nạp thêm tiền!`,
      );
      return;
    }

    try {
      await payDebtMutation.mutateAsync({
        id: debt.id,
        data: {
          amount: values.amount,
          walletId: values.walletId || undefined,
          method: values.method,
          note: values.note?.trim() || undefined,
        },
      });

      const newPaid = paid + values.amount;
      if (newPaid >= total) {
        toast.success(
          isLoan
            ? `Chúc mừng! Bạn đã hoàn tất trả nợ khoản "${debt.name}"! 🎉`
            : `Tuyệt vời! Bạn đã thu hồi xong toàn bộ khoản cho vay "${debt.name}"! 🎉`,
          { autoClose: 6000 },
        );
      } else {
        toast.success(
          `Ghi nhận thanh toán ${values.amount.toLocaleString("vi-VN")} ₫ thành công!`,
        );
      }
      onOpenChange(false);
    } catch (err: unknown) {
      let msg = "Có lỗi xảy ra khi thực hiện thanh toán, vui lòng thử lại!";
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

  if (!open || !debt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isLoan
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}
            >
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isLoan ? t("paymentDialogLoanTitle") : t("paymentDialogDebtTitle")}
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">
                {debt.name} ({debt.contactName})
              </p>
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

        {/* Debt Amount Overview Card */}
        <div className="p-5 mx-6 mt-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {isLoan ? t("paid") : t("collected")}
            </p>
            <p className="text-base font-bold text-white mt-0.5">
              {paid.toLocaleString("vi-VN")} ₫
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {isLoan ? t("remainingToPayLabel") : t("remainingToCollectLabel")}
            </p>
            <p
              className={`text-base font-bold mt-0.5 ${
                isLoan ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {remaining.toLocaleString("vi-VN")} ₫
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          {/* Số tiền thanh toán */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                {t("paymentAmount")} <span className="text-rose-400">*</span>
              </label>
              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => setValue("amount", remaining, { shouldValidate: true })}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {isLoan ? t("payAll") : t("collectAll")}
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
                  placeholder={t("amountPlaceholder")}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-base text-white font-bold placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              )}
            />
            {errors.amount && (
              <p className="text-xs text-rose-400 mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Chọn Ví thanh toán */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isLoan ? t("walletDeduct") : t("walletReceive")}
            </label>
            <Controller
              name="walletId"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <select
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-slate-300">
                      {t("noWalletAccounting")}
                    </option>
                    {activeWallets.map((w: Wallet) => (
                      <option key={w.id} value={w.id} className="bg-slate-900 text-slate-100">
                        {getLocalizedName(w, locale)} ({t("balanceLabel")}: {Number(w.balance).toLocaleString("vi-VN")} ₫)
                      </option>
                    ))}
                  </select>
                  <WalletIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              )}
            />
            {isLoan && selectedWallet && (
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {t("availableBalanceLabel")}
                  </span>
                  <span className="font-semibold text-slate-200 font-mono">
                    {walletBalance.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                {currentAmount > 0 && walletBalance < currentAmount && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {t("insufficientWarning", {
                        amount: currentAmount.toLocaleString("vi-VN"),
                        shortfall: (currentAmount - walletBalance).toLocaleString("vi-VN"),
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}
            {!isLoan && selectedWallet && (
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {t("currentWalletBalanceLabel")}
                </span>
                <span className="font-semibold text-slate-200 font-mono">
                  {walletBalance.toLocaleString("vi-VN")} ₫
                </span>
              </p>
            )}
          </div>

          {/* Phương thức thanh toán */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("paymentMethod")} <span className="text-rose-400">*</span>
            </label>
            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <select
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value as PaymentMethod)}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value={PaymentMethod.BANK_TRANSFER} className="bg-slate-900 text-slate-100">
                      {t("methodBank")}
                    </option>
                    <option value={PaymentMethod.CASH} className="bg-slate-900 text-slate-100">
                      {t("methodCash")}
                    </option>
                    <option value={PaymentMethod.E_WALLET} className="bg-slate-900 text-slate-100">
                      {t("methodEWallet")}
                    </option>
                    <option value={PaymentMethod.CREDIT_CARD} className="bg-slate-900 text-slate-100">
                      {t("methodCredit")}
                    </option>
                    <option value={PaymentMethod.OTHER} className="bg-slate-900 text-slate-100">
                      {t("methodOther")}
                    </option>
                  </select>
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              )}
            />
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("note")}
            </label>
            <input
              type="text"
              placeholder={t("paymentNotePlaceholder")}
              {...register("note")}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              disabled={payDebtMutation.isPending}
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={payDebtMutation.isPending}
              className={`px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 ${
                isLoan
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/25"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25"
              }`}
            >
              {payDebtMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              {isLoan ? t("confirmPay") : t("confirmCollect")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
