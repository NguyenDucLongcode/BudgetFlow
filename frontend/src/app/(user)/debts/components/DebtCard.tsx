"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import {
  MoreVertical,
  Banknote,
  Pencil,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { DebtStatus, DebtType } from "@/src/types/enums";
import type { Debt } from "@/src/types/api";

interface DebtCardProps {
  debt: Debt;
  onPay: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
}

export function DebtCard({ debt, onPay, onEdit, onDelete }: DebtCardProps) {
  const t = useTranslations("debts");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLoan = debt.type === DebtType.LOAN;
  const total = Number(debt.totalAmount);
  const paid = Number(debt.paidAmount);
  const remaining = Math.max(0, total - paid);
  const percent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const isPaid = debt.status === DebtStatus.PAID || percent >= 100;
  const isOverdue = debt.status === DebtStatus.OVERDUE || debt.isOverdue;

  // Thanh tiến độ:
  // Nếu đã xong (PAID): xanh lá
  // Nếu quá hạn (OVERDUE): màu đỏ
  // Đang trả: màu tím / xanh tuỳ theo LOAN / DEBT
  const getProgressBarColor = () => {
    if (isPaid) return "bg-emerald-500 shadow-emerald-500/30";
    if (isOverdue) return "bg-rose-500 shadow-rose-500/30";
    return isLoan ? "bg-rose-400" : "bg-emerald-400";
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const dateLocale = locale === "vi" ? vi : enUS;
  const formattedDueDate = debt.dueDate
    ? format(
        new Date(debt.dueDate),
        locale === "vi" ? "dd 'thg' MM, yyyy" : "MMM dd, yyyy",
        { locale: dateLocale },
      )
    : "";

  return (
    <div className="group relative rounded-3xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700/80 p-5 sm:p-6 transition-all duration-200 shadow-lg flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isPaid
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : isOverdue
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    : isLoan
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}
            >
              {isPaid ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : isLoan ? (
                <ArrowDownLeft className="w-6 h-6" />
              ) : (
                <ArrowUpRight className="w-6 h-6" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                {debt.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 truncate">
                <User className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                <span className="truncate">{debt.contactName || t("unknownContact")}</span>
              </div>
            </div>
          </div>

          {/* 3-dot Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label={t("actionsLabel")}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-30 w-44 rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl p-1.5 text-xs text-slate-200 animate-in fade-in-0 zoom-in-95 duration-150">
                {!isPaid && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onPay(debt);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-colors ${
                      isLoan
                        ? "hover:bg-rose-500/10 hover:text-rose-300 text-rose-400"
                        : "hover:bg-emerald-500/10 hover:text-emerald-300 text-emerald-400"
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>{isLoan ? t("payLoanShort") : t("collectDebtShort")}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(debt);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Pencil className="w-4 h-4 text-slate-400" />
                  <span>{t("edit")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(debt);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t("confirmDelete")}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status & Due Date Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              isLoan
                ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            }`}
          >
            {isLoan ? t("loanOption") : t("debtOption")}
          </span>

          {isPaid ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              {t("badgePaid")}
            </span>
          ) : isOverdue ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-rose-400 bg-rose-500/15 border border-rose-500/30 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              {t("badgeOverdue")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20">
              <Clock className="w-3 h-3" />
              {t("badgeActive")}
            </span>
          )}

          <div className="flex items-center gap-1 text-[11px] text-slate-400 ml-auto">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{t("dueDateShort")} {formattedDueDate}</span>
          </div>
        </div>
      </div>

      {/* Progress & Amounts */}
      <div className="space-y-3 pt-2">
        {/* Amounts */}
        <div className="flex items-baseline justify-between text-xs">
          <div>
            <span className="text-slate-400">{isLoan ? `${t("paid")}: ` : `${t("collected")}: `}</span>
            <span className="font-bold text-white text-sm">
              {paid.toLocaleString("vi-VN")} ₫
            </span>
          </div>
          <div>
            <span className="text-slate-400">{t("totalDebtLabel")} </span>
            <span className="font-semibold text-slate-300">
              {total.toLocaleString("vi-VN")} ₫
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 shadow-sm ${getProgressBarColor()}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1.5">
            <span
              className={`font-bold ${
                isPaid ? "text-emerald-400" : isOverdue ? "text-rose-400" : "text-indigo-400"
              }`}
            >
              {t("percentCompleted", { percent })}
            </span>
            <span className="text-slate-400">
              {t("remaining")}:{" "}
              <span className={`font-semibold ${isLoan ? "text-rose-300" : "text-emerald-300"}`}>
                {remaining.toLocaleString("vi-VN")} ₫
              </span>
            </span>
          </div>
        </div>

        {/* Quick Action Button */}
        {!isPaid && (
          <button
            type="button"
            onClick={() => onPay(debt)}
            className={`w-full mt-2 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isLoan
                ? "bg-slate-800/80 hover:bg-rose-600/20 hover:text-rose-300 hover:border-rose-500/30 border-slate-700/60 text-slate-200"
                : "bg-slate-800/80 hover:bg-emerald-600/20 hover:text-emerald-300 hover:border-emerald-500/30 border-slate-700/60 text-slate-200"
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>{isLoan ? t("payLoanBtn") : t("collectDebtBtn")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
