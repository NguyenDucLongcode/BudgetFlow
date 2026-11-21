"use client";

import { useTranslations } from "next-intl";
import { Receipt, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function DebtsPage() {
  const t = useTranslations("userLayout");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {t("debts")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Quản lý các khoản nợ cần trả và cho vay cần thu hồi
          </p>
        </div>

        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25">
          <Plus className="w-4 h-4 mr-1.5" />
          Thêm khoản nợ/vay
        </Button>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl border border-slate-800 bg-[#111827]/80 backdrop-blur-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-white">Theo dõi nợ & Sổ nợ</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2">
          Ghi nhận ngày đến hạn, lịch sử trả nợ từng phần và tự động nhắc nhở khi sắp đến kỳ thanh toán.
        </p>
      </div>
    </div>
  );
}
