"use client";

import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import {
  Wallet as WalletIcon,
  Landmark,
  Smartphone,
  CreditCard,
  TrendingUp,
  Coins,
  PiggyBank,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { CurrencyInput } from "@/src/components/ui/currency-input";
import { WalletType } from "@/src/types/enums";
import type { Wallet, CreateWalletInput, UpdateWalletInput } from "@/src/types/api";

const COLOR_SWATCHES = [
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#EF4444", // Rose
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
];

const AVAILABLE_ICONS = [
  { id: "wallet", label: "Tiền mặt", icon: WalletIcon },
  { id: "landmark", label: "Ngân hàng", icon: Landmark },
  { id: "smartphone", label: "Ví điện tử", icon: Smartphone },
  { id: "credit-card", label: "Thẻ tín dụng", icon: CreditCard },
  { id: "trending-up", label: "Đầu tư", icon: TrendingUp },
  { id: "coins", label: "Tiền xu", icon: Coins },
  { id: "piggy-bank", label: "Tiết kiệm", icon: PiggyBank },
];

// Bản đồ Icon mặc định theo từng loại ví
const DEFAULT_ICON_BY_TYPE: Record<WalletType, string> = {
  [WalletType.CASH]: "wallet",
  [WalletType.BANK]: "landmark",
  [WalletType.E_WALLET]: "smartphone",
  [WalletType.CREDIT]: "credit-card",
  [WalletType.INVESTMENT]: "trending-up",
};

const walletFormSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên ví"),
  type: z.nativeEnum(WalletType),
  initialBalance: z.number().min(0, "Số dư không được nhỏ hơn 0"),
  currency: z.string().min(1, "Vui lòng chọn đơn vị tiền tệ"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Mã màu không hợp lệ"),
  icon: z.string().min(1),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  description: z.string().optional(),
});

type WalletFormValues = z.infer<typeof walletFormSchema>;

