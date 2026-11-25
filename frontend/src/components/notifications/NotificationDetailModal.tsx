"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { translateNotification } from "@/src/utils/notification-i18n";
import {
  AlertCircle,
  Calendar,
  ExternalLink,
  Info,
  RefreshCw,
  Target,
  WalletCards,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export interface NotificationItem {
  id: string;
  type: "BUDGET" | "GOAL" | "DEBT" | "RECURRING" | "SYSTEM";
  title: string;
  message: string;
  isRead: boolean;
  metadata?: {
    amount?: number | string;
    currency?: string;
    type?: string;
    transactionId?: string;
    [key: string]: unknown;
  } | null;
  createdAt: string;
}

const iconsByType = {
  BUDGET: WalletCards,
  GOAL: Target,
  SYSTEM: Info,
  DEBT: AlertCircle,
  RECURRING: RefreshCw,
};

export function formatNotificationDateTime(
  dateStr?: string | Date | null,
): string {
  if (!dateStr) return "—";
  try {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return String(dateStr);
    return format(date, "HH:mm - dd/MM/yyyy");
  } catch {
    return String(dateStr);
  }
}

interface NotificationDetailModalProps {
  notification: NotificationItem | null;
  onClose: () => void;
}

export function NotificationDetailModal({
  notification,
  onClose,
}: NotificationDetailModalProps) {
  const router = useRouter();
  const t = useTranslations("notifications");
  const locale = useLocale();
  const Icon = notification ? iconsByType[notification.type] || Info : Info;
  const transactionId = notification?.metadata?.transactionId;

  const { title: displayTitle, message: displayMessage } = notification
    ? translateNotification(notification.title, notification.message, locale)
    : { title: "", message: "" };

  const handleNavigateToTransaction = () => {
    if (!transactionId) return;
    onClose();
    router.push(`/transactions?transactionId=${transactionId}`);
  };

  return (
    <Dialog
      open={Boolean(notification)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent
        showCloseButton={false}
        className="w-full sm:max-w-125 space-y-6 rounded-3xl border border-slate-700 bg-[#0F172A] p-6 text-slate-100 shadow-2xl sm:p-7"
      >
        {notification && (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/20 text-indigo-400">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    {t("detailTitle")}
                  </span>
                  <DialogTitle className="mt-0.5 text-base font-bold leading-snug text-white sm:text-lg">
                    {displayTitle}
                  </DialogTitle>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                aria-label={t("close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="whitespace-pre-wrap text-base font-normal leading-relaxed text-slate-200 sm:text-lg">
                {displayMessage}
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm font-medium text-slate-400">
                <Calendar className="h-4 w-4 shrink-0 text-indigo-400" />
                <span>
                  Thời gian:{" "}
                  <strong className="font-semibold text-slate-200">
                    {formatNotificationDateTime(notification.createdAt)}
                  </strong>
                </span>
              </div>

              {notification.metadata &&
                Object.keys(notification.metadata).length > 0 && (
                  <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Thông tin đính kèm
                    </span>
                    {notification.metadata.amount !== undefined && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Số tiền:</span>
                        <span className="text-base font-bold text-emerald-400">
                          {Number(notification.metadata.amount).toLocaleString(
                            "vi-VN",
                          )}{" "}
                          {notification.metadata.currency || "VND"}
                        </span>
                      </div>
                    )}
                    {notification.metadata.type && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Loại giao dịch:</span>
                        <span className="font-semibold text-slate-200">
                          {notification.metadata.type}
                        </span>
                      </div>
                    )}
                    {notification.metadata.transactionId && (
                      <div className="flex items-center justify-between border-t border-slate-800 pt-1 font-mono text-xs text-slate-400">
                        <span>Mã GD:</span>
                        <span className="max-w-60 truncate">
                          {notification.metadata.transactionId}
                        </span>
                      </div>
                    )}
                  </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                {t("close")}
              </button>
              {transactionId && (
                <button
                  type="button"
                  onClick={handleNavigateToTransaction}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] hover:bg-indigo-500 active:scale-[0.98]"
                >
                  <span>{t("viewRelatedTransaction")}</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
