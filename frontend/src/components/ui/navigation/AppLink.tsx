import NextLink, { type LinkProps } from "next/link";

import type { AnchorHTMLAttributes } from "react";

import { cn } from "@/src/lib/utils/cn";

interface AppLinkProps
  extends
    LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {}

export default function AppLink({
  children,
  className,

  ...props
}: AppLinkProps) {
  return (
    <NextLink
      {...props}
      className={cn(
        "inline-flex items-center",
        "rounded-md",
        "text-sm font-medium",
        "transition-colors duration-200",

        "text-indigo-600",
        "hover:text-indigo-700",

        "dark:text-indigo-400",
        "dark:hover:text-indigo-300",

        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-indigo-500",
        "focus-visible:ring-offset-2",

        className,
      )}
    >
      {children}
    </NextLink>
  );
}
