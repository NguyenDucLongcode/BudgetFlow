"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import {
  X,
  Calendar,
  CalendarClock,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { CurrencyInput } from "@/src/components/ui/currency-input";
import { useWallets } from "@/src/client/wallet/wallet.hooks";
import { useCategories } from "@/src/client/category/category.hooks";
import { RecurringFrequency, TransactionType } from "@/src/types/enums";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedName } from "@/src/utils";
import type {
  RecurringTransaction,
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
  Wallet,
  TransactionCategory,
} from "@/src/types/api";

function addInterval(
  dateStr: string,
  frequency: RecurringFrequency,
  interval: number
): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split("T")[0];
  }
  const safeInterval = Math.max(1, Number(interval) || 1);
  const next = new Date(date);

  switch (frequency) {
    case RecurringFrequency.DAILY:
      next.setDate(next.getDate() + safeInterval);
      break;
    case RecurringFrequency.WEEKLY:
      next.setDate(next.getDate() + safeInterval * 7);
      break;
    case RecurringFrequency.MONTHLY:
      next.setMonth(next.getMonth() + safeInterval);
      break;
    case RecurringFrequency.YEARLY:
      next.setFullYear(next.getFullYear() + safeInterval);
      break;
  }

  return next.toISOString().split("T")[0];
}

function toDateInputValue(isoOrDate?: string | null): string {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

interface RecurringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionToEdit?: RecurringTransaction | null;
  onSubmit: (
    data: CreateRecurringTransactionInput | UpdateRecurringTransactionInput
  ) => Promise<void>;
  isSubmitting?: boolean;
}

