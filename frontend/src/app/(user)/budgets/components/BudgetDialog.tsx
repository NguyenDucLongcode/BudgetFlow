"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  X,
  Calendar,
  Tag,
  FileText,
  Bell,
  BellOff,
  Loader2,
  PieChart,
} from "lucide-react";
import { CurrencyInput } from "@/src/components/ui/currency-input";
import { useCategories } from "@/src/client/category/category.hooks";
import { BudgetPeriod, BudgetType } from "@/src/types/enums";
import type {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "@/src/types/api";

const budgetSchema = z
  .object({
    categoryId: z.string().min(1, "Vui lòng chọn danh mục chi tiêu"),
    amount: z.number().min(1000, "Hạn mức tối thiểu là 1,000 ₫"),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
    alertThreshold: z
      .number()
      .min(1, "Ngưỡng cảnh báo tối thiểu 1%")
      .max(100, "Ngưỡng cảnh báo tối đa 100%"),
    isAlertEnabled: z.boolean(),
    description: z.string().max(255).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "Ngày kết thúc phải sau hoặc cùng ngày bắt đầu",
    path: ["endDate"],
  });

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetToEdit?: Budget | null;
  defaultDateRange?: { startDate: string; endDate: string };
  onSubmit: (data: CreateBudgetInput | UpdateBudgetInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function BudgetDialog({
  open,
  onOpenChange,
  budgetToEdit,
  defaultDateRange,
  onSubmit,
  isSubmitting = false,
}: BudgetDialogProps) {
  const isEditing = Boolean(budgetToEdit);

  // Chỉ lấy danh mục EXPENSE
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories("EXPENSE");

  // Tính ngày đầu tháng và cuối tháng mặc định dạng YYYY-MM-DD
  const getDefaultDates = () => {
    if (defaultDateRange) return defaultDateRange;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    return {
      startDate: fmt(start),
      endDate: fmt(end),
    };
  };

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: "",
      amount: 0,
      startDate: getDefaultDates().startDate,
      endDate: getDefaultDates().endDate,
      alertThreshold: 80,
      isAlertEnabled: true,
      description: "",
      notes: "",
    },
  });

  const isAlertEnabled = watch("isAlertEnabled");
  const alertThreshold = watch("alertThreshold");
  const amount = watch("amount");

  const calculatedThresholdAmount = useMemo(() => {
    if (!amount || !alertThreshold) return 0;
    return Math.round((amount * alertThreshold) / 100);
  }, [amount, alertThreshold]);

  useEffect(() => {
    if (open) {
      if (budgetToEdit) {
        const fmtDate = (dStr?: string) => {
          if (!dStr) return "";
          return dStr.split("T")[0];
        };

        reset({
          categoryId: budgetToEdit.categoryId,
          amount: Number(budgetToEdit.amount) || 0,
          startDate: fmtDate(budgetToEdit.startDate),
          endDate: fmtDate(budgetToEdit.endDate),
          alertThreshold: Number(budgetToEdit.alertThreshold) || 80,
          isAlertEnabled: budgetToEdit.isAlertEnabled ?? true,
          description: budgetToEdit.description || "",
          notes: budgetToEdit.notes || "",
        });
      } else {
        const dates = getDefaultDates();
        reset({
          categoryId: "",
          amount: 0,
          startDate: dates.startDate,
          endDate: dates.endDate,
          alertThreshold: 80,
          isAlertEnabled: true,
          description: "",
          notes: "",
        });
      }
    }
  }, [open, budgetToEdit, reset]);

  const onFormSubmit = async (values: BudgetFormValues) => {
    // Format ISO string cho startDate và endDate
    const startIso = `${values.startDate}T00:00:00.000Z`;
    const endIso = `${values.endDate}T23:59:59.999Z`;

    const payload: CreateBudgetInput | UpdateBudgetInput = {
      categoryId: values.categoryId,
      amount: values.amount,
      startDate: startIso,
      endDate: endIso,
      period: BudgetPeriod.MONTHLY,
      type: BudgetType.SPENDING,
      alertThreshold: values.alertThreshold,
      isAlertEnabled: values.isAlertEnabled,
      description: values.description?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    };

    await onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-[#111827] shadow-2xl overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-200 my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? "Chỉnh sửa ngân sách" : "Tạo ngân sách mới"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing
                  ? "Cập nhật thông tin và hạn mức ngân sách"
                  : "Thiết lập hạn mức chi tiêu để kiểm soát tài chính"}
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
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          {/* 1. Chọn Danh mục (chỉ EXPENSE) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Danh mục chi tiêu
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
                      ? "Đang tải danh mục..."
                      : "Chọn danh mục chi tiêu..."}
                  </option>
                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      className="bg-slate-900 text-slate-100"
                    >
                      {cat.icon ? `${cat.icon} ` : ""}{cat.name}
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

          {/* 2. Hạn mức ngân sách (CurrencyInput) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Số tiền hạn mức (₫)
              <span className="text-rose-400">*</span>
            </label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value}
                  onChange={field.onChange}
                  currency="VND"
                  placeholder="Nhập số tiền hạn mức..."
                  className="text-lg font-bold text-white bg-slate-900/90 border-slate-700 focus:border-indigo-500"
                />
              )}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* 3. Khoảng thời gian: Từ ngày - Đến ngày */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Từ ngày
                  <span className="text-rose-400">*</span>
                </span>
              </label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-rose-400">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Đến ngày
                  <span className="text-rose-400">*</span>
                </span>
              </label>
              <input
                type="date"
                {...register("endDate")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
              />
              {errors.endDate && (
                <p className="mt-1 text-xs text-rose-400">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* 4. Cảnh báo & Ngưỡng cảnh báo */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isAlertEnabled ? (
                  <Bell className="w-4 h-4 text-amber-400" />
                ) : (
                  <BellOff className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Cảnh báo chi tiêu tự động
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Gửi thông báo & WebSocket khi đạt ngưỡng
                  </span>
                </div>
              </div>

              {/* Switch Toggle */}
              <Controller
                name="isAlertEnabled"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={field.value}
                    onClick={() => field.onChange(!field.value)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      field.value ? "bg-indigo-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        field.value ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                )}
              />
            </div>

            {/* Ngưỡng cảnh báo (%) */}
            {isAlertEnabled && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ngưỡng cảnh báo (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      {...register("alertThreshold", { valueAsNumber: true })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      %
                    </span>
                  </div>
                  {errors.alertThreshold && (
                    <p className="mt-1 text-xs text-rose-400">
                      {errors.alertThreshold.message}
                    </p>
                  )}
                </div>

                <div className="text-right text-xs text-slate-400 pt-3">
                  <span>Cảnh báo khi chi:</span>
                  <div className="font-semibold text-amber-400 text-sm font-mono mt-0.5">
                    {calculatedThresholdAmount.toLocaleString("vi-VN")} ₫
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Ghi chú / Mô tả */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Mô tả (tuỳ chọn)
              </span>
            </label>
            <input
              type="text"
              {...register("description")}
              placeholder="VD: Ngân sách ăn uống tháng này..."
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
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>{isEditing ? "Cập nhật" : "Tạo ngân sách"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
