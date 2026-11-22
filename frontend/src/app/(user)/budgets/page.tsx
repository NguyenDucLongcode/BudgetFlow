"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import { toast } from "react-toastify";
import {
  PieChart,
  Plus,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Wallet,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { MonthYearPicker } from "../transactions/components/MonthYearPicker";
import { BudgetCard } from "./components/BudgetCard";
import { BudgetDialog } from "./components/BudgetDialog";
import {
  useBudgets,
  useBudgetSummary,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "@/src/client/budget/budget.hooks";
import type {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "@/src/types/api";

export default function BudgetsPage() {
  const locale = useLocale();
  const dateLocale = locale === "vi" ? vi : enUS;

  // State chọn tháng / năm
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const selectedMonth = currentDate.getMonth() + 1;
  const selectedYear = currentDate.getFullYear();

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return (
      now.getFullYear() === selectedYear && now.getMonth() + 1 === selectedMonth
    );
  }, [selectedMonth, selectedYear]);

  // Tính khoảng ngày bắt đầu - kết thúc của tháng đang chọn
  const monthDateRange = useMemo(() => {
    const start = new Date(selectedYear, selectedMonth - 1, 1);
    const end = new Date(selectedYear, selectedMonth, 0);
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
  }, [selectedMonth, selectedYear]);

  // Fetch danh sách ngân sách theo tháng/năm
  const { data: budgetsData, isLoading: isLoadingBudgets } = useBudgets({
    month: selectedMonth,
    year: selectedYear,
    limit: 100,
  });

  // Fetch dữ liệu tổng quan ngân sách tháng này
  const { data: summaryData, isLoading: isLoadingSummary } = useBudgetSummary({
    month: selectedMonth,
    year: selectedYear,
  });

  const budgets = budgetsData?.budgets ?? [];

  // Mutations
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(selectedYear, selectedMonth - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(selectedYear, selectedMonth, 1));
  };

  const handleResetCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setDialogOpen(true);
  };

  const handleSubmitBudget = async (
    data: CreateBudgetInput | UpdateBudgetInput,
  ) => {
    try {
      if (editingBudget) {
        await updateMutation.mutateAsync({
          id: editingBudget.id,
          data: data as UpdateBudgetInput,
        });
        toast.success("Cập nhật ngân sách thành công!");
      } else {
        await createMutation.mutateAsync(data as CreateBudgetInput);
        toast.success("Tạo ngân sách mới thành công!");
      }
      setDialogOpen(false);
      setEditingBudget(null);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ??
        err?.data?.message ??
        err?.message;
      toast.error(
        Array.isArray(errorMessage)
          ? errorMessage.join(", ")
          : typeof errorMessage === "string"
            ? errorMessage
            : "Có lỗi xảy ra khi lưu ngân sách",
      );
    }
  };

  const handleDeleteBudget = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirmId);
      toast.success("Đã xóa ngân sách thành công!");
      setDeleteConfirmId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể xóa ngân sách");
    }
  };

  // Thống kê tổng quan
  const totalAllocated = Number(summaryData?.totalAllocated || 0);
  const totalSpent = Number(summaryData?.totalSpent || 0);
  const totalRemaining = Number(summaryData?.totalRemaining || 0);
  const overallPercent =
    totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
            Quản lý tài chính cá nhân
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-0.5">
            Ngân sách chi tiêu
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Thiết lập hạn mức chi tiêu theo tháng và nhận cảnh báo tự động khi chạm ngưỡng
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 px-5 py-2.5 rounded-2xl font-semibold transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Tạo ngân sách mới
        </Button>
      </div>

      {/* Month Navigator + MonthYearPicker */}
      <div className="relative z-30 flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-800 bg-[#111827]/80 backdrop-blur-md shadow-sm gap-2 flex-wrap">
        <button
          onClick={handlePrevMonth}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Tháng trước</span>
        </button>

        {/* Center: label + picker + reset */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-sm font-bold text-white capitalize">
            {format(currentDate, "MMMM yyyy", { locale: dateLocale })}
          </span>

          <MonthYearPicker
            value={currentDate}
            onChange={(d) => setCurrentDate(d)}
            locale={locale}
          />

          <button
            onClick={handleResetCurrentMonth}
            disabled={isCurrentMonth}
            title="Về tháng hiện tại"
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              isCurrentMonth
                ? "opacity-30 cursor-not-allowed text-slate-500"
                : "text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={handleNextMonth}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <span className="hidden sm:inline">Tháng sau</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng hạn mức */}
        <div className="p-5 rounded-3xl border border-slate-800 bg-[#111827]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">
              Tổng hạn mức
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {isLoadingSummary ? (
              <span className="text-sm font-normal text-slate-500">Đang tính...</span>
            ) : (
              `${totalAllocated.toLocaleString("vi-VN")} ₫`
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {summaryData?.totalBudgets || budgets.length} danh mục đã đặt hạn mức
          </p>
        </div>

        {/* Card 2: Đã chi tiêu */}
        <div className="p-5 rounded-3xl border border-slate-800 bg-[#111827]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">
              Tổng đã chi
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
            {isLoadingSummary ? (
              <span className="text-sm font-normal text-slate-500">Đang tính...</span>
            ) : (
              `${totalSpent.toLocaleString("vi-VN")} ₫`
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Chiếm {overallPercent}% tổng ngân sách
          </p>
        </div>

        {/* Card 3: Còn lại */}
        <div className="p-5 rounded-3xl border border-slate-800 bg-[#111827]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">
              Số tiền còn lại
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {isLoadingSummary ? (
              <span className="text-sm font-normal text-slate-500">Đang tính...</span>
            ) : (
              `${totalRemaining.toLocaleString("vi-VN")} ₫`
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Hạn mức khả dụng còn lại
          </p>
        </div>

        {/* Card 4: Tiến độ tổng thể */}
        <div className="p-5 rounded-3xl border border-slate-800 bg-[#111827]/80 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">
              Tiến độ tháng
            </span>
            <span
              className={`text-xs font-bold font-mono ${
                overallPercent > 100
                  ? "text-rose-400"
                  : overallPercent >= 80
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {overallPercent}%
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden my-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercent > 100
                  ? "bg-rose-500"
                  : overallPercent >= 80
                  ? "bg-amber-400"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(overallPercent, 100)}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 truncate">
            {overallPercent > 100
              ? "Cảnh báo: Đã vượt tổng ngân sách!"
              : overallPercent >= 80
              ? "Lưu ý: Sắp chạm tổng hạn mức"
              : "Chi tiêu đang trong mức an toàn"}
          </p>
        </div>
      </div>

      {/* Danh sách Ngân sách (Grid Cards 2-3 cột) */}
      {isLoadingBudgets ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Đang tải danh sách ngân sách...</span>
        </div>
      ) : budgets.length === 0 ? (
        /* Empty State */
        <div className="p-10 sm:p-14 rounded-3xl border border-slate-800 bg-[#111827]/80 backdrop-blur-md text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <PieChart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Chưa có ngân sách nào trong tháng {selectedMonth}/{selectedYear}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              Thiết lập ngân sách giúp bạn kiểm soát chi tiêu và tự động nhận cảnh báo khi sắp vượt ngưỡng.
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 px-5 py-2.5 rounded-2xl text-xs font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tạo ngân sách đầu tiên
          </Button>
        </div>
      ) : (
        /* Grid Cards 2-3 cột */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={handleOpenEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
          ))}
        </div>
      )}

      {/* Dialog Tạo / Sửa ngân sách */}
      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        budgetToEdit={editingBudget}
        defaultDateRange={monthDateRange}
        onSubmit={handleSubmitBudget}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Modal Xác nhận Xóa */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-2xl z-10 space-y-4 animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Xác nhận xóa ngân sách</h3>
              <p className="text-xs text-slate-400 mt-1">
                Bạn có chắc chắn muốn xóa ngân sách này? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteBudget}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Xóa ngân sách</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