export function RecurringDialog({
  open,
  onOpenChange,
  transactionToEdit,
  onSubmit,
  isSubmitting = false,
}: RecurringDialogProps) {
  const t = useTranslations("recurring");
  const locale = useLocale();
  const isEditing = Boolean(transactionToEdit);
  const skipNextAutoCalcRef = useRef(false);

  const { data: wallets = [] } = useWallets();

  const recurringSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().trim().min(1, t("validationNameRequired")).max(150),
          amount: z.number().min(1000, t("validationAmountMin")),
          type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
          walletId: z.string().min(1, t("validationWalletRequired")),
          categoryId: z.string().optional(),
          frequency: z.nativeEnum(RecurringFrequency),
          interval: z.number().int().min(1, t("validationIntervalMin")),
          startDate: z.string().min(1, t("validationStartDateRequired")),
          nextRunDate: z.string().min(1, t("validationNextRunDateRequired")),
          endDate: z.string().optional(),
          description: z.string().max(500).optional(),
        })
        .refine(
          (data) => {
            if (!data.endDate) return true;
            return new Date(data.endDate) > new Date(data.startDate);
          },
          {
            message: t("validationEndDateAfterStart"),
            path: ["endDate"],
          }
        ),
    [t]
  );

  type RecurringFormValues = z.infer<typeof recurringSchema>;

  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      name: "",
      amount: 0,
      type: TransactionType.EXPENSE,
      walletId: "",
      categoryId: "",
      frequency: RecurringFrequency.MONTHLY,
      interval: 1,
      startDate: todayStr,
      nextRunDate: addInterval(todayStr, RecurringFrequency.MONTHLY, 1),
      endDate: "",
      description: "",
    },
  });

  const selectedType = watch("type");
  const watchedStartDate = watch("startDate");
  const watchedFrequency = watch("frequency");
  const watchedInterval = watch("interval");

  const categoryFilterType =
    selectedType === TransactionType.INCOME ? "INCOME" : "EXPENSE";
  const { data: categories = [] } = useCategories(categoryFilterType);

  // Initialize form when dialog opens
  useEffect(() => {
    if (!open) return;

    skipNextAutoCalcRef.current = true;
    const defaultStart = new Date().toISOString().split("T")[0];

    if (transactionToEdit) {
      const startVal =
        toDateInputValue(transactionToEdit.startDate) || defaultStart;
      reset({
        name: transactionToEdit.name,
        amount: Number(transactionToEdit.amount),
        type:
          transactionToEdit.type === TransactionType.INCOME
            ? TransactionType.INCOME
            : TransactionType.EXPENSE,
        walletId: transactionToEdit.walletId,
        categoryId: transactionToEdit.categoryId || "",
        frequency: transactionToEdit.frequency || RecurringFrequency.MONTHLY,
        interval: transactionToEdit.interval || 1,
        startDate: startVal,
        nextRunDate:
          toDateInputValue(transactionToEdit.nextRunDate) ||
          addInterval(
            startVal,
            transactionToEdit.frequency || RecurringFrequency.MONTHLY,
            transactionToEdit.interval || 1
          ),
        endDate: toDateInputValue(transactionToEdit.endDate),
        description: transactionToEdit.description || "",
      });
    } else {
      reset({
        name: "",
        amount: 0,
        type: TransactionType.EXPENSE,
        walletId: wallets[0]?.id || "",
        categoryId: "",
        frequency: RecurringFrequency.MONTHLY,
        interval: 1,
        startDate: defaultStart,
        nextRunDate: addInterval(defaultStart, RecurringFrequency.MONTHLY, 1),
        endDate: "",
        description: "",
      });
    }
  }, [open, transactionToEdit, reset, wallets]);

  // Auto-calculate nextRunDate whenever startDate, frequency, or interval changes
  useEffect(() => {
    if (!open) return;
    if (skipNextAutoCalcRef.current) {
      skipNextAutoCalcRef.current = false;
      return;
    }
    if (!watchedStartDate || !watchedFrequency) return;

    const computedNext = addInterval(
      watchedStartDate,
      watchedFrequency,
      Number(watchedInterval) || 1
    );
    setValue("nextRunDate", computedNext, { shouldValidate: true });
  }, [open, watchedStartDate, watchedFrequency, watchedInterval, setValue]);

  const handleTypeChange = (nextType: TransactionType.INCOME | TransactionType.EXPENSE) => {
    if (nextType !== selectedType) {
      setValue("type", nextType);
      setValue("categoryId", "");
    }
  };

  const onFormSubmit = async (values: RecurringFormValues) => {
    try {
      const selectedWallet = wallets.find((w: Wallet) => w.id === values.walletId);
      const payload: CreateRecurringTransactionInput | UpdateRecurringTransactionInput = {
        name: values.name.trim(),
        amount: values.amount,
        type: values.type,
        walletId: values.walletId,
        currency: selectedWallet?.currency || "VND",
        frequency: values.frequency,
        interval: Number(values.interval) || 1,
        startDate: new Date(values.startDate).toISOString(),
        nextRunDate: new Date(values.nextRunDate).toISOString(),
        ...(values.categoryId ? { categoryId: values.categoryId } : {}),
        ...(values.endDate
          ? { endDate: new Date(values.endDate).toISOString() }
          : isEditing
          ? { endDate: null }
          : {}),
        ...(values.description?.trim()
          ? { description: values.description.trim() }
          : {}),
      };

      await onSubmit(payload);
      toast.success(isEditing ? t("toastUpdated") : t("toastCreated"));
      onOpenChange(false);
    } catch (err: unknown) {
      let msg = t("toastError");
      if (typeof err === "object" && err !== null && "response" in err) {
        const res = (err as Record<string, unknown>).response as
          | Record<string, unknown>
          | undefined;
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? t("editTitle") : t("createTitle")}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing ? t("editSubtitle") : t("createSubtitle")}
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

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Transaction Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("typeLabel")} <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleTypeChange(TransactionType.EXPENSE)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  selectedType === TransactionType.EXPENSE
                    ? "bg-rose-500/15 border-rose-500/50 text-rose-400"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                {t("expense")}
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange(TransactionType.INCOME)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  selectedType === TransactionType.INCOME
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                {t("income")}
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("nameLabel")} <span className="text-rose-400">*</span>
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

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("amountLabel")} <span className="text-rose-400">*</span>
            </label>
            <Controller
              name="amount"
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
            {errors.amount && (
              <p className="text-xs text-rose-400 mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Wallet & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("walletLabel")} <span className="text-rose-400">*</span>
              </label>
              <select
                {...register("walletId")}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">{t("selectWalletPlaceholder")}</option>
                {wallets.map((wallet: Wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {getLocalizedName(wallet, locale)}
                  </option>
                ))}
              </select>
              {errors.walletId && (
                <p className="text-xs text-rose-400 mt-1">
                  {errors.walletId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("categoryLabel")}
              </label>
              <select
                {...register("categoryId")}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">{t("selectCategoryPlaceholder")}</option>
                {categories.map((category: TransactionCategory) => (
                  <option key={category.id} value={category.id}>
                    {getLocalizedName(category, locale)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Frequency & Interval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("frequencyLabel")} <span className="text-rose-400">*</span>
              </label>
              <select
                {...register("frequency")}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value={RecurringFrequency.DAILY}>{t("daily")}</option>
                <option value={RecurringFrequency.WEEKLY}>{t("weekly")}</option>
                <option value={RecurringFrequency.MONTHLY}>{t("monthly")}</option>
                <option value={RecurringFrequency.YEARLY}>{t("yearly")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("intervalLabel")} <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                {...register("interval", { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {errors.interval && (
                <p className="text-xs text-rose-400 mt-1">
                  {errors.interval.message}
                </p>
              )}
            </div>
          </div>

          {/* Start Date & Next Run Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("startDateLabel")} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register("startDate")}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
              {errors.startDate && (
                <p className="text-xs text-rose-400 mt-1">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("nextRunDateLabel")} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register("nextRunDate")}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {t("autoCalculatedHint")}
              </p>
              {errors.nextRunDate && (
                <p className="text-xs text-rose-400 mt-1">
                  {errors.nextRunDate.message}
                </p>
              )}
            </div>
          </div>

          {/* End Date (optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("endDateLabel")}
            </label>
            <div className="relative">
              <input
                type="date"
                {...register("endDate")}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
            {errors.endDate && (
              <p className="text-xs text-rose-400 mt-1">
                {errors.endDate.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("descriptionLabel")}
            </label>
            <textarea
              rows={2}
              placeholder={t("descriptionPlaceholder")}
              {...register("description")}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition-colors shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSubmitting ? t("saving") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
