"use client";

import { forwardRef, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/src/lib/utils";

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

interface SelectProps<T extends string = string> extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> {
  options: SelectOption<T>[];

  value?: T;

  onChange?: (value: T) => void;

  leftIcon?: ReactNode;

  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      leftIcon,
      className,
      containerClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("relative", containerClassName)}>
        {leftIcon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}

        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pr-10 text-sm",
            "outline-none transition-all",
            "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",
            "disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white",

            leftIcon ? "pl-10" : "pl-4",

            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    );
  },
);

Select.displayName = "Select";
