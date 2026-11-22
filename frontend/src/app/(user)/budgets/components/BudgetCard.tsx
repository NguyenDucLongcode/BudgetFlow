"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Bell,
  Calendar,
} from "lucide-react";
import { CategoryIconBadge } from "@/src/utils/category-icons";
import type { Budget } from "@/src/types/api";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const amount = Number(budget.amount) || 0;
  const spent = Number(budget.spent) || 0;
  const percent = amount > 0 ? Math.round((spent / amount) * 100) : 0;
  const remaining = Math.max(0, amount - spent);
  const overSpent = Math.max(0, spent - amount);
  const isOver = spent > amount;

  // Ngưỡng màu sắc: Xanh lá (<80%), Vàng (80% - 100%), Đỏ (>100%)
  const colorStatus =
    percent > 100
      ? {
          bar: "bg-rose-500",
          barBg: "bg-rose-500/20",
          text: "text-rose-400",
          badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          border: "border-rose-500/30 hover:border-rose-500/50",
          label: "Vượt ngân sách",
        }
      : percent >= 80
      ? {
          bar: "bg-amber-400",
          barBg: "bg-amber-400/20",
          text: "text-amber-400",
          badge: "bg-amber-400/10 text-amber-400 border-amber-400/30",
          border: "border-amber-500/30 hover:border-amber-500/50",
          label: "Sắp chạm hạn mức",
        }
      : {
          bar: "bg-emerald-500",
          barBg: "bg-emerald-500/20",
          text: "text-emerald-400",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          border: "border-slate-800 hover:border-slate-700",
          label: "Trong tầm kiểm soát",
        };

  // Close menu khi click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const y = d.getFullYear();
    return `${day}/${m}/${y}`;
  };

  return (
    <div
      className={`relative rounded-3xl border bg-[#111827]/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl transition-all duration-200 hover:shadow-2xl flex flex-col justify-between ${colorStatus.border}`}
    >
      <div>
        {/* Header: Icon, Tên, Menu 3 chấm */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <CategoryIconBadge
              name={budget.category?.name}
              icon={budget.category?.icon}
              color={budget.category?.color}
              isIncome={false}
              size="md"
            />
            <div>
              <h3 className="font-bold text-white text-base truncate max-w-[160px] sm:max-w-[200px]">
                {budget.category?.name || "Chi tiêu"}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>
                  {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                </span>
              </p>
            </div>
          </div>

          {/* Menu 3 chấm */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 rounded-2xl border border-slate-700 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl z-20 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(budget);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-left"
                >
                  <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Chỉnh sửa</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(budget.id);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-xl transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge & Alert Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colorStatus.badge}`}
          >
            {percent > 100 ? (
              <AlertCircle className="w-3 h-3" />
            ) : (
              <CheckCircle2 className="w-3 h-3" />
            )}
            <span>{colorStatus.label}</span>
          </span>

          {budget.isAlertEnabled && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/90 font-medium">
              <Bell className="w-3 h-3" />
              <span>Cảnh báo ở {Number(budget.alertThreshold) || 80}%</span>
            </span>
          )}
        </div>

        {/* Số tiền Đã chi / Hạn mức */}
        <div className="space-y-1 mb-3">
          <div className="flex items-baseline justify-between text-xs text-slate-400">
            <span>Đã chi</span>
            <span className="font-semibold text-white">Hạn mức</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-lg sm:text-xl font-extrabold font-mono ${colorStatus.text}`}>
              {spent.toLocaleString("vi-VN")} ₫
            </span>
            <span className="text-sm font-bold text-slate-300 font-mono">
              / {amount.toLocaleString("vi-VN")} ₫
            </span>
          </div>
        </div>

        {/* Thanh tiến độ (Progress Bar) */}
        <div className="space-y-1.5 mb-3">
          <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colorStatus.bar}`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Tiến độ chi tiêu</span>
            <span className={`font-bold font-mono ${colorStatus.text}`}>
              {percent}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info: Còn lại hoặc Vượt quá */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        {isOver ? (
          <>
            <span className="text-rose-400 font-medium">Vượt quá hạn mức:</span>
            <span className="font-bold font-mono text-rose-400">
              +{overSpent.toLocaleString("vi-VN")} ₫
            </span>
          </>
        ) : (
          <>
            <span className="text-slate-400 font-medium">Số tiền còn lại:</span>
            <span className="font-bold font-mono text-emerald-400">
              {remaining.toLocaleString("vi-VN")} ₫
            </span>
          </>
        )}
      </div>
    </div>
  );
}
