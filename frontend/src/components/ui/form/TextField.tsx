"use client";

import type { InputHTMLAttributes } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/src/lib/utils/cn";

interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  icon?: LucideIcon;
  registration?: UseFormRegisterReturn;
  error?: FieldError | undefined;
  wrapperClassName?: string;
  inputClassName?: string;
}

export default function TextField({
  id,
  label,
  icon: Icon,
  registration,
  error,
  wrapperClassName,
  inputClassName,
  className,
  ...props
}: TextFieldProps) {
  return (
    <div className={cn("space-y-2", wrapperClassName)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          id={id}
          {...registration}
          {...props}
          className={cn(
            "w-full rounded-xl border bg-white dark:bg-slate-900",
            "py-3 transition-all duration-200",
            "text-slate-900 dark:text-white",
            "placeholder:text-slate-400",
            "outline-none",

            Icon ? "pl-11 pr-4" : "px-4",

            error
              ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
              : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10",

            "disabled:cursor-not-allowed",
            "disabled:bg-slate-100",
            "dark:disabled:bg-slate-800",

            className,
            inputClassName,
          )}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
