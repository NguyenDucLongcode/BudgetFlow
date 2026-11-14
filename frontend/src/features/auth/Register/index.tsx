"use client";

import { useTranslations } from "next-intl";
import { BrandLogo } from "@/src/components";
import { LanguageSwitcher } from "@/src/components/common/LanguageSwitcher";
import BackgroundDecoration from "../components/Background-decoration";
import AuthBanner from "../components/AuthBanner";
import RegisterForm from "./RegisterForm";

export default function RegisterPageComponent() {
  const t = useTranslations("auth");

  return (
    <div
      className=" min-h-screen flex items-center justify-center p-4 relative overflow-hidden
        bg-linear-to-br from-slate-50 via-indigo-50 to-white dark:from-gray-950 dark:via-slate-900 dark:to-gray-950
      "
    >
      {/* Top Language Switcher */}
      <div className="absolute top-4 right-4 z-30">
        <LanguageSwitcher />
      </div>

      {/* Main Card */}
      <div
        className="relative w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-3xl
          bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-2xl
        "
      >
        {/* Register Section */}
        <div className="p-8 sm:p-10 lg:p-14">
          <div className="max-w-md mx-auto">
            {/* Logo */}
            <BrandLogo className="mb-5" />

            {/* Register Form */}
            <RegisterForm />
          </div>
        </div>

        {/* Background Decoration */}
        <BackgroundDecoration />

        {/* Banner right */}
        <AuthBanner
          icon="🚀"
          title={t("registerBannerTitle")}
          description={t("registerBannerDesc")}
          tags={[t("registerTagFree"), t("registerTagSecure"), t("registerTagSmart")]}
        />
      </div>
    </div>
  );
}
