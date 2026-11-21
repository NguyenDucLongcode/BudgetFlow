"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, Target, WalletCards, RefreshCw, AlertCircle, CheckCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { browserApiClient } from "@/src/lib/bff";
import { Button } from "@/src/components/ui/button";
import {
  NotificationDetailModal,
  formatNotificationDateTime,
  type NotificationItem,
} from "@/src/components/notifications/NotificationDetailModal";

interface NotificationList {
  notifications: NotificationItem[];
  pagination: { page: number; totalPages: number; total: number };
}

const icons = {
  BUDGET: WalletCards,
  GOAL: Target,
  SYSTEM: Info,
  DEBT: AlertCircle,
  RECURRING: RefreshCw,
};

const iconColors = {
  BUDGET: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  GOAL: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  SYSTEM: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  DEBT: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  RECURRING: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

export default function NotificationsPage() {
  const t = useTranslations("userLayout");
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "all"],
    queryFn: async () => {
      const response = await browserApiClient.get<NotificationList>("/notifications", {
        page: "1",
        limit: "50",
      });
      return response.data.data;
    },
    refetchInterval: 60_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => browserApiClient.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => browserApiClient.patch("/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.notifications ?? [];

  const handleItemClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markRead.mutate(item.id);
    }
    setSelectedNotification(item);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {t("notifications")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cập nhật và thông báo hoạt động từ hệ thống BudgetFlow
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="outline"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 mr-1.5 text-indigo-400" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-[#111827]/80 backdrop-blur-sm shadow-xl divide-y divide-slate-800/80">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-400 animate-pulse">
            Đang tải thông báo...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Info className="w-6 h-6" />
            </div>
            <p className="text-base font-semibold text-white">Không có thông báo mới</p>
            <p className="text-xs text-slate-500 mt-1">Bạn đã cập nhật mọi thông tin gần đây.</p>
          </div>
        ) : (
          notifications.map((item) => {
            const Icon = icons[item.type] || Info;
            const colorClass = iconColors[item.type] || iconColors.SYSTEM;

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                  item.isRead
                    ? "opacity-75 hover:bg-slate-900/40"
                    : "bg-indigo-950/15 hover:bg-indigo-950/25 border-l-4 border-indigo-500"
                }`}
              >
                <div className={`p-2.5 rounded-2xl border ${colorClass} shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold truncate ${item.isRead ? "text-slate-300" : "text-white"}`}>
                      {item.title}
                    </p>
                    <span className="text-[11px] text-slate-500 shrink-0 font-medium">
                      {formatNotificationDateTime(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Chi tiết Thông báo dùng chung */}
      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
}
