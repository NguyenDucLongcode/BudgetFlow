"use client";

import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, X, Calendar } from "lucide-react";

export interface DateRangeFilter {
  fromDate?: string | undefined;
  toDate?: string | undefined;
}

interface AdvancedFilterProps {
  value: DateRangeFilter;
  onChange: (filter: DateRangeFilter) => void;
  onClear: () => void;
  minDate?: string | undefined;
  maxDate?: string | undefined;
}

export function formatDisplayDateVN(val?: string): string {
  if (!val) return "dd/mm/yyyy";
  const parts = val.split("-");
  if (parts.length !== 3) return val;
  const [y, m, d] = parts;
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

export function AdvancedFilter({
  value,
  onChange,
  onClear,
  minDate,
  maxDate,
}: AdvancedFilterProps) {
  const [open, setOpen] = useState(false);
  const [localFrom, setLocalFrom] = useState(value.fromDate ?? "");
  const [localTo, setLocalTo] = useState(value.toDate ?? "");
  const ref = useRef<HTMLDivElement>(null);

  const hasFilter = Boolean(value.fromDate || value.toDate);

  const handleToggle = () => {
    if (!open) {
      setLocalFrom(value.fromDate ?? "");
      setLocalTo(value.toDate ?? "");
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleApply = () => {
    let from = localFrom;
    let to = localTo;

    // Khóa cứng phạm vi không cho vượt quá minDate / maxDate
    if (minDate && from && from < minDate) from = minDate;
    if (maxDate && to && to > maxDate) to = maxDate;
    if (from && to && from > to) {
      const temp = from;
      from = to;
      to = temp;
    }

    const filter: DateRangeFilter = {
      ...(from ? { fromDate: from } : {}),
      ...(to ? { toDate: to } : {}),
    };
    onChange(filter);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalFrom("");
    setLocalTo("");
    onClear();
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
          hasFilter
            ? "bg-indigo-600 text-white border border-indigo-500 shadow-sm shadow-indigo-600/30"
            : "text-slate-300 bg-slate-900/80 border border-slate-700 hover:text-white hover:bg-slate-800"
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Bộ lọc ngày</span>
        {hasFilter && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="ml-0.5 p-0.5 rounded-full hover:bg-indigo-500/50 cursor-pointer"
            title="Xóa lọc"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 z-[100] w-80 rounded-2xl border border-slate-700 bg-[#0F172A] shadow-2xl p-4 space-y-4 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <p className="text-xs font-bold text-white flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Lọc theo ngày trong tháng
            </p>
            {(localFrom || localTo) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                Xóa lọc
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Phạm vi hợp lệ:{" "}
            <span className="font-semibold text-slate-200">
              {formatDisplayDateVN(minDate)} - {formatDisplayDateVN(maxDate)}
            </span>
          </p>

          <div className="space-y-3">
            {/* Từ ngày */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Từ ngày (dd/mm/yyyy)
              </label>
              <div className="relative flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:border-slate-600 transition-colors">
                <span
                  className={`text-sm font-semibold ${
                    localFrom ? "text-slate-100" : "text-slate-500"
                  }`}
                >
                  {localFrom ? formatDisplayDateVN(localFrom) : "dd/mm/yyyy"}
                </span>
                <Calendar className="w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={localFrom}
                  min={minDate}
                  max={localTo || maxDate}
                  onChange={(e) => setLocalFrom(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>

            {/* Đến ngày */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Đến ngày (dd/mm/yyyy)
              </label>
              <div className="relative flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:border-slate-600 transition-colors">
                <span
                  className={`text-sm font-semibold ${
                    localTo ? "text-slate-100" : "text-slate-500"
                  }`}
                >
                  {localTo ? formatDisplayDateVN(localTo) : "dd/mm/yyyy"}
                </span>
                <Calendar className="w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={localTo}
                  min={localFrom || minDate}
                  max={maxDate}
                  onChange={(e) => setLocalTo(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!localFrom && !localTo}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-40 shadow-sm cursor-pointer"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
