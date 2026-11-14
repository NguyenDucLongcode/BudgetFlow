"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, Target, WalletCards } from "lucide-react";
import { browserApiClient } from "@/src/lib/bff";
import { Button } from "@/src/components/ui/button";

interface NotificationItem {
  id: string;
  type: "BUDGET" | "GOAL" | "DEBT" | "RECURRING" | "SYSTEM";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationList {
  notifications: NotificationItem[];
  pagination: { page: number; totalPages: number; total: number };
}

const icons = { BUDGET: WalletCards, GOAL: Target, SYSTEM: Info, DEBT: Info, RECURRING: Info };

export default function NotificationsPage() {
  const queryClient = useQueryClient();
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Thông báo</h1>
            <p className="text-sm text-gray-500">Cập nhật mới nhất từ BudgetFlow</p>
          </div>
          <Button variant="outline" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {isLoading ? (
            <p className="p-8 text-center text-sm text-gray-500">Đang tải thông báo...</p>
          ) : !data?.notifications.length ? (
            <p className="p-8 text-center text-sm text-gray-500">Chưa có thông báo</p>
          ) : (
            data.notifications.map((notification) => {
              const Icon = icons[notification.type];
              return (
                <div key={notification.id} className={`flex gap-4 border-b border-gray-100 p-4 last:border-0 dark:border-gray-800 ${notification.isRead ? "bg-white dark:bg-gray-900" : "bg-indigo-50/70 dark:bg-indigo-950/30"}`}>
                  <div className="mt-1 rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-semibold">{notification.title}</h2>
                      <time className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString("vi-VN")}</time>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                  </div>
                  {!notification.isRead && (
                    <Button variant="ghost" size="sm" onClick={() => markRead.mutate(notification.id)}>
                      Đã đọc
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
