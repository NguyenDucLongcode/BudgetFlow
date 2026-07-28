"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, type LucideIcon } from "lucide-react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { cn } from "@/src/lib/utils/cn";

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;

  registration?: UseFormRegisterReturn;
  error?: FieldError | undefined;

  wrapperClassName?: string;
  labelClassName?: string;
  inputClassName?: string;

  showToggle?: boolean;
}

export default function PasswordField({
  id,
  label,
  icon: Icon = Lock,
  registration,
  error,

  wrapperClassName,
  labelClassName,
  inputClassName,

  showToggle = true,

  className,

  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("space-y-2", wrapperClassName)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "block text-sm font-medium text-slate-700 dark:text-slate-300",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id={id}
          type={showPassword ? "text" : "password"}
          {...registration}
          {...props}
          className={cn(
            "w-full rounded-xl border",
            "bg-white dark:bg-slate-900",
            "py-3 pl-11",
            showToggle ? "pr-11" : "pr-4",
            "text-slate-900 dark:text-white",
            "placeholder:text-slate-400",
            "outline-none transition-all duration-200",

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

        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
