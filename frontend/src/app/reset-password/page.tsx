"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/src/components";
import { AppLink, PasswordField, SubmitButton } from "@/src/components/ui";
import { browserApiClient } from "@/src/lib/bff";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu mới")
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất một chữ hoa")
      .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất một chữ thường")
      .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất một số")
      .regex(/[^A-Za-z0-9]/, "Mật khẩu phải chứa ít nhất một ký tự đặc biệt"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không trùng khớp",
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);

    if (!token) {
      setServerError("Mã đặt lại mật khẩu không hợp lệ hoặc bị thiếu.");
      return;
    }

    try {
      await browserApiClient.post("/auth/reset-password", {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setServerError(
        err.response?.data?.message ||
          "Đặt lại mật khẩu thất bại. Mã liên kết có thể đã hết hạn hoặc đã được sử dụng.",
      );
    }
  };

  if (!token) {
    return (
      <div className="space-y-5 text-center">
        <h2 className="text-xl font-bold text-rose-600">Liên Kết Không Hợp Lệ</h2>
        <p className="text-sm text-gray-500">
          Không tìm thấy mã bảo mật để đặt lại mật khẩu. Vui lòng yêu cầu lại đường dẫn mới.
        </p>
        <div className="pt-2">
          <AppLink
            href="/forgot-password"
            className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Yêu Cầu Lại
          </AppLink>
        </div>
      </div>
    );
  }

  return (
    <div>
      {isSuccess ? (
        <div className="space-y-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Mật Khẩu Đã Được Thay Đổi!</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bạn đã cập nhật mật khẩu mới thành công. Toàn bộ phiên đăng nhập cũ đã được thu hồi vì lý do an toàn.
          </p>

          <div className="pt-4">
            <AppLink
              href="/login"
              className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
            >
              Đăng Nhập Với Mật Khẩu Mới
            </AppLink>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Đặt Lại Mật Khẩu</h2>
            <p className="mt-1 text-sm text-gray-500">
              Vui lòng thiết lập mật khẩu mới có độ bảo mật cao cho tài khoản của bạn.
            </p>
          </div>

          {serverError && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <PasswordField
              id="newPassword"
              label="Mật khẩu mới"
              placeholder="Nhập ít nhất 8 ký tự"
              registration={register("newPassword")}
              error={errors.newPassword}
            />

            <PasswordField
              id="confirmPassword"
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              registration={register("confirmPassword")}
              error={errors.confirmPassword}
            />

            <SubmitButton
              className="w-full"
              isSubmitting={isSubmitting}
              isValid={isValid}
            >
              Cập Nhật Mật Khẩu
            </SubmitButton>

            <div className="text-center pt-2">
              <AppLink
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Hủy và quay lại đăng nhập
              </AppLink>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-slate-50 via-indigo-50 to-white dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div className="w-full max-w-md p-8 sm:p-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl">
        <BrandLogo className="mb-6" />
        <Suspense
          fallback={
            <div className="p-8 text-center text-sm text-gray-500">
              Đang tải biểu mẫu...
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
