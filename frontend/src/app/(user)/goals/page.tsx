"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Target,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  useGoals,
  useGoalSummary,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
} from "@/src/client/goal";
import { GoalStatus } from "@/src/types/enums";
import type { Goal, CreateGoalInput, UpdateGoalInput } from "@/src/types/api";
import {
  GoalCard,
  GoalDialog,
  ContributeDialog,
  GoalSummaryStats,
} from "./components";
import { toast } from "react-toastify";

type FilterTab = "ALL" | "IN_PROGRESS" | "COMPLETED";

export default function GoalsPage() {
  const t = useTranslations("userLayout");

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialogs state
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  const [contributeDialogOpen, setContributeDialogOpen] = useState(false);
  const [selectedGoalForContribute, setSelectedGoalForContribute] = useState<Goal | null>(null);

  const [deleteConfirmGoal, setDeleteConfirmGoal] = useState<Goal | null>(null);

  // Queries & Mutations
  const { data: goalsData, isLoading, isError } = useGoals({
    limit: 100,
    sortBy: "targetDate",
    order: "asc",
  });
  const { data: summaryData } = useGoalSummary();

  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();

  const allGoals = goalsData?.goals || [];

  // Client-side filtering for fast, responsive UI
  const filteredGoals = useMemo(() => {
    return allGoals.filter((goal) => {
      // Filter by Tab
      if (activeTab === "IN_PROGRESS") {
        if (goal.status === GoalStatus.COMPLETED) return false;
      } else if (activeTab === "COMPLETED") {
        if (goal.status !== GoalStatus.COMPLETED) return false;
      }

      // Filter by Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = goal.name.toLowerCase().includes(query);
        const matchDesc = goal.description?.toLowerCase().includes(query);
        const matchNotes = goal.notes?.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchNotes) return false;
      }

      return true;
    });
  }, [allGoals, activeTab, searchQuery]);

  // Handlers
  const handleOpenCreate = () => {
    setGoalToEdit(null);
    setGoalDialogOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setGoalToEdit(goal);
    setGoalDialogOpen(true);
  };

  const handleOpenContribute = (goal: Goal) => {
    setSelectedGoalForContribute(goal);
    setContributeDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateGoalInput | UpdateGoalInput) => {
    if (goalToEdit) {
      await updateGoalMutation.mutateAsync({
        id: goalToEdit.id,
        data: data as UpdateGoalInput,
      });
    } else {
      await createGoalMutation.mutateAsync(data as CreateGoalInput);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmGoal) return;
    try {
      await deleteGoalMutation.mutateAsync(deleteConfirmGoal.id);
      toast.success(`Đã xóa mục tiêu "${deleteConfirmGoal.name}"!`);
      setDeleteConfirmGoal(null);
    } catch (err: unknown) {
      let msg = "Không thể xóa mục tiêu, vui lòng thử lại!";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Target className="w-7 h-7 text-indigo-400" />
            <span>{t("goals")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Đặt mục tiêu tài chính, tích lũy từng ngày và theo dõi tiến độ hoàn thành
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mục tiêu mới</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <GoalSummaryStats
        summary={summaryData}
        totalGoalsCount={allGoals.length}
      />

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Tabs: Tất cả, Đang thực hiện, Đã hoàn thành */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "ALL"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Tất cả ({allGoals.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("IN_PROGRESS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "IN_PROGRESS"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              Đang thực hiện (
              {allGoals.filter((g) => g.status !== GoalStatus.COMPLETED).length}
              )
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("COMPLETED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "COMPLETED"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Đã hoàn thành (
              {allGoals.filter((g) => g.status === GoalStatus.COMPLETED).length}
              )
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Tìm theo tên mục tiêu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Grid Cards Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-slate-800 rounded w-1/3" />
                </div>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full" />
              <div className="flex justify-between">
                <div className="h-3 bg-slate-800 rounded w-1/4" />
                <div className="h-3 bg-slate-800 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5 text-center text-rose-300">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
          <p className="font-semibold text-sm">Không thể tải danh sách mục tiêu</p>
          <p className="text-xs text-slate-400 mt-1">Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.</p>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl border border-slate-800 bg-[#111827]/80 backdrop-blur-sm text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            {searchQuery
              ? "Không tìm thấy mục tiêu nào phù hợp"
              : activeTab === "COMPLETED"
                ? "Chưa có mục tiêu nào hoàn thành"
                : "Chưa có mục tiêu tiết kiệm nào"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2">
            {searchQuery
              ? "Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc tìm kiếm."
              : "Bắt đầu đặt một mục tiêu tài chính cụ thể (mua nhà, mua xe, du lịch...) để theo dõi số tiền tiết kiệm hàng tháng."}
          </p>
          {!searchQuery && activeTab !== "COMPLETED" && (
            <Button
              onClick={handleOpenCreate}
              className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 px-5 py-2.5 rounded-xl text-xs font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tạo mục tiêu đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onContribute={handleOpenContribute}
              onEdit={handleOpenEdit}
              onDelete={(g) => setDeleteConfirmGoal(g)}
            />
          ))}
        </div>
      )}

      {/* Goal Create / Edit Dialog */}
      <GoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        goalToEdit={goalToEdit}
        onSubmit={handleFormSubmit}
        isSubmitting={createGoalMutation.isPending || updateGoalMutation.isPending}
      />

      {/* Contribute Dialog */}
      <ContributeDialog
        open={contributeDialogOpen}
        onOpenChange={setContributeDialogOpen}
        goal={selectedGoalForContribute}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Xác nhận xóa mục tiêu</h3>
            <p className="text-xs text-slate-400 mt-2">
              Bạn có chắc chắn muốn xóa mục tiêu{" "}
              <span className="font-semibold text-slate-200">
                &ldquo;{deleteConfirmGoal.name}&rdquo;
              </span>
              ? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                disabled={deleteGoalMutation.isPending}
                onClick={() => setDeleteConfirmGoal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleteGoalMutation.isPending}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {deleteGoalMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Xóa mục tiêu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
