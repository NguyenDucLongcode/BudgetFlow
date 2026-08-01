"use client";

import { ReactNode } from "react";

import { Blob } from "@/src/components";

interface AuthBannerProps {
  icon?: ReactNode;
  title: string;
  description: string;
  tags: string[];
}

export default function AuthBanner({
  icon = "📊",
  title,
  description,
  tags,
}: AuthBannerProps) {
  return (
    <div
      className="
        relative hidden overflow-hidden
        bg-linear-to-br from-indigo-600 via-indigo-700 to-slate-900
        p-12 lg:flex items-center justify-center
      "
    >
      {/* Decoration */}
      <Blob position="top-right" color="bg-white/10" />
      <Blob position="bottom-left" color="bg-emerald-400/20" />

      {/* Content */}
      <div className="relative z-10 text-center text-white">
        <div
          className="
            mx-auto mb-8 flex h-24 w-24
            items-center justify-center
            rounded-3xl bg-white/10
            text-5xl backdrop-blur-md shadow-xl
          "
        >
          {icon}
        </div>

        <h2 className="text-4xl font-bold">{title}</h2>

        <p className="mx-auto mt-4 max-w-sm leading-relaxed text-white/80">
          {description}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="
                rounded-full
                bg-white/10
                px-4 py-2
                text-sm
                backdrop-blur-md
              "
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
