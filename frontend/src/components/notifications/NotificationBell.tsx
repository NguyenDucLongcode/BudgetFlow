"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Info, Target, WalletCards } from "lucide-react";
import { browserApiClient } from "@/src/lib/bff";

interface NotificationItem {
  id: string;
  type: "BUDGET" | "GOAL" | "DEBT" | "RECURRING" | "SYSTEM";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

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
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications", "latest"],
    queryFn: async () => {
      const response = await browserApiClient.get<NotificationResponse>(
        "/notifications",
        { page: "1", limit: "5" },
      );
      return response.data.data;
    },
    refetchInterval: 60_000,
  });

  const notifications = data?.notifications ?? [];
  const unread = data?.summary?.unread ?? 0;

  const markAsRead = async (id: string) => {
    await browserApiClient.patch(`/notifications/${id}/read`);
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <details className="relative">
      <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <span className="font-semibold">Thông báo</span>
          <Link className="text-xs text-indigo-600" href="/notifications">Xem tất cả</Link>
        </div>
        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-500">Chưa có thông báo</p>
        ) : (
          notifications.map((notification) => {
            const Icon = iconByType[notification.type];
            return (
              <button
                key={notification.id}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
                className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 ${notification.isRead ? "opacity-70" : "bg-indigo-50/60 dark:bg-indigo-950/30"}`}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{notification.title}</span>
                  <span className="block truncate text-xs text-gray-500">{notification.message}</span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </details>
  );
}
