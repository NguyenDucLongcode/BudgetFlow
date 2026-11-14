"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/src/components";
import { AppLink, PasswordField, SubmitButton } from "@/src/components/ui";
import { LanguageSwitcher } from "@/src/components/common/LanguageSwitcher";
import { browserApiClient } from "@/src/lib/bff";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const t = useTranslations("authPages");
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
      setServerError(t("invalidTokenDesc"));
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
          "Failed to reset password. The link might have expired or already been used.",
      );
    }
  };

  if (!token) {
    return (
      <div className="space-y-5 text-center">
        <h2 className="text-xl font-bold text-rose-600">{t("invalidTokenTitle")}</h2>
        <p className="text-sm text-gray-500">
          {t("invalidTokenDesc")}
        </p>
        <div className="pt-2">
          <AppLink
            href="/forgot-password"
            className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            {t("requestAgain")}
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
          <h2 className="text-xl font-bold">{t("passwordChangedTitle")}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("passwordChangedDesc")}
          </p>

          <div className="pt-4">
            <AppLink
              href="/login"
              className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
            >
              {t("loginWithNewPassword")}
            </AppLink>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("resetPasswordTitle")}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {t("resetPasswordDesc")}
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
              label={t("newPasswordLabel")}
              placeholder={t("newPasswordPlaceholder")}
              registration={register("newPassword")}
              error={errors.newPassword}
            />

            <PasswordField
              id="confirmPassword"
              label={t("confirmNewPasswordLabel")}
              placeholder={t("confirmNewPasswordPlaceholder")}
              registration={register("confirmPassword")}
              error={errors.confirmPassword}
            />

            <SubmitButton
              className="w-full"
              isSubmitting={isSubmitting}
              isValid={isValid}
            >
              {t("updatePassword")}
            </SubmitButton>

            <div className="text-center pt-2">
              <AppLink
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("cancelAndLogin")}
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
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-linear-to-br from-slate-50 via-indigo-50 to-white dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div className="absolute top-4 right-4 z-30">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md p-8 sm:p-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl">
        <BrandLogo className="mb-6" />
        <Suspense
          fallback={
            <div className="p-8 text-center text-sm text-gray-500">
              ...
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
