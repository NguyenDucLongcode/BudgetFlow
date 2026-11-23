"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import {
  X,
  Calendar,
  Target,
  Loader2,
  Wallet as WalletIcon,
  Flame,
} from "lucide-react";
import { CurrencyInput } from "@/src/components/ui/currency-input";
import { useWallets } from "@/src/client/wallet/wallet.hooks";
import { GoalPriority, GoalStatus } from "@/src/types/enums";
import type {
  Goal,
  Wallet,
  CreateGoalInput,
  UpdateGoalInput,
} from "@/src/types/api";

const goalSchema = z
  .object({
    name: z.string().min(1, "Vui lòng nhập tên mục tiêu").max(150),
    targetAmount: z.number().min(1000, "Số tiền mục tiêu tối thiểu là 1,000 ₫"),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    targetDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
    priority: z.nativeEnum(GoalPriority),
    walletId: z.string().optional(),
    description: z.string().max(255).optional(),
    notes: z.string().max(500).optional(),
    color: z.string().optional(),
  })
  .refine((data) => new Date(data.targetDate) > new Date(data.startDate), {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["targetDate"],
  });

type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalToEdit?: Goal | null;
  onSubmit: (data: CreateGoalInput | UpdateGoalInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function GoalDialog({
  open,
  onOpenChange,
  goalToEdit,
  onSubmit,
  isSubmitting = false,
}: GoalDialogProps) {
  const isEditing = Boolean(goalToEdit);
  const { data: wallets = [] } = useWallets();

  const getDefaultDates = () => {
    const today = new Date();
    const future = new Date();
    future.setMonth(future.getMonth() + 3);
    return {
      startDate: today.toISOString().split("T")[0],
      targetDate: future.toISOString().split("T")[0],
    };
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      targetAmount: 10000000,
      startDate: getDefaultDates().startDate,
      targetDate: getDefaultDates().targetDate,
      priority: GoalPriority.MEDIUM,
      walletId: "",
      description: "",
      notes: "",
      color: "#6366F1",
    },
  });

  useEffect(() => {
    if (open) {
      if (goalToEdit) {
        reset({
          name: goalToEdit.name,
          targetAmount: Number(goalToEdit.targetAmount),
          startDate: goalToEdit.startDate
            ? new Date(goalToEdit.startDate).toISOString().split("T")[0]
            : getDefaultDates().startDate,
          targetDate: goalToEdit.targetDate
            ? new Date(goalToEdit.targetDate).toISOString().split("T")[0]
            : getDefaultDates().targetDate,
          priority: goalToEdit.priority || GoalPriority.MEDIUM,
          walletId: goalToEdit.walletId || "",
          description: goalToEdit.description || "",
          notes: goalToEdit.notes || "",
          color: goalToEdit.color || "#6366F1",
        });
      } else {
        const defaults = getDefaultDates();
        reset({
          name: "",
          targetAmount: 10000000,
          startDate: defaults.startDate,
          targetDate: defaults.targetDate,
          priority: GoalPriority.MEDIUM,
          walletId: "",
          description: "",
          notes: "",
          color: "#6366F1",
        });
      }
    }
  }, [open, goalToEdit, reset]);

  const onFormSubmit = async (values: GoalFormValues) => {
    try {
      const payload: CreateGoalInput | UpdateGoalInput = {
        name: values.name.trim(),
        targetAmount: values.targetAmount,
        startDate: new Date(values.startDate).toISOString(),
        targetDate: new Date(values.targetDate).toISOString(),
        priority: values.priority,
        walletId: values.walletId || undefined,
        description: values.description?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
        color: values.color || "#6366F1",
        ...(isEditing ? {} : { status: GoalStatus.IN_PROGRESS }),
      };

      await onSubmit(payload);
      toast.success(
        isEditing
          ? "Cập nhật mục tiêu thành công!"
          : "Tạo mục tiêu tiết kiệm thành công!",
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
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? "Chỉnh sửa mục tiêu" : "Tạo mục tiêu mới"}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing
                  ? "Cập nhật thông tin tiến độ tích lũy"
                  : "Đặt cột mốc tài chính bạn muốn hoàn thành"}
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

        {/* Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Tên mục tiêu */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tên mục tiêu <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="VD: Quỹ khẩn cấp, Mua MacBook, Mua xe..."
                {...register("name")}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Số tiền mục tiêu */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Số tiền mục tiêu (₫) <span className="text-rose-400">*</span>
            </label>
            <Controller
              name="targetAmount"
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
            {errors.targetAmount && (
              <p className="text-xs text-rose-400 mt-1">{errors.targetAmount.message}</p>
            )}
          </div>

          {/* Ngày bắt đầu & Ngày kết thúc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ngày bắt đầu <span className="text-rose-400">*</span>
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
                Ngày kết thúc <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register("targetDate")}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              {errors.targetDate && (
                <p className="text-xs text-rose-400 mt-1">{errors.targetDate.message}</p>
              )}
            </div>
          </div>

          {/* Độ ưu tiên & Ví liên kết */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Độ ưu tiên
              </label>
              <div className="relative">
                <select
                  {...register("priority")}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={GoalPriority.LOW}>Thấp (Low)</option>
                  <option value={GoalPriority.MEDIUM}>Trung bình (Medium)</option>
                  <option value={GoalPriority.HIGH}>Cao (High)</option>
                  <option value={GoalPriority.URGENT}>Khẩn cấp (Urgent)</option>
                </select>
                <Flame className="w-4 h-4 text-amber-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ví tích lũy mặc định
              </label>
              <div className="relative">
                <select
                  {...register("walletId")}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Không liên kết ví cụ thể --</option>
                  {(wallets as Wallet[]).map((w: Wallet) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({Number(w.balance).toLocaleString("vi-VN")} ₫)
                    </option>
                  ))}
                </select>
                <WalletIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mô tả ngắn
            </label>
            <input
              type="text"
              placeholder="VD: Dành cho chuyến đi Hàn Quốc cuối năm"
              {...register("description")}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ghi chú thêm
            </label>
            <textarea
              rows={2}
              placeholder="Ghi chú kế hoạch tiết kiệm..."
              {...register("notes")}
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
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEditing ? "Lưu thay đổi" : "Tạo mục tiêu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
