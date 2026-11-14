"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Menu,
  Search,
  Bell,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { UserProfile } from "@/src/types/api";
import { LanguageSwitcher } from "@/src/components/common/LanguageSwitcher";

interface OpsTopbarProps {
  user?: UserProfile | null | undefined;
  onMenuToggle?: (() => void) | undefined;
}

export function OpsTopbar({ user, onMenuToggle }: OpsTopbarProps) {
  const pathname = usePathname();
  const t = useTranslations("topbar");
  const tCommon = useTranslations("common");

  const getRouteMeta = (path: string) => {
    switch (path) {
      case "/admin/dashboard":
        return {
          title: t("routes.overviewTitle"),
          subtitle: t("routes.overviewSubtitle"),
        };
      case "/admin/users":
        return {
          title: t("routes.usersTitle"),
          subtitle: t("routes.usersSubtitle"),
        };
      case "/admin/sessions":
        return {
          title: t("routes.sessionsTitle"),
          subtitle: t("routes.sessionsSubtitle"),
        };
      case "/admin/audit-logs":
        return {
          title: t("routes.auditLogsTitle"),
          subtitle: t("routes.auditLogsSubtitle"),
        };
      case "/admin/notifications":
        return {
          title: t("routes.notificationsTitle"),
          subtitle: t("routes.notificationsSubtitle"),
        };
      case "/admin/performance":
        return {
          title: t("routes.performanceTitle"),
          subtitle: t("routes.performanceSubtitle"),
        };
      case "/admin/categories":
        return {
          title: t("routes.categoriesTitle"),
          subtitle: t("routes.categoriesSubtitle"),
        };
      case "/admin/settings":
        return {
          title: t("routes.settingsTitle"),
          subtitle: t("routes.settingsSubtitle"),
        };
      default:
        return {
          title: tCommon("console"),
          subtitle: "BudgetFlow Operations & Security Console",
        };
    }
  };

  const currentMeta = getRouteMeta(pathname);

  const getInitials = (name?: string) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#334155]/60 bg-[#0F172A]/85 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden rounded-lg p-2 text-slate-400 hover:bg-[#1E293B] hover:text-white transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium">
          <span className="text-slate-400 hidden sm:inline-block">Console</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 hidden sm:inline-block" />
          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {currentMeta.title}
          </span>
        </nav>
      </div>

      {/* Right: Search, Language, Status & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Input (Linear style) */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="h-9 w-60 rounded-xl border border-[#334155]/70 bg-[#1E293B]/60 pl-9 pr-12 text-xs text-slate-200 placeholder-slate-400 transition-all focus:border-emerald-500/50 focus:bg-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
          <kbd className="absolute right-2.5 rounded-md border border-[#334155] bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
            ⌘K
          </kbd>
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Security Indicator */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl px-2.5 py-1.5 bg-[#1E293B]/70 border border-[#334155]/60 text-xs font-medium text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-[11px] font-semibold text-emerald-400">
            {t("caslGuard")}
          </span>
        </div>

        {/* Notifications */}
        <button
          className="relative rounded-xl p-2 text-slate-400 hover:bg-[#1E293B] hover:text-white transition-colors border border-transparent hover:border-[#334155]/60"
          title={t("systemNotification")}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#0F172A]" />
        </button>

        {/* Divider */}
        <div className="h-5 w-[1px] bg-[#334155]/70 hidden sm:block" />

        {/* User Chip */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
            {getInitials(user?.name)}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-white leading-none">
              {user?.name || "Super Admin"}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
              {t("roleAdmin")}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
