"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet as WalletIcon,
  Tag,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { CurrencyInput } from "@/src/components/ui/currency-input";
import { useWallets } from "@/src/client/wallet/wallet.hooks";
import { useCategories } from "@/src/client/category/category.hooks";
import { TransactionType } from "@/src/types/enums";
import { getLocalizedName } from "@/src/utils";
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/src/types/api";

const transactionSchema = z.object({
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
  amount: z.number().min(1, "Số tiền phải lớn hơn 0"),
  walletId: z.string().min(1, "Vui lòng chọn ví"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  date: z.string().min(1, "Vui lòng chọn ngày giao dịch"),
  description: z.string().max(255).optional(),
  note: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionToEdit?: Transaction | null;
  onSubmit: (data: CreateTransactionInput | UpdateTransactionInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function TransactionDialog({
  open,
  onOpenChange,
  transactionToEdit,
  onSubmit,
  isSubmitting,
}: TransactionDialogProps) {
  const t = useTranslations("transactions");
  const locale = useLocale();
  const isEditing = Boolean(transactionToEdit);

  // Lấy danh sách ví (chỉ lấy ví chưa lưu trữ)
  const { data: wallets = [], isLoading: isLoadingWallets } = useWallets({
    isArchived: false,
  });

  const formatToLocalDateTime = (d: Date = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: TransactionType.EXPENSE,
      amount: 0,
      walletId: "",
      categoryId: "",
      date: formatToLocalDateTime(),
      description: "",
      note: "",
    },
  });

  const selectedType = watch("type");
  const selectedDate = watch("date");
  const selectedWalletId = watch("walletId");
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const selectedCurrency = selectedWallet?.currency ?? "VND";

  // Lấy danh mục phù hợp theo loại giao dịch đang chọn
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories(selectedType);

  // Kiểm tra ngày tương lai
  const isFutureDate = () => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return selected.getTime() > Date.now();
  };

  useEffect(() => {
    if (open) {
      if (transactionToEdit) {
        const txDate = transactionToEdit.date
          ? formatToLocalDateTime(new Date(transactionToEdit.date))
          : formatToLocalDateTime();

        reset({
          type:
            transactionToEdit.type === TransactionType.INCOME
              ? TransactionType.INCOME
              : TransactionType.EXPENSE,
          amount: Number(transactionToEdit.amount) || 0,
          walletId: transactionToEdit.walletId || "",
          categoryId: transactionToEdit.categoryId || "",
          date: txDate,
          description: transactionToEdit.description || "",
          note: transactionToEdit.note || "",
        });
      } else {
        // Tạo mới: Mặc định ví đầu tiên (hoặc ví mặc định) nếu có
        const defaultWallet =
          wallets.find((w) => w.isDefault) || wallets[0];

        reset({
          type: TransactionType.EXPENSE,
          amount: 0,
          walletId: defaultWallet ? defaultWallet.id : "",
          categoryId: "",
          date: formatToLocalDateTime(),
          description: "",
          note: "",
        });
      }
    }
  }, [open, transactionToEdit, reset, wallets]);

  // Tự động set ví mặc định khi danh sách ví tải xong nếu chưa chọn
  useEffect(() => {
    if (open && !transactionToEdit && wallets.length > 0) {
      const currentWallet = watch("walletId");
      if (!currentWallet) {
        const def = wallets.find((w) => w.isDefault) || wallets[0];
        if (def) setValue("walletId", def.id);
      }
    }
  }, [wallets, open, transactionToEdit, setValue, watch]);

  if (!open) return null;

  const onFormSubmit = async (values: TransactionFormValues) => {
    const payload: CreateTransactionInput = {
      type: values.type,
      amount: values.amount,
      walletId: values.walletId,
      categoryId: values.categoryId,
      date: new Date(values.date).toISOString(),
      ...(values.description?.trim()
        ? { description: values.description.trim() }
        : {}),
      ...(values.note?.trim() ? { note: values.note.trim() } : {}),
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-[#111827] shadow-2xl overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/50">
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? t("editTitle") : t("createTitle")}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditing ? t("editSubtitle") : t("createSubtitle")}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-5">
          {/* 1. Tabs Loại giao dịch (Chi tiêu / Thu nhập) */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setValue("type", TransactionType.EXPENSE);
                setValue("categoryId", ""); // Reset category khi đổi type
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
                selectedType === TransactionType.EXPENSE
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>{t("expense")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setValue("type", TransactionType.INCOME);
                setValue("categoryId", ""); // Reset category khi đổi type
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
                selectedType === TransactionType.INCOME
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{t("income")}</span>
            </button>
          </div>

          {/* 2. Nhập Số tiền (CurrencyInput) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("amountLabel")} <span className="text-rose-400">*</span>
            </label>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <CurrencyInput
                  value={field.value}
                  onChange={field.onChange}
                  currency={selectedCurrency}
                  placeholder="0"
                  className="w-full text-lg font-bold"
                />
              )}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* 3. Grid: Ví thanh toán & Danh mục */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Chọn Ví */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <WalletIcon className="w-3.5 h-3.5 text-slate-400" />
                  {t("walletLabel")}
                  <span className="text-rose-400">*</span>
                </span>
              </label>
              <select
                {...register("walletId")}
                disabled={isLoadingWallets}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="" disabled>
                  {isLoadingWallets
                    ? t("loadingWallets")
                    : t("selectWalletPlaceholder")}
                </option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id} className="bg-slate-900 text-slate-100">
                    {getLocalizedName(wallet, locale)} ({Number(wallet.balance).toLocaleString("en-US")}{" "}
                    {wallet.currency})
                  </option>
                ))}
              </select>
              {errors.walletId && (
                <p className="mt-1 text-xs text-rose-400">
                  {errors.walletId.message}
                </p>
              )}
            </div>

            {/* Chọn Danh mục */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {t("categoryLabel")}
                  <span className="text-rose-400">*</span>
                </span>
              </label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <select
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={isLoadingCategories}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="" disabled>
                      {isLoadingCategories
                        ? t("loadingCategories")
                        : t("selectCategoryPlaceholder")}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-100">
                        {cat.icon ? `${cat.icon} ` : ""}{getLocalizedName(cat, locale)}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.categoryId && (
                <p className="mt-1 text-xs text-rose-400">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          {/* 4. Ngày & Giờ giao dịch */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {t("dateTimeLabel")}
                <span className="text-rose-400">*</span>
              </span>
            </label>
            <input
              type="datetime-local"
              step="60"
              {...register("date")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
            />
            {errors.date && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.date.message}
              </p>
            )}

            {/* Note thông báo giao dịch tương lai */}
            {isFutureDate() && (
              <div className="mt-2 flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{t("futureNote")}</span>
              </div>
            )}
          </div>

          {/* 5. Mô tả giao dịch */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                {t("descriptionLabel")}
              </span>
            </label>
            <input
              type="text"
              {...register("description")}
              placeholder={t("descriptionPlaceholder")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("saving")}</span>
                </>
              ) : (
                <span>{t("save")}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
