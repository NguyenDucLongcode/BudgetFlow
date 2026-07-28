"use client";

import { cn } from "@/src/lib/utils";

interface BlobProps {
  position?: "top-right" | "bottom-left" | "top-left" | "bottom-right";
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const positions = {
  "top-right": "-top-20 -right-20",
  "bottom-left": "-bottom-20 -left-20",
  "top-left": "-top-20 -left-20",
  "bottom-right": "-bottom-20 -right-20",
};

const sizes = {
  sm: "w-48 h-48",
  md: "w-72 h-72",
  lg: "w-96 h-96",
};

export default function Blob({
  position = "top-right",
  color = "bg-white/10",
  size = "md",
  className = "",
}: BlobProps) {
  return (
    <div
      className={cn(
        "absolute rounded-full blur-3xl",
        positions[position],
        sizes[size],
        color,
        className,
      )}
    />
  );
}
