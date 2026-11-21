"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Calendar } from "lucide-react";

interface MonthYearPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  locale?: string;
}

const MONTHS_VI = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];
const MONTHS_EN = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const START_YEAR = 2000;
const END_YEAR = 2035;

export function MonthYearPicker({ value, onChange, locale = "vi" }: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(value.getMonth());
  const [pickerYear, setPickerYear] = useState(value.getFullYear());
  const ref = useRef<HTMLDivElement>(null);
  const months = locale === "vi" ? MONTHS_VI : MONTHS_EN;

  // Sync picker state with external value
  useEffect(() => {
    setPickerMonth(value.getMonth());
    setPickerYear(value.getFullYear());
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleApply = () => {
    onChange(new Date(pickerYear, pickerMonth, 1));
    setOpen(false);
  };

  const years = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

  const displayLabel = locale === "vi"
    ? `${months[value.getMonth()]}, ${value.getFullYear()}`
    : `${months[value.getMonth()]} ${value.getFullYear()}`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-100 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer shadow-sm"
      >
        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
        <span>{displayLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 z-[100] w-80 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-4 space-y-4 text-slate-100 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Chọn thời gian
            </span>
            <span className="text-xs font-bold text-indigo-400">
              {months[pickerMonth]} {pickerYear}
            </span>
          </div>

          {/* Year selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Năm
            </label>
            <select
              value={pickerYear}
              onChange={(e) => setPickerYear(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month grid */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Tháng
            </label>
            <div className="grid grid-cols-4 gap-2">
              {months.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPickerMonth(i)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    pickerMonth === i
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                      : "text-slate-200 hover:text-white hover:bg-slate-800 bg-slate-800/60 border border-slate-700/50"
                  }`}
                >
                  {locale === "vi" ? `T${i + 1}` : m.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/25 cursor-pointer"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
