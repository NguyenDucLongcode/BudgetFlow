"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Bell, Info, Target, WalletCards, CheckCheck } from "lucide-react";
import { browserApiClient } from "@/src/lib/bff";
import { useAuth } from "@/src/hooks/useAuth";
import { translateNotification } from "@/src/utils/notification-i18n";
import {
  NotificationDetailModal,
  formatNotificationDateTime,
  type NotificationItem,
} from "./NotificationDetailModal";

interface NotificationResponse {
  notifications: NotificationItem[];
  summary: { unread: number };
}

const iconByType = {
  BUDGET: WalletCards,
  GOAL: Target,
  SYSTEM: Info,
  DEBT: Info,
  RECURRING: Info,
};

export function NotificationBell() {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["notifications", "latest"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await browserApiClient.get<NotificationResponse>(
        "/notifications",
        { page: 1, limit: 10 },
      );
      const raw = response.data?.data ?? response.data;
      return {
        notifications: Array.isArray(raw?.notifications)
          ? raw.notifications
          : [],
        summary: raw?.summary ?? { unread: 0 },
      };
    },
    refetchInterval: isAuthenticated ? 30_000 : false,
  });

  const notifications = data?.notifications ?? [];
  const unread = data?.summary?.unread ?? 0;

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [dropdownOpen]);

  // Đánh dấu đã đọc
  const markAsRead = async (id: string) => {
    try {
      // Cập nhật optimistic
      queryClient.setQueryData(
        ["notifications", "latest"],
        (old: NotificationResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            summary: {
              unread: Math.max(0, old.summary.unread - 1),
            },
            notifications: old.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n,
            ),
          };
        },
      );

      await browserApiClient.patch(`/notifications/${id}/read`);
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (err) {
      console.error("Lỗi khi đánh dấu thông báo đã đọc:", err);
    }
  };

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = async () => {
    try {
      await browserApiClient.patch("/notifications/read-all");
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (err) {
      console.error("Lỗi khi đánh dấu tất cả đã đọc:", err);
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }
    setSelectedNotification(item);
    setDropdownOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Nút Chuông */}
      <button
        type="button"
        onClick={() => setDropdownOpen((v) => !v)}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
        aria-label={t("title")}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-md shadow-rose-500/40 animate-pulse">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown Menu (Chuẩn Dark Mode, z-[999] để không bị đè) */}
      {dropdownOpen && (
        <div className="absolute right-0 z-999 mt-2 w-88 sm:w-96 rounded-2xl border border-slate-700 bg-[#0F172A] shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{t("title")}</span>
              {unread > 0 && (
                <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/30">
                  {t("newCount", { count: unread })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                  title={t("markAllAsRead")}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{t("markAllAsRead")}</span>
                </button>
              )}
              <Link
                href="/notifications"
                onClick={() => setDropdownOpen(false)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors ml-2"
              >
                {t("viewAll")}
              </Link>
            </div>
          </div>

          {/* List Notifications */}
          <div className="max-h-95 divide-y divide-slate-800/80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Bell className="mx-auto h-8 w-8 opacity-40 mb-2" />
                <p className="text-xs font-medium">{t("emptyTitle")}</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = iconByType[notification.type] || Info;
                const isUnread = !notification.isRead;
                const { title: displayTitle, message: displayMessage } =
                  translateNotification(notification.title, notification.message, locale);

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex w-full items-start gap-3.5 px-4 py-3.5 text-left transition-all cursor-pointer ${
                      isUnread
                        ? "bg-slate-800/60 hover:bg-slate-800 border-l-2 border-indigo-500"
                        : "bg-transparent hover:bg-slate-800/30"
                    }`}
                  >
                    {/* Unread indicator / Icon */}
                    <div className="relative mt-0.5 shrink-0">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                          isUnread
                            ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs truncate ${
                          isUnread
                            ? "font-bold text-white"
                            : "font-medium text-slate-300"
                        }`}
                      >
                        {displayTitle}
                      </p>
                      <p
                        className={`text-[11px] line-clamp-2 mt-0.5 ${
                          isUnread ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {displayMessage}
                      </p>
                      <span className="block text-[10px] text-slate-500 mt-1 font-medium">
                        {formatNotificationDateTime(notification.createdAt)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal Chi tiết Thông báo dùng chung */}
      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
}
