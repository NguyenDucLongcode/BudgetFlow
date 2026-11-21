"use client";

import {
  MoreVertical,
  Pencil,
  Star,
  Archive,
  RefreshCw,
  Trash2,
  Wallet as WalletIcon,
  Landmark,
  Smartphone,
  CreditCard,
  TrendingUp,
  Coins,
  PiggyBank,
  CheckCircle2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { Wallet } from "@/src/types/api";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu";

interface WalletCardProps {
  wallet: Wallet;
  onEdit: (wallet: Wallet) => void;
  onSetDefault: (id: string) => void;
  onArchive: (id: string, archive: boolean) => void;
  onDelete?: (id: string) => void;
  isSettingDefault?: boolean;
  isArchiving?: boolean;
}

export const WALLET_ICONS: Record<string, any> = {
  wallet: WalletIcon,
  landmark: Landmark,
  smartphone: Smartphone,
  "credit-card": CreditCard,
  "trending-up": TrendingUp,
  coins: Coins,
  "piggy-bank": PiggyBank,
};

export function WalletCard({
  wallet,
  onEdit,
  onSetDefault,
  onArchive,
  onDelete,
  isSettingDefault,
  isArchiving,
}: WalletCardProps) {
  const t = useTranslations("wallets");

  const IconComponent = WALLET_ICONS[wallet.icon || "wallet"] || WalletIcon;
  const balanceNumber = Number(wallet.balance) || 0;
  const cardColor = wallet.color || "#6366F1";

  const typeLabels: Record<string, string> = {
    CASH: t("cash"),
    BANK: t("bank"),
    E_WALLET: t("eWallet"),
    CREDIT: t("credit"),
    INVESTMENT: t("investment"),
  };

  return (
    <div
      className={`relative group rounded-3xl border transition-all duration-200 bg-[#111827]/90 shadow-xl backdrop-blur-sm hover:-translate-y-1 ${
        wallet.isArchived
          ? "border-slate-800 opacity-60 hover:opacity-100"
          : "border-slate-800/90 hover:border-slate-700 hover:shadow-indigo-500/5"
      }`}
    >
      {/* Top Accent Color Bar */}
      <div
        className="h-2 w-full rounded-t-3xl transition-all group-hover:h-2.5"
        style={{ backgroundColor: cardColor }}
      />

      <div className="p-5 sm:p-6 space-y-5">
        {/* Header: Icon, Name, Type, and 3-dots Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Custom Icon Box */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ring-4 ring-white/5"
              style={{ backgroundColor: cardColor }}
            >
              <IconComponent className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate leading-tight">
                  {wallet.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400 font-medium">
                  {typeLabels[wallet.type] || wallet.type}
                </span>

                {wallet.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{t("defaultBadge")}</span>
                  </span>
                )}

                {wallet.isArchived && (
                  <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                    {t("archivedBadge")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3-dots Action Menu using DropdownMenu (Render qua Portal, không bị cắt overflow) */}
          <div className="relative shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Wallet actions"
              >
                <MoreVertical className="w-4 h-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="bottom"
                align="end"
                sideOffset={6}
                className="z-50 w-48 rounded-2xl border border-slate-800 bg-[#1E293B] p-1.5 shadow-2xl backdrop-blur-xl text-slate-100"
              >
                {/* Edit */}
                <DropdownMenuItem
                  onClick={() => onEdit(wallet)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t("edit")}</span>
                </DropdownMenuItem>

                {/* Set Default */}
                {!wallet.isDefault && !wallet.isArchived && (
                  <DropdownMenuItem
                    onClick={() => onSetDefault(wallet.id)}
                    disabled={isSettingDefault}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t("setDefault")}</span>
                  </DropdownMenuItem>
                )}

                {/* Archive / Restore */}
                <DropdownMenuItem
                  onClick={() => onArchive(wallet.id, !wallet.isArchived)}
                  disabled={isArchiving}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 cursor-pointer transition-colors"
                >
                  {wallet.isArchived ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t("unarchive")}</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t("archive")}</span>
                    </>
                  )}
                </DropdownMenuItem>

                {/* Delete */}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator className="my-1 border-slate-800" />
                    <DropdownMenuItem
                      onClick={() => {
                        if (window.confirm(t("confirmDelete"))) {
                          onDelete(wallet.id);
                        }
                      }}
                      variant="destructive"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>{t("delete")}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bank details if available */}
        {wallet.type === "BANK" && wallet.bankName && (
          <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span className="font-medium text-slate-300">{wallet.bankName}</span>
            {wallet.accountNumber && (
              <span className="font-mono text-slate-500">•••• {wallet.accountNumber.slice(-4)}</span>
            )}
          </div>
        )}

        {/* Balance Display */}
        <div className="pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {t("balance")}
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
              {balanceNumber.toLocaleString("en-US")}
            </span>
            <span className="text-sm font-semibold text-slate-400">{wallet.currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
