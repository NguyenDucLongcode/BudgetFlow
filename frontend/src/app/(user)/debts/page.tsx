"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Receipt,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  useDebts,
  useDebtSummary,
  useCreateDebt,
  useUpdateDebt,
  useDeleteDebt,
} from "@/src/client/debt";
import { DebtStatus, DebtType } from "@/src/types/enums";
import type { Debt, CreateDebtInput, UpdateDebtInput } from "@/src/types/api";
import {
  DebtCard,
  DebtDialog,
  PaymentDialog,
  DebtSummaryStats,
} from "./components";
import { toast } from "react-toastify";

type TypeFilterTab = "ALL" | DebtType;
type StatusFilterTab = "ALL" | DebtStatus;

export default function DebtsPage() {
  const t = useTranslations("debts");

  const [activeTypeTab, setActiveTypeTab] = useState<TypeFilterTab>("ALL");
  const [activeStatusTab, setActiveStatusTab] = useState<StatusFilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialogs
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);
  const [debtToEdit, setDebtToEdit] = useState<Debt | null>(null);
  const [defaultCreateType, setDefaultCreateType] = useState<DebtType>(DebtType.LOAN);

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<Debt | null>(null);

  const [deleteConfirmDebt, setDeleteConfirmDebt] = useState<Debt | null>(null);

  // Queries & Mutations
  const { data: debtsData, isLoading, isError } = useDebts({
    limit: 100,
    sortBy: "dueDate",
    order: "asc",
  });
  const { data: summaryData } = useDebtSummary();

  const createDebtMutation = useCreateDebt();
  const updateDebtMutation = useUpdateDebt();
  const deleteDebtMutation = useDeleteDebt();

  const allDebts = useMemo(() => debtsData?.debts || [], [debtsData?.debts]);

  // Client-side filtering
  const filteredDebts = useMemo(() => {
    return allDebts.filter((debt) => {
      // 1. Filter by Type (LOAN / DEBT)
      if (activeTypeTab !== "ALL" && debt.type !== activeTypeTab) {
        return false;
      }

      // 2. Filter by Status
      if (activeStatusTab !== "ALL") {
        if (activeStatusTab === DebtStatus.OVERDUE) {
          if (!debt.isOverdue && debt.status !== DebtStatus.OVERDUE) return false;
        } else if (debt.status !== activeStatusTab) {
          return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = debt.name.toLowerCase().includes(query);
        const matchContact = debt.contactName?.toLowerCase().includes(query);
        const matchBorrower = debt.borrower?.toLowerCase().includes(query);
        const matchDesc = debt.description?.toLowerCase().includes(query);
        if (!matchName && !matchContact && !matchBorrower && !matchDesc) return false;
      }

      return true;
    });
  }, [allDebts, activeTypeTab, activeStatusTab, searchQuery]);

  const handleOpenCreate = (type?: DebtType) => {
    setDebtToEdit(null);
    if (type) {
      setDefaultCreateType(type);
    } else if (activeTypeTab !== "ALL") {
      setDefaultCreateType(activeTypeTab);
    }
    setDebtDialogOpen(true);
  };

  const handleOpenEdit = (debt: Debt) => {
    setDebtToEdit(debt);
    setDebtDialogOpen(true);
  };

  const handleOpenPayment = (debt: Debt) => {
    setSelectedDebtForPayment(debt);
    setPaymentDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateDebtInput | UpdateDebtInput) => {
    if (debtToEdit) {
      await updateDebtMutation.mutateAsync({
        id: debtToEdit.id,
        data: data as UpdateDebtInput,
      });
    } else {
      await createDebtMutation.mutateAsync(data as CreateDebtInput);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmDebt) return;
    try {
      await deleteDebtMutation.mutateAsync(deleteConfirmDebt.id);
      toast.success(t("toastDeleted"));
      setDeleteConfirmDebt(null);
    } catch (err: unknown) {
      let msg = "Không thể xóa khoản nợ, vui lòng thử lại!";
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
            <Receipt className="w-7 h-7 text-indigo-400" />
            <span>{t("title")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t("subtitle")}
          </p>
        </div>

        <Button
          onClick={() => handleOpenCreate()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t("create")}</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <DebtSummaryStats summary={summaryData} />

      {/* Main Tabs (LOAN vs DEBT) & Search */}
      <div className="space-y-3 pt-2">
        {/* Phân loại rõ ràng bằng Tabs: "Tôi đi vay (LOAN)" và "Tôi cho vay (DEBT)" */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start">
            <button
              type="button"
              onClick={() => setActiveTypeTab("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTypeTab === "ALL"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("tabAll", { count: allDebts.length })}
            </button>
            <button
              type="button"
              onClick={() => setActiveTypeTab(DebtType.LOAN)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTypeTab === DebtType.LOAN
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-rose-300"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" />
              <span>
                {t("tabLoan", { count: allDebts.filter((d) => d.type === DebtType.LOAN).length })}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTypeTab(DebtType.DEBT)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTypeTab === DebtType.DEBT
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-emerald-300"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {t("tabDebt", { count: allDebts.filter((d) => d.type === DebtType.DEBT).length })}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Status sub-tabs filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium mr-1 text-[11px]">{t("statusLabel")}</span>
          {(["ALL", DebtStatus.ACTIVE, DebtStatus.PAID, DebtStatus.OVERDUE] as const).map(
            (statusKey) => {
              const isActive = activeStatusTab === statusKey;
              const label =
                statusKey === "ALL"
                  ? t("statusAll")
                  : statusKey === DebtStatus.ACTIVE
                    ? t("statusActive")
                    : statusKey === DebtStatus.PAID
                      ? t("statusPaid")
                      : t("statusOverdue");

              return (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setActiveStatusTab(statusKey)}
                  className={`px-3 py-1 rounded-xl font-medium transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white border border-slate-700"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  {label}
                </button>
              );
            },
          )}
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
          <p className="font-semibold text-sm">{t("errorLoading")}</p>
          <p className="text-xs text-slate-400 mt-1">{t("errorLoadingDesc")}</p>
        </div>
      ) : filteredDebts.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl border border-slate-800 bg-[#111827]/80 backdrop-blur-sm text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Receipt className="w-8 h-8" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            {searchQuery
              ? t("noSearchResults")
              : t("emptyTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2">
            {searchQuery
              ? t("noSearchResultsDesc")
              : t("emptyDesc")}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => handleOpenCreate(activeTypeTab !== "ALL" ? activeTypeTab : DebtType.LOAN)}
              className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 px-5 py-2.5 rounded-xl text-xs font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {t("createFirst")}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDebts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onPay={handleOpenPayment}
              onEdit={handleOpenEdit}
              onDelete={(d) => setDeleteConfirmDebt(d)}
            />
          ))}
        </div>
      )}

      {/* Debt Create / Edit Dialog */}
      <DebtDialog
        open={debtDialogOpen}
        onOpenChange={setDebtDialogOpen}
        debtToEdit={debtToEdit}
        defaultType={defaultCreateType}
        onSubmit={handleFormSubmit}
        isSubmitting={createDebtMutation.isPending || updateDebtMutation.isPending}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        debt={selectedDebtForPayment}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">{t("deleteConfirmTitle")}</h3>
            <p className="text-xs text-slate-400 mt-2">
              {t("deleteConfirmDesc", { name: deleteConfirmDebt.name })}
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                disabled={deleteDebtMutation.isPending}
                onClick={() => setDeleteConfirmDebt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                disabled={deleteDebtMutation.isPending}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {deleteDebtMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                {t("confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
