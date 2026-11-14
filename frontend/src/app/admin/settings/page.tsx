"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Settings,
  Shield,
  Sliders,
  CheckCircle2,
  Save,
} from "lucide-react";

export default function AdminSettingsPage() {
  const t = useTranslations("settings");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState(15);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = () => {
    showToast(t("saveSuccess"));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-semibold text-slate-950 shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-[#334155]/60 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-emerald-400" />
          {t("title")}
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          {t("subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Security Policies Card */}
        <div className="rounded-2xl p-6 bg-[#1E293B] border border-[#334155] shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{t("securityPolicies")}</h2>
              <p className="text-xs text-slate-400">{t("securityPoliciesDesc")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                {t("accessTokenLifetime")}
              </label>
              <input
                type="number"
                value={sessionTimeoutMins}
                onChange={(e) => setSessionTimeoutMins(Number(e.target.value))}
                className="w-full h-10 rounded-xl border border-[#334155] bg-[#0F172A] px-3 text-white focus:border-emerald-500/50 focus:outline-hidden font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">{t("accessTokenLifetimeDesc")}</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                {t("maxLoginAttempts")}
              </label>
              <input
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
                className="w-full h-10 rounded-xl border border-[#334155] bg-[#0F172A] px-3 text-white focus:border-emerald-500/50 focus:outline-hidden font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">{t("maxLoginAttemptsDesc")}</span>
            </div>
          </div>
        </div>

        {/* Maintenance Card */}
        <div className="rounded-2xl p-6 bg-[#1E293B] border border-[#334155] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{t("maintenanceMode")}</h2>
                <p className="text-xs text-slate-400">{t("maintenanceModeDesc")}</p>
              </div>
            </div>

            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                maintenanceMode ? "bg-amber-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  maintenanceMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Save className="h-4 w-4" />
            {t("saveSettings")}
          </button>
        </div>
      </div>
    </div>
  );
}
