"use client";

import { useState } from "react";
import { CheckCircle2, Ban, ChevronDown, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface UserStatusDropdownProps {
  userId: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  onStatusChange: (
    userId: string,
    newStatus: "ACTIVE" | "SUSPENDED",
  ) => Promise<void>;
  disabled?: boolean;
}

export function UserStatusDropdown({
  userId,
  status,
  onStatusChange,
  disabled = false,
}: UserStatusDropdownProps) {
  const t = useTranslations("statusBadges");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Nếu user đang PENDING: Hiển thị Badge màu vàng (Read-only), không cho phép đổi trạng thái
  if (status === "PENDING") {
    return (
      <span
        title={t("pendingTooltip")}
        className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20 cursor-not-allowed select-none"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        {t("pending")}
      </span>
    );
  }

  // 2. Nếu user đang ACTIVE hoặc SUSPENDED: Cho phép mở Dropdown chỉ với 2 lựa chọn (ACTIVE và SUSPENDED)
  const handleSelect = async (newStatus: "ACTIVE" | "SUSPENDED") => {
    if (newStatus === status || loading) return;
    setOpen(false);
    setLoading(true);
    try {
      await onStatusChange(userId, newStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border transition-all hover:opacity-90 focus:outline-hidden",
          status === "ACTIVE"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40"
            : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:border-rose-500/40",
          (disabled || loading) && "opacity-60 cursor-not-allowed",
        )}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              status === "ACTIVE" ? "bg-emerald-400" : "bg-rose-400",
            )}
          />
        )}
        <span>{status === "ACTIVE" ? t("active") : t("suspended")}</span>
        <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-1.5 z-40 w-36 rounded-xl border border-[#334155] bg-[#0F172A] p-1 shadow-2xl space-y-0.5 animate-in fade-in zoom-in-95">
            {/* Lựa chọn 1: ACTIVE */}
            <button
              type="button"
              onClick={() => handleSelect("ACTIVE")}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                status === "ACTIVE"
                  ? "bg-emerald-500/15 text-emerald-300 font-semibold"
                  : "text-slate-300 hover:bg-[#1E293B] hover:text-white",
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>{t("active")}</span>
            </button>

            {/* Lựa chọn 2: SUSPENDED */}
            <button
              type="button"
              onClick={() => handleSelect("SUSPENDED")}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                status === "SUSPENDED"
                  ? "bg-rose-500/15 text-rose-300 font-semibold"
                  : "text-slate-300 hover:bg-[#1E293B] hover:text-white",
              )}
            >
              <Ban className="h-3.5 w-3.5 text-rose-400" />
              <span>{t("suspended")}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
