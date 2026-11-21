"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Tag,
  AlertCircle,
  BarChart2,
  Coins,
  Calendar,
  X,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useTransactionStatistics,
} from "@/src/client/transaction/transaction.hooks";
import { useWallets } from "@/src/client/wallet/wallet.hooks";
import { TransactionDialog } from "./components/TransactionDialog";
import { MonthYearPicker } from "./components/MonthYearPicker";
import {
  AdvancedFilter,
  formatDisplayDateVN,
  type DateRangeFilter,
} from "./components/AdvancedFilter";
import { TransactionGroup } from "./components/TransactionGroup";
import { TransactionDetailModal } from "./components/TransactionDetailModal";
import { TransactionType } from "@/src/types/enums";
import { browserApiClient } from "@/src/lib/bff";
import {
  convertFromVnd,
  CURRENCY_CONFIGS,
  type DisplayCurrency,
} from "@/src/utils/currency-converter";
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/src/types/api";

// ─── helpers ────────────────────────────────────────────────────────────────

function dateKey(isoString: string): string {
  // Returns "YYYY-MM-DD" in local time
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

function TransactionsContent() {
  const t = useTranslations("transactions");
  const locale = useLocale();
  const dateLocale = locale === "vi" ? vi : enUS;
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTxId = searchParams.get("transactionId");

  // ── Currency display state ──────────────────────────────────────────────
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>("VND");

  // ── 1. Month state ──────────────────────────────────────────────────────
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return (
      currentDate.getFullYear() === now.getFullYear() &&
      currentDate.getMonth() === now.getMonth()
    );
  }, [currentDate]);

  // Month boundaries chính xác tuyệt đối
  const monthBounds = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 1-indexed (1..12)
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    return {
      fromDate: toISODate(startOfMonth),
      toDate: toISODate(endOfMonth),
    };
  }, [currentDate]);

  const handlePrevMonth = () => {
    setDateRange({});
    setPage(1);
    setCurrentDate((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setDateRange({});
    setPage(1);
    setCurrentDate((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1));
  };
  const handleResetCurrentMonth = () => {
    setDateRange({});
    setPage(1);
    setCurrentDate(new Date());
  };

  // ── 2. Advanced date-range filter ───────────────────────────────────────
  const [dateRange, setDateRange] = useState<DateRangeFilter>({});
  const hasDateRange = Boolean(dateRange.fromDate || dateRange.toDate);

  // Active date range: custom range overrides month
  const activeDateRange = hasDateRange ? dateRange : monthBounds;

  // ── 3. Other filters & Search Debounce ──────────────────────────────────
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
  const [walletFilter, setWalletFilter] = useState<string>("ALL");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: wallets = [] } = useWallets({ isArchived: false });

  // ── 4. Gom filterParams tập trung & Kết nối React Query ─────────────────
  const filterParams = useMemo(() => {
    return {
      page,
      limit: 200, // Lấy toàn bộ giao dịch trong tháng để gom nhóm
      search: debouncedSearch.trim() || undefined,
      type: typeFilter !== "ALL" ? typeFilter : undefined,
      walletId: walletFilter !== "ALL" ? walletFilter : undefined,
      fromDate: activeDateRange.fromDate,
      toDate: activeDateRange.toDate,
      sortBy: "date",
      order: "desc" as const,
    };
  }, [page, debouncedSearch, typeFilter, walletFilter, activeDateRange]);

  const { data: transactionsData, isLoading } = useTransactions(filterParams);

  const { data: statsData } = useTransactionStatistics({
    fromDate: monthBounds.fromDate,
    toDate: monthBounds.toDate,
  });

  const rawTransactions = transactionsData?.transactions ?? [];

  // Đảm bảo không lọt dữ liệu tháng khác vào danh sách hiển thị
  const transactions = useMemo(() => {
    if (!activeDateRange.fromDate && !activeDateRange.toDate) return rawTransactions;
    const minTime = activeDateRange.fromDate
      ? new Date(activeDateRange.fromDate + "T00:00:00").getTime()
      : -Infinity;
    const maxTime = activeDateRange.toDate
      ? new Date(activeDateRange.toDate + "T23:59:59.999").getTime()
      : Infinity;
    return rawTransactions.filter((tx) => {
      const t = new Date(tx.date).getTime();
      return t >= minTime && t <= maxTime;
    });
  }, [rawTransactions, activeDateRange]);

  // ── 5. Group by date ────────────────────────────────────────────────────
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of transactions) {
      const key = dateKey(tx.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    }
    // Sort descending by date key
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [transactions]);

  const latestDateKey = groupedByDate[0]?.[0] ?? null;

  // ── 6. Mutations & dialog state ─────────────────────────────────────────
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);

  // Tự động cập nhật viewingTransaction khi danh sách transactions thay đổi (WebSocket)
  useEffect(() => {
    if (!viewingTransaction) return;
    const updated = rawTransactions.find((tx) => tx.id === viewingTransaction.id);
    if (updated && updated.updatedAt !== viewingTransaction.updatedAt) {
      setViewingTransaction(updated);
    }
  }, [rawTransactions, viewingTransaction]);

  // ── Auto open transaction from URL (e.g. from Notification) ─────────────
  useEffect(() => {
    if (!urlTxId) return;
    const match = transactions.find((t) => t.id === urlTxId);
    if (match) {
      setViewingTransaction(match);
    } else {
      browserApiClient
        .get<Transaction>(`/transactions/${urlTxId}`)
        .then((res) => {
          if (res.data?.data) {
            setViewingTransaction(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [urlTxId, transactions]);

  const handleOpenCreate = () => { setEditingTransaction(null); setDialogOpen(true); };
  const handleOpenEdit = (tx: Transaction) => { setEditingTransaction(tx); setDialogOpen(true); };
  const handleOpenView = (tx: Transaction) => setViewingTransaction(tx);

  const handleFormSubmit = async (data: CreateTransactionInput | UpdateTransactionInput) => {
    if (editingTransaction) {
      await updateMutation.mutateAsync({ id: editingTransaction.id, data: data as UpdateTransactionInput });
    } else {
      await createMutation.mutateAsync(data as CreateTransactionInput);
    }
    setDialogOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId) {
      await deleteMutation.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // ── 7. Navigate to report ───────────────────────────────────────────────
  const handleViewReport = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    router.push(`/reports?year=${year}&month=${month}`);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
            {t("eyebrow")}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-0.5">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleViewReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-100 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>Xem báo cáo tháng</span>
          </button>
          <Button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 px-5 py-2.5 rounded-2xl cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t("addTransaction")}
          </Button>
        </div>
      </div>

      {/* ── Month Navigator + MonthYearPicker ── */}
      <div className="relative z-30 flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-800 bg-[#111827]/80 backdrop-blur-md shadow-sm gap-2 flex-wrap overflow-visible">
        <button
          onClick={handlePrevMonth}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t("prevMonth")}</span>
        </button>

        {/* Center: label + picker + reset */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-sm font-bold text-white capitalize">
            {format(currentDate, "MMMM yyyy", { locale: dateLocale })}
          </span>

          <MonthYearPicker
            value={currentDate}
            onChange={(d) => { setCurrentDate(d); setDateRange({}); setPage(1); }}
            locale={locale}
          />

          <button
            onClick={handleResetCurrentMonth}
            disabled={isCurrentMonth}
            title={t("backToCurrentMonth")}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              !isCurrentMonth
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 hover:bg-indigo-500/30 hover:scale-105 shadow-sm"
                : "text-slate-600 opacity-40 cursor-default"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={handleNextMonth}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <span className="hidden sm:inline">{t("nextMonth")}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Currency Converter selector bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Coins className="w-4 h-4 text-indigo-400" />
            <span>Đơn vị hiển thị:</span>
          </div>
          <div className="inline-flex items-center rounded-xl bg-slate-900/90 border border-slate-800 p-1 gap-1">
            {(["VND", "USD", "EUR", "JPY", "GBP"] as DisplayCurrency[]).map((cur) => {
              const active = displayCurrency === cur;
              return (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setDisplayCurrency(cur)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {CURRENCY_CONFIGS[cur].label}
                </button>
              );
            })}
          </div>
        </div>
        {displayCurrency !== "VND" && (
          <span className="text-[11px] text-slate-500 italic hidden sm:inline">
            * Quy đổi tham chiếu theo tỷ giá ước tính
          </span>
        )}
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#111827]/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{t("totalIncome")}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-2">
            +{convertFromVnd(statsData?.income?.total ?? 0, displayCurrency).formatted}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{statsData?.income?.count ?? 0} giao dịch</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#111827]/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{t("totalExpense")}</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-rose-400 mt-2">
            -{convertFromVnd(statsData?.expense?.total ?? 0, displayCurrency).formatted}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{statsData?.expense?.count ?? 0} giao dịch</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#111827]/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{t("netFlow")}</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          {(() => {
            const net = (statsData?.income?.total ?? 0) - (statsData?.expense?.total ?? 0);
            const conv = convertFromVnd(Math.abs(net), displayCurrency);
            return (
              <div className={`text-lg font-bold mt-2 ${net >= 0 ? "text-indigo-400" : "text-amber-400"}`}>
                {net >= 0 ? "+" : "-"}{conv.formatted}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl border border-slate-800 bg-[#111827]/50">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as TransactionType | "ALL"); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t("allTypes")}</option>
            <option value={TransactionType.EXPENSE}>{t("expense")}</option>
            <option value={TransactionType.INCOME}>{t("income")}</option>
          </select>

          {/* Wallet filter */}
          <select
            value={walletFilter}
            onChange={(e) => { setWalletFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t("allWallets")}</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          {/* Advanced date-range filter */}
          <AdvancedFilter
            value={dateRange}
            onChange={(r) => { setDateRange(r); setPage(1); }}
            onClear={() => { setDateRange({}); setPage(1); }}
            minDate={monthBounds.fromDate}
            maxDate={monthBounds.toDate}
          />
        </div>

        {/* Active filter badge */}
        {hasDateRange && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs font-semibold text-indigo-300 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              Lọc: {formatDisplayDateVN(dateRange.fromDate)} - {formatDisplayDateVN(dateRange.toDate)}
            </span>
            <button
              type="button"
              onClick={() => {
                setDateRange({});
                setPage(1);
              }}
              className="ml-1 p-0.5 rounded-lg text-indigo-400 hover:text-white hover:bg-indigo-500/40 transition-colors cursor-pointer"
              title="Xóa bộ lọc ngày"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Table Header (Khớp các cột với TransactionGroup) ── */}
      <div className="hidden sm:grid grid-cols-12 gap-3 sm:gap-4 px-5 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 shadow-sm">
        <div className="col-span-3">Danh mục</div>
        <div className="col-span-2">Mô tả</div>
        <div className="col-span-2">Ví</div>
        <div className="col-span-2 text-right">Số tiền</div>
        <div className="col-span-2 text-center whitespace-nowrap">Trạng thái</div>
        <div className="col-span-1 text-right">Thao tác</div>
      </div>

      {/* ── Transaction list (grouped by date) ── */}
      <div className="space-y-3">
        {isLoading ? (
          // Skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-800/80 bg-[#0F172A]/60 p-4 space-y-3">
              <Skeleton className="h-4 w-40 bg-slate-800" />
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32 bg-slate-800" />
                    <Skeleton className="h-2.5 w-20 bg-slate-800" />
                  </div>
                  <Skeleton className="h-4 w-20 bg-slate-800" />
                </div>
              ))}
            </div>
          ))
        ) : groupedByDate.length === 0 ? (
          // Empty state
          <div className="rounded-3xl border border-slate-800 bg-[#111827]/80 py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/50 text-slate-500 flex items-center justify-center mx-auto mb-4">
              <Tag className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-slate-300">Không có giao dịch nào trong tháng này</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {hasDateRange
                ? "Không có giao dịch nào trong khoảng thời gian đã chọn."
                : t("emptyDescription")}
            </p>
            <Button
              onClick={handleOpenCreate}
              className="mt-5 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-2xl text-xs font-semibold shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Thêm giao dịch
            </Button>
          </div>
        ) : (
          groupedByDate.map(([dateStr, txs]) => (
            <TransactionGroup
              key={dateStr}
              date={dateStr}
              transactions={txs}
              defaultExpanded={dateStr === latestDateKey}
              locale={locale}
              displayCurrency={displayCurrency}
              onEdit={handleOpenEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
              onView={handleOpenView}
            />
          ))
        )}
      </div>

      {/* ── Dialogs ── */}
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transactionToEdit={editingTransaction}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Detail modal */}
      <TransactionDetailModal
        transaction={viewingTransaction}
        onClose={() => setViewingTransaction(null)}
        onEdit={handleOpenEdit}
        onDelete={(id) => setDeleteConfirmId(id)}
        locale={locale}
      />

      {/* Delete confirm modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-2xl z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">{t("delete")}</h3>
              <p className="text-xs text-slate-400 mt-1.5">{t("confirmDelete")}</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Đang xóa..." : t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-4">
          <Skeleton className="h-10 w-48 bg-slate-800" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-2xl bg-slate-800" />
            <Skeleton className="h-24 rounded-2xl bg-slate-800" />
            <Skeleton className="h-24 rounded-2xl bg-slate-800" />
          </div>
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}
