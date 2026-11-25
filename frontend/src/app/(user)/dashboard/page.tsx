"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useTranslations, useLocale } from "next-intl";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowDownRight,
  Target,
  Plus,
  ArrowRight,
  Utensils,
  Home,
  ShoppingBag,
  Car,
  Film,
  Calendar,
  Sparkles,
  Tag,
  PieChart as PieChartIcon,
  HandCoins,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { useAuth } from "@/src/hooks/useAuth";
import { useWallets } from "@/src/client/wallet/wallet.hooks";
import {
  useTransactions,
  useTransactionStatistics,
} from "@/src/client/transaction/transaction.hooks";
import { useBudgetSummary } from "@/src/client/budget/budget.hooks";
import { useGoals } from "@/src/client/goal";
import { useDebtSummary } from "@/src/client/debt";
import { Skeleton } from "@/src/components/ui/skeleton";
import { TransactionType, GoalPriority, GoalStatus } from "@/src/types/enums";
import { getLocalizedName } from "@/src/utils";

interface TooltipPayloadItem {
  payload: {
    name: string;
    value: number;
    percent: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md">
        <p className="text-xs font-semibold text-white">{data.name}</p>
        <p className="text-xs text-indigo-400 font-mono mt-0.5">
          {data.value.toLocaleString("en-US")} ₫ ({data.percent}%)
        </p>
      </div>
    );
  }
  return null;
}

