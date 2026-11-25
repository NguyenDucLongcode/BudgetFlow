"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import {
  X,
  Calendar,
  User,
  Percent,
  Wallet as WalletIcon,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { CurrencyInput } from "@/src/components/ui/currency-input";
import { useWallets } from "@/src/client/wallet/wallet.hooks";
import { DebtStatus, DebtType } from "@/src/types/enums";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedName } from "@/src/utils";
import type {
  Debt,
  Wallet,
  CreateDebtInput,
  UpdateDebtInput,
} from "@/src/types/api";

const debtSchema = z
  .object({
    name: z.string().min(1, "Vui lòng nhập tên khoản nợ").max(150),
    type: z.nativeEnum(DebtType),
    totalAmount: z.number().min(1000, "Số tiền nợ tối thiểu là 1,000 ₫"),
    contactName: z.string().min(1, "Vui lòng nhập người liên hệ (chủ nợ / người vay)").max(150),
    startDate: z.string().min(1, "Vui lòng chọn ngày vay"),
    dueDate: z.string().min(1, "Vui lòng chọn ngày đến hạn"),
    interestRate: z.number().min(0, "Lãi suất không được âm").max(100).optional(),
    walletId: z.string().optional(),
    description: z.string().max(255).optional(),
    note: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.dueDate) >= new Date(data.startDate), {
    message: "Ngày đến hạn phải sau hoặc cùng ngày vay",
    path: ["dueDate"],
  });

type DebtFormValues = z.infer<typeof debtSchema>;

interface DebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debtToEdit?: Debt | null;
  defaultType?: DebtType;
  onSubmit: (data: CreateDebtInput | UpdateDebtInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function DebtDialog({
  open,
  onOpenChange,
  debtToEdit,
  defaultType = DebtType.LOAN,
  onSubmit,
  isSubmitting = false,
}: DebtDialogProps) {
  const t = useTranslations("debts");
  const locale = useLocale();
  const isEditing = Boolean(debtToEdit);
  const { data: wallets = [] } = useWallets();

  const getDefaultDates = () => {
    const today = new Date();
    const future = new Date();
    future.setMonth(future.getMonth() + 1);
    return {
      startDate: today.toISOString().split("T")[0],
      dueDate: future.toISOString().split("T")[0],
    };
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      name: "",
      type: defaultType,
      totalAmount: 5000000,
      contactName: "",
      startDate: getDefaultDates().startDate,
      dueDate: getDefaultDates().dueDate,
      interestRate: 0,
      walletId: "",
      description: "",
      note: "",
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (open) {
      if (debtToEdit) {
        reset({
          name: debtToEdit.name,
          type: debtToEdit.type,
          totalAmount: Number(debtToEdit.totalAmount),
          contactName: debtToEdit.contactName || "",
          startDate: debtToEdit.startDate
            ? new Date(debtToEdit.startDate).toISOString().split("T")[0]
            : getDefaultDates().startDate,
          dueDate: debtToEdit.dueDate
            ? new Date(debtToEdit.dueDate).toISOString().split("T")[0]
            : getDefaultDates().dueDate,
          interestRate: debtToEdit.interestRate !== null && debtToEdit.interestRate !== undefined ? Number(debtToEdit.interestRate) : 0,
          walletId: debtToEdit.walletId || "",
          description: debtToEdit.description || "",
          note: debtToEdit.note || "",
        });
      } else {
        const defaults = getDefaultDates();
        reset({
          name: "",
          type: defaultType,
          totalAmount: 5000000,
          contactName: "",
          startDate: defaults.startDate,
          dueDate: defaults.dueDate,
          interestRate: 0,
          walletId: "",
          description: "",
          note: "",
        });
      }
    }
  }, [open, debtToEdit, defaultType, reset]);

  const onFormSubmit = async (values: DebtFormValues) => {
    try {
      const payload: CreateDebtInput | UpdateDebtInput = {
        name: values.name.trim(),
        type: values.type,
        totalAmount: values.totalAmount,
        contactName: values.contactName.trim(),
        startDate: new Date(values.startDate).toISOString(),
        dueDate: new Date(values.dueDate).toISOString(),
        interestRate: values.interestRate !== undefined ? Number(values.interestRate) : undefined,
        walletId: values.walletId || undefined,
        description: values.description?.trim() || undefined,
        note: values.note?.trim() || undefined,
        ...(isEditing ? {} : { status: DebtStatus.ACTIVE }),
      };

      await onSubmit(payload);
      toast.success(
        isEditing
          ? "Cập nhật khoản nợ thành công!"
          : values.type === DebtType.LOAN
            ? "Tạo khoản vay (Cần trả) thành công!"
            : "Tạo khoản cho vay (Cần thu) thành công!",
      );
      onOpenChange(false);
    } catch (err: unknown) {
      let msg = "Có lỗi xảy ra, vui lòng thử lại!";
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                selectedType === DebtType.LOAN
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}
            >
              {selectedType === DebtType.LOAN ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? t("dialogEditTitle") : t("dialogCreateTitle")}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing ? t("dialogEditSubtitle") : t("dialogCreateSubtitle")}
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

        {/* Body Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Chọn Loại nợ: LOAN hoặc DEBT */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("debtType")} <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("type", DebtType.LOAN)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-semibold transition-all ${
                  selectedType === DebtType.LOAN
                    ? "bg-rose-500/15 border-rose-500 text-rose-300 shadow-md shadow-rose-500/20"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-rose-400" />
                <span>{t("loanOption")}</span>
              </button>

              <button
                type="button"
                onClick={() => setValue("type", DebtType.DEBT)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-semibold transition-all ${
                  selectedType === DebtType.DEBT
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span>{t("debtOption")}</span>
              </button>
            </div>
          </div>

          {/* Tên khoản nợ */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("name")} <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder={t("namePlaceholder")}
              {...register("name")}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {errors.name && (
              <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Người liên hệ / Chủ nợ / Người vay */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {selectedType === DebtType.LOAN ? t("lenderLabel") : t("borrowerLabel")}{" "}
              <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t("contactPlaceholder")}
                {...register("contactName")}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {errors.contactName && (
              <p className="text-xs text-rose-400 mt-1">{errors.contactName.message}</p>
            )}
          </div>

          {/* Tổng số tiền nợ & Lãi suất */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("totalAmount")} <span className="text-rose-400">*</span>
              </label>
              <Controller
                name="totalAmount"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white font-medium placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                )}
              />
              {errors.totalAmount && (
                <p className="text-xs text-rose-400 mt-1">{errors.totalAmount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("interest")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder={t("interestPlaceholder")}
                  {...register("interestRate", { valueAsNumber: true })}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Ngày bắt đầu & Ngày hẹn trả */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("startDate")} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register("startDate")}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              {errors.startDate && (
                <p className="text-xs text-rose-400 mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("dueDate")} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register("dueDate")}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              {errors.dueDate && (
                <p className="text-xs text-rose-400 mt-1">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Ví liên kết */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("wallet")}
            </label>
            <div className="relative">
              <select
                {...register("walletId")}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">{t("noLinkedWallet")}</option>
                {(wallets as Wallet[]).map((w: Wallet) => (
                  <option key={w.id} value={w.id}>
                    {getLocalizedName(w, locale)} ({Number(w.balance).toLocaleString("vi-VN")} ₫)
                  </option>
                ))}
              </select>
              <WalletIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("description")}
            </label>
            <textarea
              rows={2}
              placeholder={t("notePlaceholder")}
              {...register("note")}
              className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEditing ? t("saveChanges") : t("createDebtBtn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
