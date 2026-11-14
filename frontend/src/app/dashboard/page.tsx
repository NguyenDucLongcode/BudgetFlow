"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { useLogout } from "@/src/client/auth";
import { useQuery } from "@tanstack/react-query";
import { browserApiClient } from "@/src/lib/bff";
import { AppLink, Button, Card, StatCard } from "@/src/components/ui";
import { BrandLogo } from "@/src/components";
import { LanguageSwitcher } from "@/src/components/common/LanguageSwitcher";
import { NotificationBell } from "@/src/components/notifications/NotificationBell";
import { useTranslations } from "next-intl";
import {
  Wallet,
  ArrowUpDown,
  PieChart,
  Target,
  FileText,
  LogOut,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

export default function UserDashboardPage() {
  const t = useTranslations("userDashboard");
  const { user, isLoading } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const walletsQuery = useQuery({
    queryKey: ["wallets", "dashboard-summary"],
    queryFn: async () => {
      const response = await browserApiClient.get<Array<{ balance: number | string }>>(
        "/wallets",
        { page: "1", limit: "100", isArchived: "false" },
      );
      return response.data.data ?? [];
    },
    enabled: !isLoading,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Top Navigation */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo />

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            <NotificationBell />

            {isAdmin && (
              <AppLink
                href="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                {t("adminConsole")}
              </AppLink>
            )}

            <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-gray-200 dark:border-gray-800">
              <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium leading-none">{user?.name || t("defaultUser")}</div>
                <div className="text-xs text-gray-500 mt-1">{user?.email}</div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="ml-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/40"
                onClick={() => logout({ all: false })}
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                {t("logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="rounded-2xl p-6 sm:p-8 bg-linear-to-r from-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-600/10">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t("welcomeGreeting", { name: user?.name || t("welcomeGuest") })}
            </h1>
            <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
              {t("welcomeDesc")}
            </p>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title={t("totalBalance")}
            value={`${(walletsQuery.data ?? []).reduce((total, wallet) => total + Number(wallet.balance), 0).toLocaleString("vi-VN")} ₫`}
            icon={Wallet}
            color="blue"
            description={t("totalBalanceDesc")}
          />
          <StatCard
            title={t("monthlyIncome")}
            value="0 ₫"
            icon={ArrowUpDown}
            color="emerald"
            description={t("noData")}
          />
          <StatCard
            title={t("monthlyExpense")}
            value="0 ₫"
            icon={PieChart}
            color="red"
            description={t("safeBudget")}
          />
          <StatCard
            title={t("savingsGoals")}
            value="0 ₫"
            icon={Target}
            color="amber"
            description={t("activeGoals")}
          />
        </div>

        {/* Placeholder Features Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Ví */}
          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base">{t("walletManagement")}</h3>
            <p className="text-sm text-gray-500">
              {t("walletDesc")}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                {t("featureUnderDev")}
              </span>
            </div>
          </Card>

          {/* Card 2: Giao dịch */}
          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base">{t("transactionHistory")}</h3>
            <p className="text-sm text-gray-500">
              {t("transactionDesc")}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                {t("featureUnderDev")}
              </span>
            </div>
          </Card>

          {/* Card 3: Ngân sách & Báo cáo */}
          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base">{t("budgetLimit")}</h3>
            <p className="text-sm text-gray-500">
              {t("budgetDesc")}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                {t("featureUnderDev")}
              </span>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
