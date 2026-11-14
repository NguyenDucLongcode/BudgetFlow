"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileText,
  Activity,
  FolderTree,
  Settings,
  LogOut,
  X,
  Radio,
  ExternalLink,
  Bell,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useLogout } from "@/src/client/auth";
import { UserProfile } from "@/src/types/api";

interface OpsSidebarProps {
  user?: UserProfile | null | undefined;
  mobileOpen?: boolean | undefined;
  onMobileClose?: (() => void) | undefined;
}

export function OpsSidebar({
  user,
  mobileOpen = false,
  onMobileClose,
}: OpsSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const operationsNav = [
    {
      href: "/admin/dashboard",
      label: t("overview"),
      icon: LayoutDashboard,
      badge: null,
    },
    {
      href: "/admin/users",
      label: t("users"),
      icon: Users,
      badge: null,
    },
    {
      href: "/admin/sessions",
      label: t("sessions"),
      icon: ShieldCheck,
      badge: "Live",
    },
    {
      href: "/admin/audit-logs",
      label: t("auditLogs"),
      icon: FileText,
      badge: null,
    },
    {
      href: "/admin/notifications",
      label: t("notifications"),
      icon: Bell,
      badge: null,
    },
  ];

  const systemNav = [
    {
      href: "/admin/performance",
      label: t("performance"),
      icon: Activity,
      badge: "Metrics",
    },
    {
      href: "/admin/categories",
      label: t("categories"),
      icon: FolderTree,
      badge: null,
    },
    {
      href: "/admin/settings",
      label: t("settings"),
      icon: Settings,
      badge: null,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout({ all: false, redirectTo: "/login" });
  };

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
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0F172A] border-r border-[#334155]/60 transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-[#334155]/50 bg-[#0F172A]/80 backdrop-blur-md">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 group transition-transform active:scale-95"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
              <Activity className="h-5 w-5" strokeWidth={2.5} />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                FinAdmin
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  OPS
                </span>
              </span>
              <span className="text-[11px] font-medium text-slate-400 tracking-wide">
                BudgetFlow Console
              </span>
            </div>
          </Link>

          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-[#1E293B] hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Operations Group */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400/90 flex items-center justify-between">
              <span>{t("operations")}</span>
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
            </div>
            <nav className="space-y-1">
              {operationsNav.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose || (() => {})}
                    className={cn(
                      "group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200",
                      active
                        ? "bg-[#1E293B] text-emerald-400 shadow-xs border border-emerald-500/30 font-bold"
                        : "text-slate-400 hover:bg-[#1E293B]/70 hover:text-slate-200 border border-transparent",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                          active
                            ? "text-emerald-400"
                            : "text-slate-400 group-hover:text-slate-300",
                        )}
                        strokeWidth={active ? 2.3 : 1.9}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                          active
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 group-hover:bg-slate-700",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* System Group */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400/90">
              {t("system")}
            </div>
            <nav className="space-y-1">
              {systemNav.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose || (() => {})}
                    className={cn(
                      "group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200",
                      active
                        ? "bg-[#1E293B] text-emerald-400 shadow-xs border border-emerald-500/30 font-bold"
                        : "text-slate-400 hover:bg-[#1E293B]/70 hover:text-slate-200 border border-transparent",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                          active
                            ? "text-emerald-400"
                            : "text-slate-400 group-hover:text-slate-300",
                        )}
                        strokeWidth={active ? 2.3 : 1.9}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                          active
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 group-hover:bg-slate-700",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* External Links / Quick Status */}
          <div className="rounded-xl p-3 bg-[#1E293B]/60 border border-[#334155]/40 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span>{t("environment")}</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {t("liveDemo")}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {t("envDesc")}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors pt-1"
            >
              {tCommon("backToUserDashboard")}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* User Footer */}
        <div className="border-t border-[#334155]/60 p-3 bg-[#0F172A]">
          <div className="flex items-center justify-between gap-3 rounded-xl p-2 bg-[#1E293B]/70 border border-[#334155]/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-white">
                  {user?.name || "Super Admin"}
                </div>
                <div className="truncate text-[10px] text-slate-400">
                  {user?.email || "admin@budgetflow.com"}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
              title={tCommon("logout")}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
