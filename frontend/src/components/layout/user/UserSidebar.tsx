"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  CalendarClock,
  PieChart,
  Target,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";
import { BrandLogo } from "@/src/components";
import { useLogout } from "@/src/client/auth";
import type { UserProfile } from "@/src/types/api";

interface UserSidebarProps {
  user?: UserProfile | null;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function UserSidebar({
  user,
  mobileOpen = false,
  onMobileClose,
}: UserSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("userLayout");
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const mainNav = [
    {
      title: t("dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("wallets"),
      href: "/wallets",
      icon: Wallet,
    },
    {
      title: t("transactions"),
      href: "/transactions",
      icon: ArrowRightLeft,
    },
    {
      title: t("recurring"),
      href: "/recurring",
      icon: CalendarClock,
    },
    {
      title: t("budgets"),
      href: "/budgets",
      icon: PieChart,
    },
    {
      title: t("goals"),
      href: "/goals",
      icon: Target,
    },
    {
      title: t("debts"),
      href: "/debts",
      icon: Receipt,
    },
    {
      title: t("reports"),
      href: "/reports",
      icon: BarChart3,
    },
  ];

  const isAdmin = user?.role === "ADMIN";

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#111827] border-r border-slate-800/80 text-slate-300">
      {/* Top Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <BrandLogo />
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {t("mainMenu")}
            </div>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onMobileClose?.()}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      active
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/25"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        active ? "text-white" : "text-slate-400 group-hover:text-white"
                      }`}
                    />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-4 border-t border-slate-800/80 space-y-1">
        {/* Admin Console Shortcut if role is ADMIN */}
        {isAdmin && (
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all mb-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{t("adminConsole")}</span>
          </Link>
        )}

        {/* Settings */}
        <Link
          href="/settings"
          onClick={() => onMobileClose?.()}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname.startsWith("/settings")
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{t("settings")}</span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={() => logout({ all: false, redirectTo: "/login?error=logout" })}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>{isLoggingOut ? t("loggingOut") : t("logout")}</span>
        </button>

        {/* User Mini Profile */}
        {user && (
          <div className="pt-3 mt-2 border-t border-slate-800/60 flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">{user.name || "User"}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer with Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-full shadow-2xl transition-transform animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
