"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  CalendarClock,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  useRecurringTransactions,
  useCreateRecurringTransaction,
  useUpdateRecurringTransaction,
  useDeleteRecurringTransaction,
  useToggleRecurringStatus,
} from "@/src/client/recurring";
import { TransactionType } from "@/src/types/enums";
import type {
  RecurringTransaction,
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
} from "@/src/types/api";
import { RecurringCard, RecurringDialog } from "./components";
import { toast } from "react-toastify";

type StatusFilter = "ALL" | "ACTIVE" | "PAUSED";
type TypeFilter = "ALL" | TransactionType.INCOME | TransactionType.EXPENSE;

export default function RecurringPage() {
  const t = useTranslations("recurring");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<RecurringTransaction | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] =
    useState<RecurringTransaction | null>(null);

  const { data, isLoading, isError } = useRecurringTransactions({
    limit: 100,
    sortBy: "nextRunDate",
    order: "asc",
  });

  const createMutation = useCreateRecurringTransaction();
  const updateMutation = useUpdateRecurringTransaction();
  const deleteMutation = useDeleteRecurringTransaction();
  const toggleMutation = useToggleRecurringStatus();

  const allItems = useMemo(() => data?.items || [], [data?.items]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (statusFilter === "ACTIVE" && !item.isActive) return false;
      if (statusFilter === "PAUSED" && item.isActive) return false;
      if (typeFilter !== "ALL" && item.type !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchWallet =
          item.wallet?.nameVi?.toLowerCase().includes(q) ||
          item.wallet?.nameEn?.toLowerCase().includes(q) ||
          item.wallet?.name?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchWallet) return false;
      }

      return true;
    });
  }, [allItems, statusFilter, typeFilter, searchQuery]);

  const handleOpenCreate = () => {
    setItemToEdit(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: RecurringTransaction) => {
    setItemToEdit(item);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (
    payload: CreateRecurringTransactionInput | UpdateRecurringTransactionInput
  ) => {
    if (itemToEdit) {
      await updateMutation.mutateAsync({
        id: itemToEdit.id,
        data: payload as UpdateRecurringTransactionInput,
      });
    } else {
      await createMutation.mutateAsync(
        payload as CreateRecurringTransactionInput
      );
    }
  };

  const handleToggleStatus = async (id: string, nextActive: boolean) => {
    try {
      await toggleMutation.mutateAsync({ id, isActive: nextActive });
      toast.success(nextActive ? t("toastResumed") : t("toastPaused"));
    } catch {
      toast.error(t("toastError"));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirmItem.id);
      toast.success(t("toastDeleted"));
      setDeleteConfirmItem(null);
    } catch {
      toast.error(t("toastError"));
    }
  };

  const hasFilters =
    statusFilter !== "ALL" || typeFilter !== "ALL" || searchQuery.trim() !== "";

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-indigo-400">
            {t("eyebrow")}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            {t("title")}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{t("subtitle")}</p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-4 py-2.5 shadow-lg shadow-indigo-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t("create")}
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          {(["ALL", "ACTIVE", "PAUSED"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {status === "ALL"
                ? t("filterAll")
                : status === "ACTIVE"
                ? t("filterActive")
                : t("filterPaused")}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Type filter */}
          {(
            [
              "ALL",
              TransactionType.EXPENSE,
              TransactionType.INCOME,
            ] as TypeFilter[]
          ).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                typeFilter === type
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {type === "ALL"
                ? t("filterAll")
                : type === TransactionType.INCOME
                ? t("filterIncome")
                : t("filterExpense")}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-800/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm">{t("loading")}</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900/50 border border-rose-500/20 rounded-2xl text-center px-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
          <p className="text-sm text-rose-300">{t("errorLoading")}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900/50 border border-slate-800 rounded-3xl text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
            <CalendarClock className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">
            {hasFilters ? t("noSearchResults") : t("emptyTitle")}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mt-1.5">
            {hasFilters ? "" : t("emptyDesc")}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setTypeFilter("ALL");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
            >
              {t("clearFilters")}
            </button>
          ) : (
            <Button
              onClick={handleOpenCreate}
              className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl px-4 py-2.5"
            >
              <Plus className="w-4 h-4" />
              {t("createFirst")}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <RecurringCard
              key={item.id}
              item={item}
              onEdit={handleOpenEdit}
              onDelete={(target) => setDeleteConfirmItem(target)}
              onToggleStatus={handleToggleStatus}
              isToggling={toggleMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <RecurringDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transactionToEdit={itemToEdit}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setDeleteConfirmItem(null)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {t("confirmDeleteTitle")}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {t("confirmDelete", { name: deleteConfirmItem.name })}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-60 transition-colors"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
