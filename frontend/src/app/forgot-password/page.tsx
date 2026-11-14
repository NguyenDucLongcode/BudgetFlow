"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/src/components";
import { AppLink, SubmitButton, TextField } from "@/src/components/ui";
import { LanguageSwitcher } from "@/src/components/common/LanguageSwitcher";
import { browserApiClient } from "@/src/lib/bff";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .trim(),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const t = useTranslations("authPages");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);
    try {
      await browserApiClient.post("/auth/forgot-password", {
        email: data.email,
      });
      setIsSubmitted(true);
    } catch {
      // Security: always display submitted state to avoid email enumeration
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-linear-to-br from-slate-50 via-indigo-50 to-white dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div className="absolute top-4 right-4 z-30">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md p-8 sm:p-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl">
        <BrandLogo className="mb-6" />

        {isSubmitted ? (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">{t("checkYourInboxTitle")}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("checkYourInboxDesc")}
            </p>

            <div className="pt-4">
              <AppLink
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("backToLogin")}
              </AppLink>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("forgotPasswordTitle")}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {t("forgotPasswordDesc")}
              </p>
            </div>

            {serverError && (
              <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <TextField
                id="email"
                label="Email"
                type="email"
                placeholder="name@example.com"
                leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
                registration={register("email")}
                error={errors.email}
              />

              <SubmitButton
                className="w-full"
                isSubmitting={isSubmitting}
                isValid={isValid}
              >
                {t("sendResetInstructions")}
              </SubmitButton>

              <div className="text-center pt-2">
                <AppLink
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("backToLogin")}
                </AppLink>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
