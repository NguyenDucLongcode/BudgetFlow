"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Wallet as WalletIcon,
  Clock,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu";
import { CategoryIconBadge } from "@/src/utils/category-icons";
import { convertFromVnd, type DisplayCurrency } from "@/src/utils/currency-converter";
import { TransactionType, TransactionStatus } from "@/src/types/enums";
import type { Transaction } from "@/src/types/api";

interface TransactionGroupProps {
  date: string; // "YYYY-MM-DD"
  transactions: Transaction[];
  defaultExpanded?: boolean;
  locale?: string;
  displayCurrency?: DisplayCurrency;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onView: (tx: Transaction) => void;
}

function parseAmount(val: any): number {
  if (val == null) return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (typeof val === "string") {
    const cleaned = val.replace(/,/g, "").trim();
    const parsed = Number(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof val === "object") {
    if (typeof val.toNumber === "function") return val.toNumber();
    if (typeof val.toString === "function") {
      const parsed = Number(val.toString());
      return isNaN(parsed) ? 0 : parsed;
    }
  }
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

export function TransactionGroup({
  date,
  transactions,
  defaultExpanded = false,
  locale = "vi",
  displayCurrency = "VND",
  onEdit,
  onDelete,
  onView,
}: TransactionGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const dateLocale = locale === "vi" ? vi : enUS;

  const { totalIncome, totalExpense } = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        const amt = parseAmount(tx.amount);
        const typeStr = String(tx.type || "").toUpperCase();
        if (typeStr === "INCOME") acc.totalIncome += amt;
        else if (typeStr === "EXPENSE") acc.totalExpense += amt;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );
  }, [transactions]);

  const parsedDate = new Date(date + "T00:00:00");
  const formattedDate = format(parsedDate, "EEEE, dd/MM/yyyy", { locale: dateLocale });

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0F172A]/80 shadow-md overflow-hidden">
      {/* Group Header (Ngày) */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/40 transition-colors cursor-pointer group bg-slate-900/60"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                expanded ? "" : "-rotate-90"
              }`}
            />
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-100 capitalize">
            {formattedDate}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
            {transactions.length} giao dịch
          </span>
        </div>

        {/* Daily totals */}
        <div className="flex items-center gap-3 text-sm sm:text-base font-bold">
          {totalIncome > 0 && (
            <span className="text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 inline" />
              +{convertFromVnd(totalIncome, displayCurrency).formatted}
            </span>
          )}
          {totalExpense > 0 && (
            <span className="text-rose-400 flex items-center gap-1">
              <TrendingDown className="w-4 h-4 inline" />
              -{convertFromVnd(totalExpense, displayCurrency).formatted}
            </span>
          )}
          {totalIncome === 0 && totalExpense === 0 && (
            <span className="text-slate-400 text-xs">
              0 {displayCurrency}
            </span>
          )}
        </div>
      </button>

      {/* Transaction rows (Căn lề thẳng hàng với Header 12 cột) */}
      {expanded && (
        <div className="divide-y divide-slate-800/60 border-t border-slate-800/80">
          {transactions.map((tx) => {
            const isIncome = tx.type === TransactionType.INCOME;
            const isPending = tx.status === TransactionStatus.PENDING;
            const amt = parseAmount(tx.amount);
            const cat = tx.category;

            return (
              <div
                key={tx.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center px-5 py-4 hover:bg-slate-800/25 transition-colors"
              >
                {/* 1. Danh mục (Icon + Tên + Giờ) - 3 cột */}
                <div className="sm:col-span-3 flex items-center gap-3 min-w-0">
                  <CategoryIconBadge
                    name={cat?.name}
                    icon={cat?.icon}
                    color={cat?.color}
                    isIncome={isIncome}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-semibold text-slate-100 truncate">
                      {cat?.name || (isIncome ? "Thu nhập" : "Chi tiêu")}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {format(new Date(tx.date), "HH:mm")}
                    </p>
                  </div>
                </div>

                {/* 2. Mô tả & Ghi chú - 2 cột */}
                <div className="sm:col-span-2 min-w-0">
                  <p className="text-sm sm:text-base text-slate-200 font-medium truncate">
                    {tx.description || <span className="text-slate-500 italic">—</span>}
                  </p>
                  {tx.note && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {tx.note}
                    </p>
                  )}
                </div>

                {/* 3. Ví thanh toán - 2 cột */}
                <div className="sm:col-span-2 min-w-0 flex items-center gap-1.5 text-slate-300">
                  <WalletIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm sm:text-base font-medium truncate">
                    {tx.wallet?.name || "—"}
                  </span>
                </div>

                {/* 4. Số tiền - 2 cột (Căn phải) */}
                <div className="sm:col-span-2 text-left sm:text-right">
                  <span
                    className={`text-base sm:text-lg font-bold tracking-tight ${
                      isIncome ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {convertFromVnd(amt, displayCurrency).formatted}
                  </span>
                </div>

                {/* 5. Trạng thái - 2 cột (Căn giữa, không rớt dòng) */}
                <div className="sm:col-span-2 flex justify-start sm:justify-center whitespace-nowrap">
                  {isPending ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Dự kiến</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Hoàn thành</span>
                    </span>
                  )}
                </div>

                {/* 6. Thao tác - 1 cột (Căn phải) */}
                <div className="sm:col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      aria-label="Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="bottom"
                      align="end"
                      sideOffset={4}
                      className="z-50 w-44 rounded-2xl border border-slate-800 bg-[#1E293B] p-1.5 shadow-2xl text-slate-100"
                    >
                      <DropdownMenuItem
                        onClick={() => onView(tx)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <Eye className="w-4 h-4 text-indigo-400" />
                        <span>Xem chi tiết</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit(tx)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-slate-400" />
                        <span>Chỉnh sửa</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 bg-slate-800" />
                      <DropdownMenuItem
                        onClick={() => onDelete(tx.id)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
