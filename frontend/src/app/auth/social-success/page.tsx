"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/src/client/auth/auth.keys";
import { browserApiClient } from "@/src/lib/bff";
import { BrandLogo } from "@/src/components";
import { UserProfile } from "@/src/types/api";

function SocialSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setErrorMessage("Không tìm thấy mã truy cập xác thực từ Google.");
        setTimeout(() => router.replace("/login?error=oauth_failed"), 2500);
        return;
      }

      try {
        // Lấy hoặc tạo deviceId
        let deviceId = localStorage.getItem("x-device-id");
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem("x-device-id", deviceId);
        }

        // Gọi BFF để lưu Access Token vào Redis Session của BFF
        const response = await browserApiClient.post<{
          user: UserProfile;
          deviceId: string;
        }>("/auth/social-session", {
          accessToken: token,
          deviceId,
        });

        const user = response.data.data.user;

        // Cập nhật React Query cache
        queryClient.setQueryData(authKeys.profile(), {
          statusCode: 200,
          data: user,
        });

        // Điều hướng theo role
        if (user.role === "ADMIN") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Lỗi khởi tạo phiên OAuth:", err);
        setErrorMessage("Xác thực đăng nhập Google thất bại. Đang chuyển hướng về trang đăng nhập...");
        setTimeout(() => router.replace("/login?error=oauth_failed"), 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, queryClient]);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800">
      <BrandLogo className="mb-6" />

      {errorMessage ? (
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center text-xl font-bold">
            ✕
          </div>
          <h2 className="text-lg font-semibold text-rose-600 dark:text-rose-400">Đăng Nhập Thất Bại</h2>
          <p className="text-sm text-gray-500">{errorMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <h2 className="text-lg font-semibold">Đang Xác Thực Tài Khoản...</h2>
          <p className="text-sm text-gray-500">
            Hệ thống đang đồng bộ dữ liệu phiên đăng nhập Google. Vui lòng đợi trong giây lát.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SocialSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-slate-50 via-indigo-50 to-white dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-gray-500">
            Đang tải dữ liệu...
          </div>
        }
      >
        <SocialSuccessContent />
      </Suspense>
    </div>
  );
}
