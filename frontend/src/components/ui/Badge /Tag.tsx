// components/ui/badge/Tag.tsx
"use client";

import { cn } from "@/src/lib/utils";

interface TagProps {
  children: React.ReactNode;
  variant?: "glass" | "primary" | "outline";
  className?: string;
}

const variants = {
  glass: "bg-white/10 backdrop-blur-md text-white",
  primary:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
  outline: "border border-white/20 text-white",
};

export default function Tag({
  children,
  variant = "glass",
  className = "",
}: TagProps) {
  return (
    <span
      className={cn(
        "px-4 py-2 rounded-full text-sm inline-flex items-center gap-1.5",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
