"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Menu,
  Search,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { LanguageSwitcher } from "@/src/components/common/LanguageSwitcher";
import { NotificationBell } from "@/src/components/notifications/NotificationBell";
import { useLogout } from "@/src/client/auth";
import type { UserProfile } from "@/src/types/api";

interface UserTopbarProps {
  user?: UserProfile | null;
  onMenuToggle?: () => void;
}

export function UserTopbar({ user, onMenuToggle }: UserTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("userLayout");
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = (path: string) => {
    if (path === "/dashboard") return t("dashboard");
    if (path.startsWith("/wallets")) return t("wallets");
    if (path.startsWith("/transactions")) return t("transactions");
    if (path.startsWith("/recurring")) return t("recurring");
    if (path.startsWith("/budgets")) return t("budgets");
    if (path.startsWith("/goals")) return t("goals");
    if (path.startsWith("/debts")) return t("debts");
    if (path.startsWith("/reports")) return t("reports");
    if (path.startsWith("/notifications")) return t("notifications");
    if (path.startsWith("/settings")) return t("settings");
    return "BudgetFlow";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      router.push(`/transactions?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/transactions");
    }
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {getPageTitle(pathname)}
        </h1>
      </div>

      {/* Middle: Quick Search Input */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center flex-1 max-w-md mx-4"
      >
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </form>

      {/* Right: Language, Notification, User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <NotificationBell />

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-800"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white font-semibold text-xs shadow-sm ring-2 ring-indigo-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">
                {user?.name || t("defaultUser")}
              </p>
              <p className="text-[10px] text-indigo-400 font-medium">
                {user?.role || "USER"}
              </p>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-[#111827] p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Header Info */}
              <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || t("defaultUser")}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>

              {/* Items */}
              <div className="space-y-0.5">
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>{t("profile")}</span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>{t("adminConsole")}</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout({ all: false, redirectTo: "/login?error=logout" });
                  }}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>{isLoggingOut ? t("loggingOut") : t("logout")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
