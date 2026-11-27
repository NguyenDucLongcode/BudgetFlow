"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  Loader2,
  AlertCircle,
  PieChart as PieChartIcon,
  Receipt,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useMonthlyReport } from "@/src/client/report";
import { getLocalizedName } from "@/src/utils";
import type { DailyReportPoint } from "@/src/types/api";

const PIE_COLORS = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#06b6d4"];

interface CustomAreaTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: DailyReportPoint;
  }>;
  locale: string;
  t: (key: string) => string;
}

function CustomCashflowTooltip({
  active,
  payload,
  locale,
  t,
}: CustomAreaTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload;
  const fmt = (val: number) =>
    `${new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(
      val
    )} ₫`;

  const formattedDate = new Date(point.date).toLocaleDateString(
    locale === "vi" ? "vi-VN" : "en-US",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md min-w-[200px]">
      <p className="text-xs font-bold text-slate-200 mb-2.5 pb-1.5 border-b border-slate-800">
        {formattedDate}
      </p>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {t("income")}
          </span>
          <span className="font-semibold text-emerald-400">
            +{fmt(point.income)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            {t("expense")}
          </span>
          <span className="font-semibold text-rose-400">
            -{fmt(point.expense)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1.5 mt-1 border-t border-slate-800">
          <span className="font-semibold text-slate-300">{t("net")}</span>
          <span
            className={`font-bold ${
              point.net >= 0 ? "text-indigo-400" : "text-amber-400"
            }`}
          >
            {point.net >= 0 ? "+" : ""}
            {fmt(point.net)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const t = useTranslations("reports");
  const locale = useLocale();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const { data, isLoading, isError } = useMonthlyReport(
    selectedYear,
    selectedMonth
  );

  const monthInputValue = `${selectedYear}-${String(selectedMonth).padStart(
    2,
    "0"
  )}`;

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear((y) => y - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear((y) => y + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleMonthInputChange = (val: string) => {
    if (!val) return;
    const [yStr, mStr] = val.split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    if (!Number.isNaN(y) && !Number.isNaN(m) && m >= 1 && m <= 12) {
      setSelectedYear(y);
      setSelectedMonth(m);
    }
  };

  const formatCurrency = (val: number) =>
    `${new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(
      val
    )} ₫`;

  const formatCompactYAxis = (val: number) => {
    if (val === 0) return "0";
    if (Math.abs(val) >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (Math.abs(val) >= 1_000) {
      return `${(val / 1_000).toFixed(0)}K`;
    }
    return String(val);
  };

  const topCategories = data?.topCategories;
  const pieData = useMemo(() => {
    if (!topCategories) return [];
    return topCategories.map((cat, idx) => ({
      ...cat,
      displayName: getLocalizedName(
        { nameVi: cat.nameVi, nameEn: cat.nameEn },
        locale
      ),
      fillColor: cat.color || PIE_COLORS[idx % PIE_COLORS.length],
    }));
  }, [topCategories, locale]);

  const cashFlowBreakdown = data?.cashFlowBreakdown;
  const allocationData = useMemo(() => {
    const breakdown = cashFlowBreakdown ?? [];
    const total = breakdown.reduce((sum, item) => sum + (item.value || 0), 0);
    return breakdown.map((item) => {
      const label =
        item.key === "living"
          ? t("allocationLiving")
          : item.key === "debt"
          ? t("allocationDebt")
          : t("allocationSavings");
      const percentage =
        total > 0 ? Number(((item.value / total) * 100).toFixed(1)) : 0;
      return {
        ...item,
        displayName: label,
        percentage,
      };
    });
  }, [cashFlowBreakdown, t]);

  const allocationTotal = useMemo(
    () => allocationData.reduce((sum, item) => sum + item.value, 0),
    [allocationData]
  );

  const summaryTotalIncome = data?.summary?.totalIncome ?? 0;
  const debtPlusSavingsPercent = useMemo(() => {
    if (summaryTotalIncome <= 0) return 0;
    const debtAndSavings = allocationData
      .filter((item) => item.key === "debt" || item.key === "savings")
      .reduce((sum, item) => sum + item.value, 0);
    return Number(((debtAndSavings / summaryTotalIncome) * 100).toFixed(1));
  }, [allocationData, summaryTotalIncome]);

  const renderComparisonBadge = (
    percent: number | null | undefined,
    invertColors = false
  ) => {
    if (percent === null || percent === undefined) {
      return (
        <span className="text-[11px] text-slate-500">{t("noPrevData")}</span>
      );
    }
    const isPositive = percent >= 0;
    const isGood = invertColors ? !isPositive : isPositive;
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold ${
          isGood ? "text-emerald-400" : "text-rose-400"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-3.5 h-3.5" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5" />
        )}
        {isPositive ? "+" : ""}
        {percent}% {t("vsLastMonth")}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & MonthYearPicker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-indigo-400">
            {t("eyebrow")}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            {t("title")}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{t("subtitle")}</p>
        </div>

        {/* MonthYearPicker */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label={t("prevMonth")}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="month"
            aria-label={t("monthPickerLabel")}
            value={monthInputValue}
            onChange={(e) => handleMonthInputChange(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-semibold text-white px-2 py-1 focus:outline-none cursor-pointer [color-scheme:dark]"
          />
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label={t("nextMonth")}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm">{t("loading")}</p>
        </div>
      ) : isError || !data ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900/50 border border-rose-500/20 rounded-2xl text-center px-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
          <p className="text-sm text-rose-300">{t("errorLoading")}</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Income */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {t("totalIncome")}
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                +{formatCurrency(data.summary.totalIncome)}
              </p>
              <div>
                {renderComparisonBadge(
                  data.summary.comparison.incomeChangePercent,
                  false
                )}
              </div>
            </div>

            {/* Total Expense */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {t("totalExpense")}
                </span>
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-rose-400 tracking-tight">
                -{formatCurrency(data.summary.totalExpense)}
              </p>
              <div>
                {renderComparisonBadge(
                  data.summary.comparison.expenseChangePercent,
                  true
                )}
              </div>
            </div>

            {/* Net Cashflow */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {t("netCashflow")}
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <p
                className={`text-2xl font-extrabold tracking-tight ${
                  data.summary.net >= 0 ? "text-indigo-400" : "text-amber-400"
                }`}
              >
                {data.summary.net >= 0 ? "+" : ""}
                {formatCurrency(data.summary.net)}
              </p>
              <div>
                {renderComparisonBadge(
                  data.summary.comparison.netChangePercent,
                  false
                )}
              </div>
            </div>
          </div>

          {/* Daily Cashflow AreaChart + Monthly Spending Allocation PieChart */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h2 className="text-base font-bold text-white">
                    {t("cashflowChartTitle")}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t("cashflowChartSubtitle")}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    {t("income")}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    {t("expense")}
                  </span>
                </div>
              </div>

              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.daily}
                    margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="incomeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="expenseGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f43f5e"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f43f5e"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatCompactYAxis}
                      width={52}
                    />
                    <Tooltip
                      content={
                        <CustomCashflowTooltip locale={locale} t={t} />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#incomeGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#expenseGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cashflow Allocation PieChart */}
            <div className="xl:col-span-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <PieChartIcon className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white">
                    {t("allocationChartTitle")}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  {t("allocationChartSubtitle")}
                </p>

                {allocationTotal <= 0 ? (
                  <div className="py-16 text-center text-xs text-slate-500">
                    {t("noAllocationData")}
                  </div>
                ) : (
                  <>
                    <div className="h-[190px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={allocationData.filter((d) => d.value > 0)}
                            dataKey="value"
                            nameKey="displayName"
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={76}
                            paddingAngle={3}
                          >
                            {allocationData
                              .filter((d) => d.value > 0)
                              .map((entry) => (
                                <Cell
                                  key={entry.key}
                                  fill={entry.color}
                                  stroke="transparent"
                                />
                              ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => formatCurrency(Number(value))}
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              borderColor: "#334155",
                              borderRadius: "0.75rem",
                              fontSize: "12px",
                              color: "#f8fafc",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2.5 mt-2">
                      {allocationData.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-slate-200 font-medium truncate">
                              {item.displayName}
                            </span>
                          </div>
                          <div className="text-right shrink-0 flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {formatCurrency(item.value)}
                            </span>
                            <span className="text-[11px] text-slate-400 min-w-[40px]">
                              ({item.percentage}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {debtPlusSavingsPercent > 50 && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    {t("positiveAllocationBanner", {
                      percent: debtPlusSavingsPercent,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Grid: Category PieChart + Top 5 Expense Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PieChart: Top 5 Expense Categories */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <div className="flex items-center gap-2.5 mb-1">
                <PieChartIcon className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">
                  {t("categoryChartTitle")}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                {t("categoryChartSubtitle")}
              </p>

              {pieData.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500">
                  {t("noExpenseData")}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="amount"
                          nameKey="displayName"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={entry.categoryId ?? `cat-${index}`}
                              fill={entry.fillColor}
                              stroke="transparent"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value))}
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "0.75rem",
                            fontSize: "12px",
                            color: "#f8fafc",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {pieData.map((cat, index) => (
                      <div
                        key={cat.categoryId ?? `legend-${index}`}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.fillColor }}
                          />
                          <span className="text-slate-200 font-medium truncate">
                            {cat.displayName}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-white">
                            {formatCurrency(cat.amount)}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {cat.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Top 5 Largest Expense Transactions */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <div className="flex items-center gap-2.5 mb-1">
                <Receipt className="w-5 h-5 text-rose-400" />
                <h2 className="text-base font-bold text-white">
                  {t("topTransactionsTitle")}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                {t("topTransactionsSubtitle")}
              </p>

              {data.topTransactions.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500">
                  {t("noExpenseData")}
                </div>
              ) : (
                <div className="space-y-3">
                  {data.topTransactions.map((tx, idx) => {
                    const catName = tx.category
                      ? getLocalizedName(tx.category, locale)
                      : t("uncategorized");
                    const walletName = tx.wallet
                      ? getLocalizedName(tx.wallet, locale)
                      : "-";
                    const txDate = new Date(tx.date).toLocaleDateString(
                      locale === "vi" ? "vi-VN" : "en-US",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    );

                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                              {tx.description || catName || t("noDescription")}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="truncate">{catName}</span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 truncate">
                                <WalletIcon className="w-3 h-3" />
                                {walletName}
                              </span>
                              <span>•</span>
                              <span>{txDate}</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-xs sm:text-sm font-bold text-rose-400 shrink-0">
                          -{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
