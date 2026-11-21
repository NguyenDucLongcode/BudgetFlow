"use client";

import { useTranslations } from "next-intl";
import { Globe, Shield } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { LanguageSwitcher } from "@/src/components/common/LanguageSwitcher";

export default function SettingsPage() {
  const t = useTranslations("userLayout");
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {t("settings")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Quản lý tài khoản cá nhân, ngôn ngữ và tùy chọn hệ thống
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-[#111827]/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-indigo-500/10">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user?.name || "User"}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-semibold">
                <Shield className="w-3 h-3" />
                <span>{user?.role || "USER"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-[#111827]/80 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
            Tùy chọn hiển thị
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-sm font-semibold text-white">Ngôn ngữ hiển thị (Language)</p>
                <p className="text-xs text-slate-400">Chuyển đổi giữa Tiếng Việt và English</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
