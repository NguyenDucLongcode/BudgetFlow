"use client";

import { ArrowDownLeft, ArrowUpRight, CheckCircle2, AlertTriangle } from "lucide-react";
import type { DebtSummary } from "@/src/types/api";

interface DebtSummaryStatsProps {
  summary?: DebtSummary | undefined;
}

export function DebtSummaryStats({ summary }: DebtSummaryStatsProps) {
  const loanRemaining = summary?.loanRemaining || 0;
  const debtRemaining = summary?.debtRemaining || 0;
  const totalPaid = summary?.totalPaidAmount || 0;
  const overdueCount = summary?.overdueDebts || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Thẻ 1: Tổng nợ cần trả (Tôi đi vay) */}
      <div className="p-4 sm:p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">Tôi đi vay (Cần trả)</p>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-rose-400 mt-2 truncate">
          {loanRemaining.toLocaleString("vi-VN")} ₫
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          {summary?.activeLoans || 0} khoản đang vay
        </p>
      </div>

      {/* Thẻ 2: Tổng tiền cần thu (Tôi cho vay) */}
      <div className="p-4 sm:p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">Tôi cho vay (Cần thu)</p>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-2 truncate">
          {debtRemaining.toLocaleString("vi-VN")} ₫
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          {summary?.activeDebts || 0} khoản cho vay
        </p>
      </div>

      {/* Thẻ 3: Đã thanh toán / Đã thu */}
      <div className="p-4 sm:p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">Đã thanh toán / Thu</p>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-white mt-2 truncate">
          {totalPaid.toLocaleString("vi-VN")} ₫
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          {summary?.paidDebts || 0} khoản hoàn tất
        </p>
      </div>

      {/* Thẻ 4: Khoản nợ quá hạn */}
      <div className="p-4 sm:p-5 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">Khoản nợ quá hạn</p>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              overdueCount > 0
                ? "bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <p
          className={`text-xl sm:text-2xl font-bold mt-2 ${
            overdueCount > 0 ? "text-rose-400" : "text-white"
          }`}
        >
          {overdueCount}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          {overdueCount > 0 ? "Cần ưu tiên xử lý sớm" : "Không có khoản nợ quá hạn"}
        </p>
      </div>
    </div>
  );
}
