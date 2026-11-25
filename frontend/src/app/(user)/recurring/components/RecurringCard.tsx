"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CalendarClock,
  MoreVertical,
  Pencil,
  Trash2,
  Wallet as WalletIcon,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Clock,
} from "lucide-react";
import { RecurringFrequency, TransactionType } from "@/src/types/enums";
import { getLocalizedName } from "@/src/utils";
import type { RecurringTransaction } from "@/src/types/api";

interface RecurringCardProps {
  item: RecurringTransaction;
  onEdit: (item: RecurringTransaction) => void;
  onDelete: (item: RecurringTransaction) => void;
  onToggleStatus: (id: string, nextActive: boolean) => void;
  isToggling?: boolean;
}

export function RecurringCard({
  item,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling = false,
}: RecurringCardProps) {
  const t = useTranslations("recurring");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const isIncome = item.type === TransactionType.INCOME;
  const amountNum = Number(item.amount) || 0;
  const formattedAmount = `${new Intl.NumberFormat(
    locale === "vi" ? "vi-VN" : "en-US"
  ).format(amountNum)} ₫`;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getFrequencyLabel = () => {
    const interval = item.interval || 1;
    if (interval === 1) {
      switch (item.frequency) {
        case RecurringFrequency.DAILY:
          return t("daily");
        case RecurringFrequency.WEEKLY:
          return t("weekly");
        case RecurringFrequency.MONTHLY:
          return t("monthly");
        case RecurringFrequency.YEARLY:
          return t("yearly");
      }
    }
    switch (item.frequency) {
      case RecurringFrequency.DAILY:
        return t("everyUnitDaily", { count: interval });
      case RecurringFrequency.WEEKLY:
        return t("everyUnitWeekly", { count: interval });
      case RecurringFrequency.MONTHLY:
        return t("everyUnitMonthly", { count: interval });
      case RecurringFrequency.YEARLY:
        return t("everyUnitYearly", { count: interval });
    }
  };

  const walletName = item.wallet
    ? getLocalizedName(item.wallet, locale)
    : t("noWallet");
  const categoryName = item.category
    ? getLocalizedName(item.category, locale)
    : t("noCategory");

  return (
    <div
      className={`group relative rounded-2xl border bg-slate-900/80 p-5 transition-all hover:border-slate-700 ${
        item.isActive
          ? "border-slate-800"
          : "border-slate-800/60 opacity-75"
      }`}
    >
      {/* Top Row: Icon + Title + Type Badge + 3-dot Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isIncome
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
          >
            {isIncome ? (
              <ArrowDownLeft className="w-5 h-5" />
            ) : (
              <ArrowUpRight className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isIncome
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {isIncome ? t("income") : t("expense")}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Repeat className="w-3 h-3" />
                {getFrequencyLabel()}
              </span>
            </div>
          </div>
        </div>

        {/* 3-dot menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-40 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1 z-20 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(item);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors text-left"
              >
                <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(item);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t("delete")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="mt-4">
        <p
          className={`text-xl font-extrabold tracking-tight ${
            isIncome ? "text-emerald-400" : "text-white"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formattedAmount}
        </p>
        {item.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            {item.description}
          </p>
        )}
      </div>

      {/* Metadata: Wallet, Category, Next Run */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 truncate">
            <WalletIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate text-slate-300">{walletName}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 truncate">
            <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate text-slate-300">{categoryName}</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>{t("nextRun")}:</span>
            <span className="font-semibold text-slate-200">
              {formatDate(item.nextRunDate) || "-"}
            </span>
          </span>
          {item.lastRunDate && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="w-3 h-3" />
              {formatDate(item.lastRunDate)}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Active / Paused Switch */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span
          className={`text-xs font-semibold ${
            item.isActive ? "text-emerald-400" : "text-slate-500"
          }`}
        >
          {item.isActive ? t("active") : t("paused")}
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={item.isActive}
          disabled={isToggling}
          onClick={() => onToggleStatus(item.id, !item.isActive)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
            item.isActive ? "bg-indigo-600" : "bg-slate-700"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              item.isActive ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