export default function UserDashboardPage() {
  const t = useTranslations("userDashboard");
  const locale = useLocale();
  const { user } = useAuth();

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("goodMorning");
    if (hour < 18) return t("goodAfternoon");
    return t("goodEvening");
  };

  // Tính toán khoảng ngày tháng hiện tại cho thống kê
  const { fromDate, toDate } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const fYear = firstDay.getFullYear();
    const fMonth = String(firstDay.getMonth() + 1).padStart(2, "0");
    const fDay = String(firstDay.getDate()).padStart(2, "0");

    const lYear = lastDay.getFullYear();
    const lMonth = String(lastDay.getMonth() + 1).padStart(2, "0");
    const lDay = String(lastDay.getDate()).padStart(2, "0");

    return {
      fromDate: `${fYear}-${fMonth}-${fDay}`,
      toDate: `${lYear}-${lMonth}-${lDay}`,
    };
  }, []);

  // 1. Lấy danh sách ví thật để tính Tổng số dư thực tế
  const { data: wallets = [], isLoading: isLoadingWallets } = useWallets({
    isArchived: false,
  });

  const totalBalance = useMemo(() => {
    return wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);
  }, [wallets]);

  // 2. Lấy Thống kê Thu / Chi thật trong tháng hiện tại
  const { data: statsData, isLoading: isLoadingStats } = useTransactionStatistics({
    fromDate,
    toDate,
  });

  // 3. Lấy 5 Giao dịch gần đây nhất từ API thật
  const {
    data: recentData,
    isLoading: isLoadingRecent,
  } = useTransactions({
    page: 1,
    limit: 5,
    sortBy: "date",
    order: "desc",
  });

  const recentTransactions = recentData?.transactions || [];

  // 4. Lấy dữ liệu Ngân sách tháng này
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data: budgetSummary, isLoading: isLoadingBudgetSummary } =
    useBudgetSummary({
      month: currentMonth,
      year: currentYear,
    });

  const budgetTotalAllocated = Number(budgetSummary?.totalAllocated || 0);
  const budgetTotalSpent = Number(budgetSummary?.totalSpent || 0);
  const budgetPercent =
    budgetTotalAllocated > 0
      ? Math.round((budgetTotalSpent / budgetTotalAllocated) * 100)
      : 0;

  // 5. Lấy Mục tiêu nổi bật (ưu tiên cao nhất hoặc sắp đến hạn nhất)
  const { data: goalsData, isLoading: isLoadingGoals } = useGoals({
    isArchived: false,
    status: GoalStatus.IN_PROGRESS,
    sortBy: "targetDate",
    order: "asc",
  });

  const featuredGoal = useMemo(() => {
    const goals = goalsData?.goals || [];
    if (goals.length === 0) return null;
    const priorityWeight: Record<GoalPriority, number> = {
      [GoalPriority.URGENT]: 4,
      [GoalPriority.HIGH]: 3,
      [GoalPriority.MEDIUM]: 2,
      [GoalPriority.LOW]: 1,
    };
    return [...goals].sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      if (weightA !== weightB) return weightB - weightA;
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    })[0];
  }, [goalsData]);

  // 6. Lấy tổng quan Khoản nợ & Cho vay
  const { data: debtSummary, isLoading: isLoadingDebtSummary } = useDebtSummary();

  // 4 Stat Cards với dữ liệu thực tế
  const statCards = [
    {
      title: t("totalBalance"),
      value: isLoadingWallets
        ? null
        : `${totalBalance.toLocaleString("en-US")} ₫`,
      change: t("activeWalletsCount", { count: wallets.length }),
      isPositive: true,
      changeText: t("availableAssets"),
      icon: Wallet,
      color: "emerald",
      bgGradient: "from-emerald-500/10 to-teal-500/5",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      title: t("monthlyIncome"),
      value: isLoadingStats
        ? null
        : `+${(statsData?.income?.total || 0).toLocaleString("en-US")} ₫`,
      change: t("incomeCount", { count: statsData?.income?.count || 0 }),
      isPositive: true,
      changeText: t("thisMonth"),
      icon: TrendingUp,
      color: "indigo",
      bgGradient: "from-indigo-500/10 to-blue-500/5",
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      title: t("monthlyExpense"),
      value: isLoadingStats
        ? null
        : `-${(statsData?.expense?.total || 0).toLocaleString("en-US")} ₫`,
      change: t("expenseCount", { count: statsData?.expense?.count || 0 }),
      isPositive: false,
      changeText: t("thisMonth"),
      icon: ArrowDownRight,
      color: "rose",
      bgGradient: "from-rose-500/10 to-pink-500/5",
      iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
    {
      title: t("savingsOrDebt"),
      value: isLoadingStats
        ? null
        : (() => {
            const net =
              (statsData?.income?.total || 0) - (statsData?.expense?.total || 0);
            return `${net >= 0 ? "+" : ""}${net.toLocaleString("en-US")} ₫`;
          })(),
      change: t("netCashflow"),
      isPositive: (statsData?.income?.total || 0) >= (statsData?.expense?.total || 0),
      changeText: t("netCashflowDesc"),
      icon: Target,
      color: "amber",
      bgGradient: "from-amber-500/10 to-orange-500/5",
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
  ];

  // Spending Breakdown mock data for visual chart
  const spendingData = [
    { name: t("categoryFood"), value: 6387500, percent: 35, color: "#6366F1", icon: Utensils },
    { name: t("categoryHousing"), value: 4562500, percent: 25, color: "#EC4899", icon: Home },
    { name: t("categoryShopping"), value: 2737500, percent: 15, color: "#F59E0B", icon: ShoppingBag },
    { name: t("categoryTransport"), value: 1825000, percent: 10, color: "#10B981", icon: Car },
    { name: t("categoryEntertainment"), value: 2737500, percent: 15, color: "#8B5CF6", icon: Film },
  ];



  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-indigo-950/40 border border-slate-800/80 shadow-xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BudgetFlow Overview</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}, {user?.name || t("defaultUser")}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{t("welcomeDesc")}</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t("recordTransaction")}</span>
          </Link>
          <Link
            href="/wallets"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white border border-slate-700/60 transition-all"
          >
            <Wallet className="w-4 h-4" />
            <span>{t("myWallets")}</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;

          return (
            <div
              key={idx}
              className={`p-5 rounded-3xl border border-slate-800 bg-gradient-to-br ${card.bgGradient} bg-[#111827]/70 backdrop-blur-md shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition-all hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-2xl border ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                {card.value === null ? (
                  <Skeleton className="h-7 w-32 bg-slate-800 my-1" />
                ) : (
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {card.value}
                  </h3>
                )}
                <div className="flex items-center gap-1.5 mt-1 text-xs">
                  <span
                    className={`font-semibold ${
                      card.isPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {card.change}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 text-[11px] truncate">
                    {card.changeText}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* 5th Card: Ngân sách tháng này */}
        <Link
          href="/budgets"
          className="p-5 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-blue-500/5 bg-[#111827]/70 backdrop-blur-md shadow-lg flex flex-col justify-between space-y-3 hover:border-indigo-500/60 transition-all hover:-translate-y-0.5 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300">
              {t("thisMonthBudget")}
            </span>
            <div className="p-2.5 rounded-2xl border border-indigo-500/30 bg-indigo-500/20 text-indigo-300 group-hover:scale-105 transition-transform">
              <PieChartIcon className="w-4 h-4" />
            </div>
          </div>

          <div>
            {isLoadingBudgetSummary ? (
              <Skeleton className="h-7 w-32 bg-slate-800 my-1" />
            ) : (
              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-mono">
                    {budgetTotalSpent.toLocaleString("vi-VN")} ₫
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold font-mono">
                    / {budgetTotalAllocated.toLocaleString("vi-VN")} ₫
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden mt-2 mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetPercent > 100
                        ? "bg-rose-500"
                        : budgetPercent >= 80
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {t("categoriesCount", { count: budgetSummary?.totalBudgets || 0 })}
                  </span>
                  <span
                    className={`font-bold font-mono ${
                      budgetPercent > 100
                        ? "text-rose-400"
                        : budgetPercent >= 80
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {budgetPercent}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* 6th Card: Mục tiêu nổi bật */}
        <Link
          href="/goals"
          className="p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-yellow-500/5 bg-[#111827]/70 backdrop-blur-md shadow-lg flex flex-col justify-between space-y-3 hover:border-amber-500/60 transition-all hover:-translate-y-0.5 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">
              {t("featuredGoal")}
            </span>
            <div className="p-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/20 text-amber-300 group-hover:scale-105 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div>
            {isLoadingGoals ? (
              <Skeleton className="h-7 w-32 bg-slate-800 my-1" />
            ) : featuredGoal ? (
              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-[130px]">
                    {featuredGoal.name}
                  </h3>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    {featuredGoal.progress ||
                      Math.round(
                        (Number(featuredGoal.savedAmount) /
                          Number(featuredGoal.targetAmount)) *
                          100,
                      )}
                    %
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden mt-2 mb-1.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        featuredGoal.progress ||
                          Math.round(
                            (Number(featuredGoal.savedAmount) /
                              Number(featuredGoal.targetAmount)) *
                              100,
                          ),
                        100,
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {Number(featuredGoal.savedAmount).toLocaleString("vi-VN")} ₫
                  </span>
                  <span className="text-slate-400 font-semibold">
                    / {Number(featuredGoal.targetAmount).toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-1">
                <p className="text-xs text-slate-300 font-semibold">
                  {t("noGoalsYet")}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t("clickToCreateGoal")}
                </p>
              </div>
            )}
          </div>
        </Link>

        {/* 7th Card: Sổ nợ & Cho vay */}
        <Link
          href="/debts"
          className="p-5 rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-amber-500/5 bg-[#111827]/70 backdrop-blur-md shadow-lg flex flex-col justify-between space-y-3 hover:border-rose-500/60 transition-all hover:-translate-y-0.5 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300">
              {t("debtsAndLoans")}
            </span>
            <div className="p-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/20 text-rose-300 group-hover:scale-105 transition-transform">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>

          <div>
            {isLoadingDebtSummary ? (
              <Skeleton className="h-7 w-32 bg-slate-800 my-1" />
            ) : (
              <div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{t("debtToPay")}</span>
                    <span className="font-bold text-rose-400 font-mono">
                      {Number(debtSummary?.loanRemaining || 0).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{t("debtToCollect")}</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {Number(debtSummary?.debtRemaining || 0).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">
                    {t("openDebtsCount", { count: (debtSummary?.activeLoans || 0) + (debtSummary?.activeDebts || 0) })}
                  </span>
                  {Boolean(debtSummary?.overdueDebts && debtSummary.overdueDebts > 0) && (
                    <span className="text-rose-400 font-semibold">
                      {t("overdueCount", { count: debtSummary?.overdueDebts ?? 0 })}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* 3. Main Analytics & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Spending Breakdown Chart (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl border border-slate-800 bg-[#111827]/80 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {t("spendingBreakdown")}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t("spendingSubtitle")}
                </p>
              </div>

              <span className="text-xs font-medium text-slate-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                {t("thisMonth")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Donut Chart */}
              <div className="sm:col-span-6 h-56 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={spendingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {spendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider">{t("totalExpenseLabel")}</span>
                  <span className="text-base font-extrabold text-white">
                    {((statsData?.expense?.total || 0) / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>

              {/* Category Breakdown Details */}
              <div className="sm:col-span-6 space-y-2.5">
                {spendingData.map((item, idx) => {
                  const CategoryIcon = item.icon;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <CategoryIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-medium text-slate-300 truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-white">
                          {item.percent}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>{t("netCashflowThisMonth")} <strong className="text-indigo-400 font-semibold">{((statsData?.income?.total || 0) - (statsData?.expense?.total || 0)).toLocaleString("en-US")} ₫</strong></span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-medium border border-emerald-500/20">
              {t("expenseTxCount", { count: statsData?.expense?.count || 0 })}
            </span>
          </div>
        </div>

        {/* Right Column: 5 Recent Transactions (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl border border-slate-800 bg-[#111827]/80 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {t("fiveRecentTransactions")}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t("syncDirectlyDesc")}
                </p>
              </div>

              <Link
                href="/transactions"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <span>{t("viewAll")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List */}
            <div className="space-y-3">
              {isLoadingRecent ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-xl bg-slate-800" />
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-28 bg-slate-800" />
                        <Skeleton className="h-2.5 w-20 bg-slate-800" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16 bg-slate-800" />
                  </div>
                ))
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => {
                  const isIncome = tx.type === TransactionType.INCOME;
                  const txDate = new Date(tx.date);

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-xl border ${
                            isIncome
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {isIncome ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {tx.description || getLocalizedName(tx.category, locale) || "Giao dịch"}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {getLocalizedName(tx.wallet, locale) || "Ví"} • {format(txDate, "dd/MM")}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <p
                          className={`text-xs font-bold font-mono ${
                            isIncome ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {Number(tx.amount).toLocaleString("en-US")} ₫
                        </p>
                        <span className="text-[10px] text-slate-500">
                          {getLocalizedName(tx.category, locale) || (isIncome ? t("monthlyIncome") : t("monthlyExpense"))}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/40 text-slate-500 flex items-center justify-center mx-auto mb-2">
                    <Tag className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-400">
                    {t("noRecentTransactionsDesc")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <Link
              href="/transactions"
              className="inline-flex items-center justify-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <span>{t("viewAllTransactionHistory")}</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
