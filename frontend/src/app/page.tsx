import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Wallet,
  TrendingUp,
  PieChart,
  Target,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Receipt,
  Layers,
} from "lucide-react";
import { BrandLogo } from "@/src/components";
import { LanguageSwitcher } from "@/src/components/common/LanguageSwitcher";

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const jsonStr = decodeURIComponent(
      Array.prototype.map
        .call(atob(base64), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function isTokenExpired(exp?: number): boolean {
  if (!exp) return false;
  return exp * 1000 <= Date.now();
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // 1. Kiểm tra session đăng nhập: Nếu đã đăng nhập, tự động redirect
  if (refreshToken) {
    const payload = parseJwtPayload(refreshToken);
    const isExpired = isTokenExpired(typeof payload?.exp === "number" ? payload.exp : undefined);

    if (payload && !isExpired) {
      if (payload.role === "ADMIN") {
        redirect("/admin/dashboard");
      } else {
        redirect("/dashboard");
      }
    }
  }

  // 2. Nếu chưa đăng nhập: Hiển thị Landing Page giới thiệu hiện đại
  const t = await getTranslations("landingPage");

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-300 font-sans antialiased">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <BrandLogo />

          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-800/60 transition-all"
            >
              {t("signIn")}
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>{t("getStarted")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-8 backdrop-blur-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t("badgeText")}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          {t("heroTitle")}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
            BudgetFlow
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t("heroSubtitle")}
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 text-base"
          >
            <span>{t("getStarted")}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:text-white transition-all text-base"
          >
            <span>{t("signIn")}</span>
          </Link>
        </div>

        {/* Dashboard Mockup Preview Card */}
        <div className="mt-16 sm:mt-20 relative max-w-5xl mx-auto rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/40">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>{t("mockTotalBalance")}</span>
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">125.450.000 ₫</div>
              <div className="mt-1 text-xs text-emerald-400 font-medium">▲ +5.2% {t("vsLastMonth")}</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/40">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>{t("mockMonthlyIncome")}</span>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">45.000.000 ₫</div>
              <div className="mt-1 text-xs text-indigo-400 font-medium">▲ +12.0% {t("vsLastMonth")}</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/40">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>{t("mockMonthlyExpense")}</span>
                <Receipt className="w-4 h-4 text-rose-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">18.250.000 ₫</div>
              <div className="mt-1 text-xs text-rose-400 font-medium">▼ -3.5% {t("vsLastMonth")}</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/40">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>{t("mockSavingsGoals")}</span>
                <Target className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">62.200.000 ₫</div>
              <div className="mt-1 text-xs text-amber-400 font-medium">🎯 78% {t("targetGoal")}</div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Section */}
        <div className="mt-24 sm:mt-32 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {t("featuresHeading")}
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-base">
              {t("featuresSubheading")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t("feature1Title")}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t("feature1Desc")}</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t("feature2Title")}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t("feature2Desc")}</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t("feature3Title")}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t("feature3Desc")}</p>
            </div>
          </div>
        </div>

        {/* Benefits Checklist */}
        <div className="mt-20 p-8 rounded-3xl border border-slate-800 bg-slate-900/40 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t("benefit1")}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t("benefit2")}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t("benefit3")}</span>
            </div>
          </div>

          <Link
            href="/register"
            className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all text-sm text-center"
          >
            {t("joinNow")}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F19] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} BudgetFlow. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-400 transition-colors">
              {t("signIn")}
            </Link>
            <Link href="/register" className="hover:text-slate-400 transition-colors">
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
