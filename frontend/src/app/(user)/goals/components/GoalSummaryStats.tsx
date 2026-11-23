"use client";

import { Target, CheckCircle2, TrendingUp, PiggyBank } from "lucide-react";
import type { GoalSummary } from "@/src/types/api";

interface GoalSummaryStatsProps {
  summary?: GoalSummary | undefined;
  totalGoalsCount: number;
}

export function GoalSummaryStats({ summary, totalGoalsCount }: GoalSummaryStatsProps) {
  const target = summary?.totalTargetAmount || 0;
  const saved = summary?.totalSavedAmount || 0;
  const overallPercent = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Thẻ 1: Tổng mục tiêu */}
      <div className="p-4 sm:p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">Tổng mục tiêu</p>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-white mt-2">
          {totalGoalsCount}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          {summary?.activeGoals || 0} đang thực hiện
        </p>
      </div>

      {/* Thẻ 2: Đã tích lũy */}
      <div className="p-4 sm:p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">Đã tích lũy</p>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-2 truncate">
          {saved.toLocaleString("vi-VN")} ₫
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Đạt {overallPercent}% tổng hạn mức
        </p>
      </div>

      {/* Thẻ 3: Tổng hạn mức mục tiêu */}
      <div className="p-4 sm:p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">Mục tiêu tài chính</p>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-white mt-2 truncate">
          {target.toLocaleString("vi-VN")} ₫
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Còn thiếu {(summary?.totalRemainingAmount || Math.max(0, target - saved)).toLocaleString("vi-VN")} ₫
        </p>
      </div>

      {/* Thẻ 4: Đã hoàn thành */}
      <div className="p-4 sm:p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">Đã hoàn thành</p>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-white mt-2">
          {summary?.completedGoals || 0}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          {totalGoalsCount > 0
            ? `${Math.round(((summary?.completedGoals || 0) / totalGoalsCount) * 100)}% mục tiêu cán đích`
            : "Chưa có mục tiêu hoàn thành"}
        </p>
      </div>
    </div>
  );
}
