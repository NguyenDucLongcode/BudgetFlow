"use client";

import { useState } from "react";
import { CheckCircle2, Send, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { browserApiClient } from "@/src/lib/bff";

interface UserVerifyCellProps {
  email: string;
  verifiedAt: string | null;
  onToast: (msg: string, isError?: boolean) => void;
}

export function UserVerifyCell({
  email,
  verifiedAt,
  onToast,
}: UserVerifyCellProps) {
  const [sending, setSending] = useState(false);
  const t = useTranslations("common");
  const tUsers = useTranslations("users");

  // 1. Nếu đã xác thực: CHỈ hiển thị Icon Check màu xanh lá (Tooltip: "Đã xác thực"). KHÔNG hiển thị nút.
  if (verifiedAt) {
    return (
      <div
        title={`${t("verified")} (${new Date(verifiedAt).toLocaleDateString()})`}
        className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium cursor-help"
      >
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <span className="hidden sm:inline">{t("verified")}</span>
      </div>
    );
  }

  // 2. Nếu chưa xác thực: Hiển thị Badge "Chưa xác thực" màu cam nhạt kèm nút nhỏ gửi lại email
  const handleResend = async () => {
    if (sending) return;
    setSending(true);
    try {
      await browserApiClient.post("/auth/resend-verification-email", { email });
      onToast(tUsers("resendVerificationSuccess", { email }));
    } catch (err: unknown) {
      let msg = "Failed to resend verification email";
      if (typeof err === "object" && err !== null) {
        const errObj = err as Record<string, unknown>;
        const resp = errObj.response as Record<string, unknown> | undefined;
        const respData = resp?.data as Record<string, unknown> | undefined;
        const respMsg = respData?.message || errObj.message;
        if (typeof respMsg === "string") msg = respMsg;
      }
      onToast(msg, true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
        {t("unverified")}
      </span>
      <button
        type="button"
        disabled={sending}
        onClick={handleResend}
        title={tUsers("resendVerificationTitle")}
        className="inline-flex items-center justify-center rounded-md p-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {sending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Send className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}
