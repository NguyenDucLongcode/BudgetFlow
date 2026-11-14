"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/src/lib/utils";

export type StatCardColor = "emerald" | "blue" | "amber" | "red" | "slate";

const ICON_VARIANTS: Record<StatCardColor, string> = {
  emerald:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",

  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",

  amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",

  red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",

  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

interface StatCardProps {
  title: string;

  value: number | string;

  icon: LucideIcon;

  color?: StatCardColor;

  description?: ReactNode;

  footer?: ReactNode;

  className?: string;

  iconClassName?: string;

  titleClassName?: string;

  valueClassName?: string;

  descriptionClassName?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color = "emerald",
  description,
  footer,
  className,
  iconClassName,
  titleClassName,
  valueClassName,
  descriptionClassName,
}: StatCardProps) {
  return (
    <div
      className={cn(
        `
        rounded-xl
        border border-slate-200
      bg-white
        p-5
        shadow-sm

        transition-all
        duration-300
        ease-out

        hover:-translate-y-1
        hover:shadow-lg

     dark:border-slate-700
     dark:bg-slate-900
  `,
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            ICON_VARIANTS[color],
            iconClassName,
          )}
        >
          <Icon size={20} />
        </div>
      </div>

      <div className="">
        <h2
          className={cn(
            "text-[22px] font-bold tracking-tight text-slate-900 dark:text-white",
            valueClassName,
          )}
        >
          {value}
        </h2>
        <p
          className={cn(
            "text-sm font-medium text-slate-500 dark:text-slate-400",
            titleClassName,
          )}
        >
          {title}
        </p>

        {description && (
          <div
            className={cn(
              "text-xs text-slate-500 dark:text-slate-400",
              descriptionClassName,
            )}
          >
            {description}
          </div>
        )}
      </div>

      {footer && (
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          {footer}
        </div>
      )}
    </div>
  );
}
