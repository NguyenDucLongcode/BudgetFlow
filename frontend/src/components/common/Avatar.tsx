"use client";

import Image from "next/image";

import { cn, initials } from "@/src/lib/utils";

interface AvatarProps {
  name: string;

  src: string | null | undefined;

  color?: string;

  size?: number;

  className?: string;
}

export function Avatar({
  name,
  src,
  color = "#10b981",
  size = 36,
  className,
}: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn(
          "rounded-full object-cover border border-slate-200",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-white select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.36,
      }}
    >
      {initials(name)}
    </div>
  );
}
