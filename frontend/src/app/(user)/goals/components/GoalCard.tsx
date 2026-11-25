"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import {
  MoreVertical,
  PlusCircle,
  Pencil,
  Trash2,
  Calendar,
  Target,
  CheckCircle2,
  Flame,
  Clock,
} from "lucide-react";
import { GoalPriority, GoalStatus } from "@/src/types/enums";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedName } from "@/src/utils";
import type { Goal } from "@/src/types/api";

interface GoalCardProps {
  goal: Goal;
  onContribute: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}

const PRIORITY_STYLES: Record<GoalPriority, string> = {
  [GoalPriority.LOW]: "text-slate-400 bg-slate-800/80 border-slate-700/80",
  [GoalPriority.MEDIUM]: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  [GoalPriority.HIGH]: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  [GoalPriority.URGENT]: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export function GoalCard({ goal, onContribute, onEdit, onDelete }: GoalCardProps) {
  const t = useTranslations("goals");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const target = Number(goal.targetAmount);
  const saved = Number(goal.savedAmount);
  const percent = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const isCompleted = goal.status === GoalStatus.COMPLETED || percent >= 100;

  // Thanh tiến độ: Xanh lá (>80%), Vàng (50-80%), Xám (<50%)
  const getProgressColor = () => {
    if (percent > 80) return "bg-emerald-500 shadow-emerald-500/30";
    if (percent >= 50) return "bg-amber-500 shadow-amber-500/30";
    return "bg-slate-400 shadow-slate-400/20";
  };

  const getProgressTextColor = () => {
    if (percent > 80) return "text-emerald-400";
    if (percent >= 50) return "text-amber-400";
    return "text-slate-400";
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
  const formattedTargetDate = goal.targetDate
    ? format(
        new Date(goal.targetDate),
        locale === "vi" ? "dd 'thg' MM, yyyy" : "MMM dd, yyyy",
        { locale: dateLocale },
      )
    : "";

  const priorityLabels: Record<GoalPriority, string> = {
    [GoalPriority.LOW]: t("priorityLow"),
    [GoalPriority.MEDIUM]: t("priorityMedium"),
    [GoalPriority.HIGH]: t("priorityHigh"),
    [GoalPriority.URGENT]: t("priorityUrgent"),
  };

  return (
    <div className="group relative rounded-3xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700/80 p-5 sm:p-6 transition-all duration-200 shadow-lg flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isCompleted
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
              }`}
            >
              {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Target className="w-6 h-6" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                {goal.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                <span>{t("dueDateShort")} {formattedTargetDate}</span>
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
                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onContribute(goal);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-300 text-emerald-400 font-semibold transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>{t("contribute")}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(goal);
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
                    onDelete(goal);
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

        {/* Priority & Status Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              PRIORITY_STYLES[goal.priority] || PRIORITY_STYLES[GoalPriority.MEDIUM]
            }`}
          >
            <Flame className="w-3 h-3" />
            {priorityLabels[goal.priority] || t("priorityMedium")}
          </span>

          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              {t("statusCompleted")}
            </span>
          ) : goal.status === GoalStatus.PAUSED ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20">
              <Clock className="w-3 h-3" />
              {t("statusPaused")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
              {t("statusInProgress")}
            </span>
          )}

          {(goal.wallet?.nameVi || goal.wallet?.name) && (
            <span className="text-[11px] text-slate-400 ml-auto truncate max-w-[140px]">
              {t("walletPrefix")} {getLocalizedName(goal.wallet, locale)}
            </span>
          )}
        </div>
      </div>

      {/* Progress & Amounts */}
      <div className="space-y-3 pt-2">
        {/* Amounts */}
        <div className="flex items-baseline justify-between text-xs">
          <div>
            <span className="text-slate-400">{t("savedLabel")}: </span>
            <span className="font-bold text-white text-sm">
              {saved.toLocaleString("vi-VN")} ₫
            </span>
          </div>
          <div>
            <span className="text-slate-400">{t("targetLabel")} </span>
            <span className="font-semibold text-slate-300">
              {target.toLocaleString("vi-VN")} ₫
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 shadow-sm ${getProgressColor()}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1.5">
            <span className={`font-bold ${getProgressTextColor()}`}>
              {t("percentCompleted", { percent })}
            </span>
            <span className="text-slate-400">
              {t("remainingLabel")}: {Math.max(0, target - saved).toLocaleString("vi-VN")} ₫
            </span>
          </div>
        </div>

        {/* Quick Action button */}
        {!isCompleted && (
          <button
            type="button"
            onClick={() => onContribute(goal)}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-emerald-600/20 hover:text-emerald-300 hover:border-emerald-500/30 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t("contributeMore")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
