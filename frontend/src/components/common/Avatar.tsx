"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { cn, initials } from "@/src/lib/utils";

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  color?: string;
  className?: string;
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#6366F1",
];

function getAvatarColor(name: string) {
  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);

  return COLORS[hash % COLORS.length];
}

export function Avatar({
  name,
  avatarUrl,
  size = 40,
  className,
  color,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const autoColor = useMemo(() => getAvatarColor(name), [name]);

  const backgroundColor = color ?? autoColor;

  if (avatarUrl && !imageError) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        onError={() => setImageError(true)}
        className={cn(
          "rounded-full object-cover border border-slate-200 shrink-0",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold text-white select-none shrink-0",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor,
        fontSize: size * 0.6,
        lineHeight: 1,
      }}
    >
      <span
        style={{
          lineHeight: 1,
          transform: "translateY(1px)",
        }}
      >
        {initials(name)}
      </span>
    </div>
  );
}