interface WalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletToEdit?: Wallet | null;
  onSubmit: (data: CreateWalletInput | UpdateWalletInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function WalletDialog({
  open,
  onOpenChange,
  walletToEdit,
  onSubmit,
  isSubmitting,
}: WalletDialogProps) {
  const t = useTranslations("wallets");
  const isEditing = Boolean(walletToEdit);
  const prevTypeRef = useRef<WalletType | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      name: "",
      type: WalletType.CASH,
      initialBalance: 0,
      currency: "VND",
      color: "#6366F1",
      icon: "wallet",
      bankName: "",
      accountNumber: "",
      description: "",
    },
  });

  const selectedColor = watch("color");
  const selectedIcon = watch("icon");
  const selectedType = watch("type");
  const selectedCurrency = watch("currency") || "VND";

  // Sync form values on open or walletToEdit change
  useEffect(() => {
    if (open) {
      if (walletToEdit) {
        prevTypeRef.current = walletToEdit.type;
        reset({
          name: walletToEdit.name,
          type: walletToEdit.type,
          initialBalance: Number(walletToEdit.initialBalance) || 0,
          currency: walletToEdit.currency || "VND",
          color: walletToEdit.color || "#6366F1",
          icon: walletToEdit.icon || DEFAULT_ICON_BY_TYPE[walletToEdit.type] || "wallet",
          bankName: walletToEdit.bankName || "",
          accountNumber: walletToEdit.accountNumber || "",
          description: walletToEdit.description || "",
        });
      } else {
        prevTypeRef.current = WalletType.CASH;
        reset({
          name: "",
          type: WalletType.CASH,
          initialBalance: 0,
          currency: "VND",
          color: "#6366F1",
          icon: DEFAULT_ICON_BY_TYPE[WalletType.CASH],
          bankName: "",
          accountNumber: "",
          description: "",
        });
      }
    } else {
      prevTypeRef.current = null;
    }
  }, [open, walletToEdit, reset]);

  // Tự động chọn Icon tương ứng khi loại ví thay đổi (người dùng vẫn có thể click chọn icon khác)
  useEffect(() => {
    if (!open) return;
    if (prevTypeRef.current !== null && prevTypeRef.current !== selectedType) {
      const defaultIcon = DEFAULT_ICON_BY_TYPE[selectedType] || "wallet";
      setValue("icon", defaultIcon);
    }
    prevTypeRef.current = selectedType;
  }, [selectedType, open, setValue]);

  const onFormSubmit = async (values: WalletFormValues) => {
    if (isEditing) {
      const updatePayload: UpdateWalletInput = {
        name: values.name,
        currency: values.currency,
        color: values.color,
        icon: values.icon,
        bankName: values.bankName || undefined,
        accountNumber: values.accountNumber || undefined,
        description: values.description || undefined,
      };
      await onSubmit(updatePayload);
    } else {
      const createPayload: CreateWalletInput = {
        name: values.name,
        type: values.type,
        initialBalance: values.initialBalance,
        currency: values.currency,
        color: values.color,
        icon: values.icon,
        bankName: values.bankName || undefined,
        accountNumber: values.accountNumber || undefined,
        description: values.description || undefined,
      };
      await onSubmit(createPayload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-800 bg-[#111827] text-slate-100 sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DialogTitle className="text-xl font-bold text-white">
              {isEditing ? t("editTitle") : t("createTitle")}
            </DialogTitle>
            {!isEditing && (
              <span className="text-[11px] font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                {t("maxWalletsNotice", { max: 5 })}
              </span>
            )}
          </div>
          <DialogDescription className="text-slate-400 text-xs mt-1">
            {isEditing ? t("editSubtitle") : t("createSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 py-2">
          {/* Tên ví */}
          <div>
            <label className="text-xs font-semibold text-slate-300">
              {t("nameLabel")} <span className="text-rose-400">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder={t("namePlaceholder")}
              className="mt-1.5 border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:border-indigo-500"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
            )}
          </div>

          {/* Loại ví & Đơn vị tiền tệ (Grid 2 cột) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Loại ví */}
            <div>
              <label className="text-xs font-semibold text-slate-300">
                {t("typeLabel")} <span className="text-rose-400">*</span>
              </label>
              <select
                {...register("type")}
                disabled={isEditing}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="CASH">{t("cash")}</option>
                <option value="BANK">{t("bank")}</option>
                <option value="E_WALLET">{t("eWallet")}</option>
                <option value="CREDIT">{t("credit")}</option>
                <option value="INVESTMENT">{t("investment")}</option>
              </select>
            </div>

            {/* Đơn vị tiền tệ */}
            <div>
              <label className="text-xs font-semibold text-slate-300">
                {t("currencyLabel")} <span className="text-rose-400">*</span>
              </label>
              <select
                {...register("currency")}
                disabled={isEditing}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="VND">VND (₫) - Việt Nam Đồng</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
                <option value="CNY">CNY (¥) - Chinese Yuan</option>
                <option value="KRW">KRW (₩) - Korean Won</option>
                <option value="AUD">AUD (A$) - Australian Dollar</option>
                <option value="CAD">CAD (C$) - Canadian Dollar</option>
                <option value="CHF">CHF (CHF) - Swiss Franc</option>
              </select>
            </div>
          </div>

          {/* Số dư ban đầu (Chỉ cho phép khi Tạo mới) dùng CurrencyInput */}
          {!isEditing && (
            <div>
              <label className="text-xs font-semibold text-slate-300">
                {t("initialBalanceLabel")} <span className="text-rose-400">*</span>
              </label>
              <div className="mt-1.5">
                <Controller
                  name="initialBalance"
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      currency={selectedCurrency}
                      placeholder="0"
                    />
                  )}
                />
              </div>
              {errors.initialBalance && (
                <p className="mt-1 text-xs text-rose-400">{errors.initialBalance.message}</p>
              )}
            </div>
          )}

          {/* Ngân hàng nếu loại là BANK */}
          {selectedType === "BANK" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div>
                <label className="text-[11px] font-medium text-slate-400">Tên ngân hàng</label>
                <Input
                  {...register("bankName")}
                  placeholder="Ví dụ: Vietcombank, MBBank..."
                  className="mt-1 text-xs border-slate-700 bg-slate-900 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400">Số tài khoản</label>
                <Input
                  {...register("accountNumber")}
                  placeholder="Số tài khoản"
                  className="mt-1 text-xs border-slate-700 bg-slate-900 text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* Chọn Icon */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Biểu tượng ví</label>
              <span className="text-[11px] text-slate-500">Tự động chọn theo loại ví, có thể tùy chỉnh</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedIcon === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setValue("icon", item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md scale-105"
                        : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chọn Màu sắc */}
          <div>
            <label className="text-xs font-semibold text-slate-300">
              {t("colorLabel")}
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              {COLOR_SWATCHES.map((color) => {
                const isSelected = selectedColor === color;

                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue("color", color)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isSelected ? "scale-115 ring-2 ring-white ring-offset-2 ring-offset-[#111827]" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 bg-slate-850 text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              {isSubmitting ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
