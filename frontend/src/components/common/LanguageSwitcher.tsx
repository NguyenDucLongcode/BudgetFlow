"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Globe, Check, ChevronDown } from "lucide-react";
import { browserApiClient } from "@/src/lib/bff";

const LANGUAGES = [
  { code: "en", dbCode: "EN", label: "English", flag: "🇬🇧" },
  { code: "vi", dbCode: "VI", label: "Tiếng Việt", flag: "🇻🇳" },
] as const;

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const t = useTranslations("language");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang =
    LANGUAGES.find(
      (lang) => lang.code.toLowerCase() === currentLocale.toLowerCase(),
    ) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLanguage = async (lang: (typeof LANGUAGES)[number]) => {
    setIsOpen(false);
    if (lang.code.toLowerCase() === currentLocale.toLowerCase()) return;

    // 1. Cập nhật cookie NEXT_LOCALE trên client
    document.cookie = `NEXT_LOCALE=${lang.code}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;

    // 2. Gửi API lưu vào Database nếu user đã đăng nhập
    try {
      await browserApiClient.patch("/users/preferences", {
        language: lang.dbCode,
      });
    } catch {
      // Ignored nếu user chưa đăng nhập hoặc offline
    }

    // 3. Refresh Next.js UI và reload trang để kích hoạt toàn bộ components (cả server và client) cập nhật ngôn ngữ ngay lập tức
    startTransition(() => {
      router.refresh();
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    });
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 rounded-xl border border-[#334155]/70 bg-[#1E293B]/80 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:border-emerald-500/50 hover:bg-[#1E293B] hover:text-white focus:outline-hidden disabled:opacity-50"
        aria-label={t("switcher")}
      >
        <Globe className="h-3.5 w-3.5 text-emerald-400" />
        <span className="flex items-center gap-1.5">
          <span>{activeLang.flag}</span>
          <span className="uppercase text-[11px] font-bold tracking-wider">
            {activeLang.code}
          </span>
        </span>
        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-40 origin-top-right rounded-xl border border-[#334155] bg-[#0F172A] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t("switcher")}
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected =
              lang.code.toLowerCase() === currentLocale.toLowerCase();
            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                    : "text-slate-300 hover:bg-[#1E293B] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
