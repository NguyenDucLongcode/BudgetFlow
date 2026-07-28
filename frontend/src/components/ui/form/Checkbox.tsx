"use client";

import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { cn } from "@/src/lib/utils/cn";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: React.ReactNode;

  registration?: UseFormRegisterReturn;

  wrapperClassName?: string;
  labelClassName?: string;
}

export default function Checkbox({
  label,
  registration,

  wrapperClassName,
  labelClassName,

  className,

  ...props
}: CheckboxProps) {
  return (
    <label
      className={cn("flex cursor-pointer items-center gap-3", wrapperClassName)}
    >
      <input
        type="checkbox"
        {...registration}
        {...props}
        className={cn(
          "size-4 rounded border-slate-300",
          "text-indigo-600",
          "focus:ring-indigo-500",
          className,
        )}
      />

      {label && (
        <span
          className={cn(
            "text-sm text-slate-600 dark:text-slate-300",
            labelClassName,
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
}
