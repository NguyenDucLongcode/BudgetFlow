"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Users,
  ArrowUpDown,
  PieChart as PieChartIcon,
  ShieldCheck,
  TrendingUp,
  Layers,
  RefreshCw,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { browserApiClient } from "@/src/lib/bff";
import { Skeleton } from "@/src/components/ui/skeleton";

interface AdminStatsResponse {
  summary: {
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    totalTransactions: number;
    incomeTransactions: number;
    expenseTransactions: number;
    transferTransactions: number;
    activeBudgets: number;
    totalBudgets: number;
    onlineSessions: number;
    totalDevices: number;
    totalWallets: number;
    totalCategories: number;
    systemCategories: number;
    totalGoals: number;
    totalDebts: number;
  };
  charts: {
    userGrowth30d: Array<{ date: string; newUsers: number; activeUsers: number }>;
    providerDistribution: Array<{
      provider: string;
      label: string;
      count: number;
      color: string;
    }>;
    dailyTransactions: Array<{
      date: string;
      income: number;
      expense: number;
      transfer: number;
      total: number;
    }>;
  };
}

export default function AdminDashboardPage() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");

  const { data, isLoading, refetch, isFetching } = useQuery<AdminStatsResponse>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await browserApiClient.get<AdminStatsResponse>("/admin/stats");
      return res.data.data;
    },
    staleTime: 30 * 1000,
  });

  const summary = data?.summary;
  const charts = data?.charts;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#334155]/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            {t("title")}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t("liveTelemetry")}
            </span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-[#334155] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all hover:text-white shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-emerald-400" : ""}`} />
          {isFetching ? tCommon("refreshing") : t("syncData")}
        </button>
      </div>

      {/* 4 STATCARDS (Chỉ đếm số lượng, tuyệt đối không tính tiền) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div className="rounded-2xl p-5 bg-[#1E293B] border border-[#334155] shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t("totalUsers")}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-slate-700/60" />
            ) : (
              <div className="text-3xl font-extrabold tracking-tight text-white">
                {summary?.totalUsers?.toLocaleString() ?? 0}
              </div>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {summary?.activeUsers ?? 0}
              </span>
              <span>{t("activeUsersCount")}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Transactions */}
        <div className="rounded-2xl p-5 bg-[#1E293B] border border-[#334155] shadow-lg relative overflow-hidden group hover:border-teal-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t("totalTransactions")}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-110 transition-transform">
              <ArrowUpDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-slate-700/60" />
            ) : (
              <div className="text-3xl font-extrabold tracking-tight text-white">
                {summary?.totalTransactions?.toLocaleString() ?? 0}
              </div>
            )}
            <div className="mt-2 text-xs text-slate-400 truncate">
              {t("readonlyCount")}
            </div>
          </div>
        </div>

        {/* Card 3: Active Budgets */}
        <div className="rounded-2xl p-5 bg-[#1E293B] border border-[#334155] shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t("activeBudgets")}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-slate-700/60" />
            ) : (
              <div className="text-3xl font-extrabold tracking-tight text-white">
                {summary?.activeBudgets?.toLocaleString() ?? 0}
              </div>
            )}
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <span>{t("ofTotal")}</span>
              <span className="font-semibold text-slate-200">{summary?.totalBudgets ?? 0}</span>
              <span>{t("budgetsUnit")}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Online Sessions */}
        <div className="rounded-2xl p-5 bg-[#1E293B] border border-[#334155] shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t("onlineSessions")}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-slate-700/60" />
            ) : (
              <div className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                {summary?.onlineSessions?.toLocaleString() ?? 0}
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
            )}
            <div className="mt-2 text-xs text-slate-400">
              {t("inLast5Minutes", { total: summary?.totalDevices ?? 0 })}
            </div>
          </div>
        </div>
      </div>

      {/* BIỂU ĐỒ 1: AreaChart (User đăng ký mới 30 ngày qua) */}
      <div className="rounded-2xl p-6 bg-[#1E293B] border border-[#334155] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              {t("userGrowthTitle")}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t("userGrowthSubtitle")}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {t("newUsers")}
            </span>
            <span className="flex items-center gap-1.5 text-teal-400">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              {t("activeUsers")}
            </span>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-72 w-full rounded-xl bg-slate-700/50" />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.userGrowth30d || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#334155" }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#334155" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="newUsers"
                  name={t("newUsers")}
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#userGrowthGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="activeUsers"
                  name={t("activeUsers")}
                  stroke="#14B8A6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#activeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* BIỂU ĐỒ 2 & 3: PieChart & BarChart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PieChart: Tỷ lệ User theo Provider */}
        <div className="rounded-2xl p-6 bg-[#1E293B] border border-[#334155] shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-emerald-400" />
              {t("authProviderTitle")}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t("authProviderSubtitle")}
            </p>
          </div>

          <div className="my-4 h-56 w-full flex items-center justify-center">
            {isLoading ? (
              <Skeleton className="h-44 w-44 rounded-full bg-slate-700/50" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.providerDistribution || []}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {charts?.providerDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#1E293B" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderColor: "#334155",
                      borderRadius: "10px",
                      fontSize: "12px",
                      color: "#F8FAFC",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-2 border-t border-[#334155]/60 pt-4">
            {charts?.providerDistribution?.map((item) => (
              <div key={item.provider} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span className="font-semibold text-white">{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BarChart: Số lượng giao dịch tạo mới theo ngày */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-[#1E293B] border border-[#334155] shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-emerald-400" />
                {t("dailyTxTitle")}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t("dailyTxSubtitle")}
              </p>
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-xl bg-slate-700/50" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.dailyTransactions || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#F8FAFC",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    iconType="circle"
                  />
                  <Bar dataKey="income" name={t("income")} fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name={t("expense")} fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="transfer" name={t("transfer")} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-[#334155]/60 pt-4 mt-2">
            <span>{t("recordedTransactions")}:</span>
            <span className="font-bold text-slate-200">
              {summary?.totalTransactions?.toLocaleString() ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* SYSTEM ENTITIES METRICS GRID */}
      <div className="rounded-2xl p-6 bg-[#1E293B] border border-[#334155] shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-400" />
          {t("coreEntitiesTitle")}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-xl p-3 bg-[#0F172A]/70 border border-[#334155]/60">
            <span className="text-[11px] text-slate-400">{t("wallets")}</span>
            <div className="text-lg font-bold text-white mt-1">
              {summary?.totalWallets ?? 0}
            </div>
          </div>

          <div className="rounded-xl p-3 bg-[#0F172A]/70 border border-[#334155]/60">
            <span className="text-[11px] text-slate-400">{t("systemCategories")}</span>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              {summary?.systemCategories ?? 0}
            </div>
          </div>

          <div className="rounded-xl p-3 bg-[#0F172A]/70 border border-[#334155]/60">
            <span className="text-[11px] text-slate-400">{t("totalCategories")}</span>
            <div className="text-lg font-bold text-white mt-1">
              {summary?.totalCategories ?? 0}
            </div>
          </div>

          <div className="rounded-xl p-3 bg-[#0F172A]/70 border border-[#334155]/60">
            <span className="text-[11px] text-slate-400">{t("savingsGoals")}</span>
            <div className="text-lg font-bold text-white mt-1">
              {summary?.totalGoals ?? 0}
            </div>
          </div>

          <div className="rounded-xl p-3 bg-[#0F172A]/70 border border-[#334155]/60">
            <span className="text-[11px] text-slate-400">{t("debts")}</span>
            <div className="text-lg font-bold text-white mt-1">
              {summary?.totalDebts ?? 0}
            </div>
          </div>

          <div className="rounded-xl p-3 bg-[#0F172A]/70 border border-[#334155]/60">
            <span className="text-[11px] text-slate-400">{t("admins")}</span>
            <div className="text-lg font-bold text-purple-400 mt-1">
              {summary?.adminUsers ?? 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
