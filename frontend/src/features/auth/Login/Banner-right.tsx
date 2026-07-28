"use client";

import { Blob } from "@/src/components";

export default function AuthBanner() {
  return (
    <div
      className=" hidden lg:flex relative items-center  justify-center overflow-hidden p-12
       bg-linear-to-br from-indigo-600 via-indigo-700 to-slate-900 "
    >
      {/* Decoration blobs */}
      <Blob position="top-right" color="bg-white/10" />
      <Blob position="bottom-left" color="bg-emerald-400/20" />

      {/* Content */}
      <div className="relative z-10 text-center text-white">
        <div
          className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-white/10 
                        backdrop-blur-md flex items-center justify-center text-5xl shadow-xl"
        >
          📊
        </div>

        <h2 className="text-4xl font-bold">Smart Money Management</h2>

        <p className="mt-4 max-w-sm mx-auto text-white/80 leading-relaxed">
          Track expenses, manage budgets, and achieve your financial goals in
          one simple platform.
        </p>

        <div className="mt-8 flex justify-center gap-3 flex-wrap">
          {["💰 Budget", "📈 Analytics", "🎯 Goals"].map((item) => (
            <span
              key={item}
              className="
                px-4 py-2 rounded-full
                bg-white/10 backdrop-blur-md text-sm
              "
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
