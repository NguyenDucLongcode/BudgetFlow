"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils/cn";

type TextFieldSize = "sm" | "md" | "lg";

interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;

  registration?: UseFormRegisterReturn;

  error?: FieldError | undefined;

  leftIcon?: ReactNode;

  rightIcon?: ReactNode;

  size?: TextFieldSize;

  containerClassName?: string;

  inputClassName?: string;
}

const SIZE_CLASSES: Record<TextFieldSize, string> = {
  sm: "h-9 text-sm",
  md: "h-11 text-sm",
  lg: "h-12 text-base",
};

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id,
      label,
      registration,
      error,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      size = "md",
      containerClassName,
      inputClassName,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {LeftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            {...registration}
            {...props}
            className={cn(
              "w-full rounded-xl border bg-white transition-all duration-200",
              "outline-none",
              "dark:border-slate-700 dark:bg-slate-900",
              "text-slate-900 dark:text-white",
              "placeholder:text-slate-400",

              SIZE_CLASSES[size],

              LeftIcon ? "pl-10 pr-3" : "px-3",
              RightIcon && "pr-10",

              error
                ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",

              "disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800",

              className,
              inputClassName,
            )}
          />

          {RightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {RightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error.message}</p>}
      </div>
    );
  },
);

TextField.displayName = "TextField";

export default TextField;
