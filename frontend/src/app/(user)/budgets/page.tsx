"use client";

import { useTranslations } from "next-intl";
import { PieChart, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function BudgetsPage() {
  const t = useTranslations("userLayout");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {t("budgets")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Thiết lập hạn mức chi tiêu theo tháng và danh mục
          </p>
        </div>

        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25">
          <Plus className="w-4 h-4 mr-1.5" />
          Tạo ngân sách mới
        </Button>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl border border-slate-800 bg-[#111827]/80 backdrop-blur-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mx-auto mb-4">
          <PieChart className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-white">Hạn mức & Cảnh báo ngân sách</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2">
          Hệ thống sẽ tự động gửi thông báo khi chi tiêu của bạn vượt ngưỡng 80% hoặc 100% ngân sách đã đặt ra.
        </p>
      </div>
    </div>
  );
}
