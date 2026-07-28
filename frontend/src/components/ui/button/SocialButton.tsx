"use client";

import Image from "next/image";
import { cn } from "@/src/lib/utils/cn";

interface SocialButtonProps {
  provider: "google" | "apple" | "facebook" | "github";
  label?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const providers = {
  google: {
    icon: "images/Social/google-icon-logo.svg",
    label: "Google",
  },
  apple: {
    icon: "images/Social/apple-black-logo.svg",
    label: "Apple",
  },
  facebook: {
    icon: "images/Social/facebook-icon-logo.svg",
    label: "Facebook",
  },
  github: {
    icon: "images/Social/github-icon-logo.svg",
    label: "GitHub",
  },
};

export default function SocialButton({
  provider,
  label,
  disabled,
  className,
  onClick,
}: SocialButtonProps) {
  const item = providers[provider];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-xl",
        "border border-slate-200 bg-white px-4 py-3",
        "transition-all duration-200",
        "hover:border-indigo-300 hover:bg-slate-50",
        "dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      <Image src={item.icon} alt={item.label} width={20} height={20} />

      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label ?? item.label}
      </span>
    </button>
  );
}
