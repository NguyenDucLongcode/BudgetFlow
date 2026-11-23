"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { browserApiClient } from "@/src/lib/bff";
import { BrandLogo } from "@/src/components";
import { AppLink } from "@/src/components/ui";
import { LanguageSwitcher } from "@/src/components/common/LanguageSwitcher";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

function VerifyEmailContent() {
  const t = useTranslations("authPages");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState<string>(token ? t("verifying") : t("noToken"));

  useEffect(() => {
    if (!token) {
      return;
    }

    const verify = async () => {
      try {
        const res = await browserApiClient.get<{ message?: string }>(
          "/auth/verify-email",
          { token },
        );
        setStatus("success");
        setMessage(res.data.data?.message || t("verifySuccessDesc"));
      } catch (err: unknown) {
        setStatus("error");
        let msg = t("verifyFailedDesc");
        if (typeof err === "object" && err !== null) {
          const errObj = err as Record<string, unknown>;
          const resp = errObj.response as Record<string, unknown> | undefined;
          const respData = resp?.data as Record<string, unknown> | undefined;
          if (typeof respData?.message === "string") msg = respData.message;
        }
        setMessage(msg);
      }
    };

    verify();
  }, [token, t]);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-10 max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800">
      <BrandLogo className="mb-6" />

      {status === "loading" && (
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <h2 className="text-xl font-semibold">{t("verifyEmailTitle")}</h2>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("verifySuccessTitle")}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{message}</p>

          <div className="pt-2">
            <AppLink
              href="/login"
              className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
            >
              {t("loginNow")}
            </AppLink>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("verifyFailedTitle")}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{message}</p>

          <div className="pt-2 flex flex-col gap-2">
            <AppLink
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("backToLogin")}
            </AppLink>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-linear-to-br from-slate-50 via-indigo-50 to-white dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div className="absolute top-4 right-4 z-30">
        <LanguageSwitcher />
      </div>
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-gray-500">
            ...
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
