"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { OpsSidebar } from "./OpsSidebar";
import { OpsTopbar } from "./OpsTopbar";
import { authService, clearAuthState } from "@/src/client/auth";
import { authKeys } from "@/src/client/auth/auth.keys";
import { queryClient } from "@/src/lib/react-query/query-client";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import { ShieldAlert, RotateCcw, LogOut, ArrowLeft } from "lucide-react";
import type { UserProfile } from "@/src/types/api";

interface AdminLayoutClientProps {
  user?: UserProfile | null | undefined;
  initialError?: string | null | undefined;
  children: React.ReactNode;
}

export function AdminLayoutClient({
  user,
  initialError,
  children,
}: AdminLayoutClientProps) {
  const router = useRouter();
  const tCommon = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Gọi thông qua BFF route handler /api/users/me (dùng browserApiClient có sẵn token & deviceId)
  const {
    data: profileRes,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      try {
        return await authService.getProfile();
      } catch (err) {
        console.error(
          "[AdminLayoutClient] authService.getProfile() error:",
          err,
        );
        throw err;
      }
    },
    initialData: user
      ? {
          statusCode: 200,
          message: "Success",
          data: user,
          timestamp: new Date().toISOString(),
          path: "/api/users/me",
        }
      : undefined,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 phút cache
  });

  const currentUser = profileRes?.data ?? user ?? null;

  // Hiển thị Skeleton Loading khi đang fetch và chưa có dữ liệu user
  if (isLoading && !currentUser) {
    return (
      <div className="flex min-h-screen bg-[#0F172A] text-slate-100 font-sans antialiased">
        <aside className="w-64 border-r border-[#334155] bg-[#1E293B] p-4 hidden lg:block">
          <Skeleton className="h-9 w-36 bg-slate-800 mb-8 rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton
                key={i}
                className="h-9 w-full bg-slate-800/60 rounded-md"
              />
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
          <header className="h-16 border-b border-[#334155] bg-[#1E293B] px-6 flex items-center justify-between">
            <Skeleton className="h-5 w-40 bg-slate-800" />
            <Skeleton className="h-8 w-8 rounded-full bg-slate-800" />
          </header>
          <main className="flex-1 p-6 space-y-6">
            <Skeleton className="h-8 w-48 bg-slate-800" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 bg-slate-800/80 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 bg-slate-800/50 rounded-xl" />
          </main>
        </div>
      </div>
    );
  }

  // Trường hợp gặp lỗi tải Profile: Hiển thị giao diện báo lỗi rõ ràng kèm tùy chọn thử lại / đăng nhập lại
  if (isError && !currentUser) {
    const errorMsg =
      (error as any)?.response?.data?.message ||
      (error as any)?.message ||
      initialError ||
      "Không thể xác thực thông tin tài khoản qua /api/users/me.";

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A] p-4 text-slate-100 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#1E293B] p-6 shadow-2xl space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              Lỗi Xác Thực Quản Trị Viên
            </h2>
            <p className="text-xs text-rose-300/90 bg-rose-950/40 p-3 rounded-lg border border-rose-800/40 text-left font-mono break-all">
              {errorMsg}
            </p>
            <p className="text-xs text-slate-400">
              Vui lòng thử tải lại dữ liệu hoặc đăng nhập lại bằng tài khoản có
              quyền ADMIN.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="flex-1 border-[#334155] bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-200"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              {tCommon("retry")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearAuthState(queryClient, "/login?error=auth_failed");
              }}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-xs text-white"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              {tCommon("relogin")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Trường hợp User không có quyền ADMIN
  if (currentUser && currentUser.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A] p-4 text-slate-100 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-[#1E293B] p-6 shadow-2xl space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              Truy Cập Bị Từ Chối
            </h2>
            <p className="text-xs text-slate-300">
              Tài khoản hiện tại (
              <span className="text-emerald-400 font-medium">
                {currentUser.email}
              </span>
              ) có vai trò là{" "}
              <span className="font-semibold text-amber-400">
                {currentUser.role}
              </span>
              , không đủ quyền để truy cập Admin Console.
            </p>
          </div>
          <Button
            onClick={() => router.replace("/dashboard")}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-xs text-white"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            {tCommon("backToUserDashboard")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0F172A] text-slate-100 font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Sidebar */}
      <OpsSidebar
        user={currentUser ?? undefined}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Topbar */}
        <OpsTopbar
          user={currentUser ?? undefined}
          onMenuToggle={() => setMobileOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
