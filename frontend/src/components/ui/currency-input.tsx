"use client";

import React, { useState, useEffect, forwardRef } from "react";
import { cn } from "@/src/lib/utils";

export const CURRENCY_SYMBOLS: Record<string, string> = {
  VND: "₫",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
};

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: number | string | null;
  onChange?: (value: number) => void;
  currency?: string;
  className?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      currency = "VND",
      placeholder = "0",
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    // Định dạng chuỗi số kèm dấu phẩy phân cách hàng nghìn
    const formatNumber = (val: number | string | null | undefined): string => {
      if (val === null || val === undefined || val === "") return "";
      const num = typeof val === "number" ? val : Number(String(val).replace(/\D/g, ""));
      if (isNaN(num)) return "";
      return num.toLocaleString("en-US");
    };

    const [displayValue, setDisplayValue] = useState<string>(() => formatNumber(value));

    // Đồng bộ khi value bên ngoài thay đổi
    useEffect(() => {
      setDisplayValue(formatNumber(value));
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Chỉ giữ lại các chữ số
      const rawValue = e.target.value.replace(/\D/g, "");

      if (rawValue === "") {
        setDisplayValue("");
        onChange?.(0);
        return;
      }

      // Giới hạn độ dài để tránh tràn số an toàn JavaScript (MAX_SAFE_INTEGER)
      const sanitized = rawValue.slice(0, 15);
      const numericValue = Number(sanitized);

      setDisplayValue(numericValue.toLocaleString("en-US"));
      onChange?.(numericValue);
    };

    const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] || currency;

    return (
      <div className="relative w-full">
        <input
          {...props}
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 pr-14 text-sm font-mono text-white placeholder-slate-500 transition-all",
            "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
            disabled && "cursor-not-allowed opacity-60 bg-slate-900/50",
            className,
          )}
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none select-none">
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
            {symbol}
          </span>
        </div>
      </div>
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";
