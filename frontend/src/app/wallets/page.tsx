"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Archive,
  CreditCard,
  Landmark,
  MoreHorizontal,
  Pencil,
  Plus,
  Smartphone,
  Star,
  TrendingUp,
  Wallet as WalletIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { browserApiClient } from "@/src/lib/bff";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { Input } from "@/src/components/ui/input";
import { BrandLogo } from "@/src/components";
import { LanguageSwitcher } from "@/src/components/common/LanguageSwitcher";
import { NotificationBell } from "@/src/components/notifications/NotificationBell";

type WalletType = "CASH" | "BANK" | "E_WALLET" | "CREDIT" | "INVESTMENT";

interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number | string;
  initialBalance: number | string;
  currency: string;
  icon?: string | null;
  color?: string | null;
  isDefault: boolean;
  isArchived: boolean;
}

const walletSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(["CASH", "BANK", "E_WALLET", "CREDIT", "INVESTMENT"]),
  initialBalance: z.coerce.number().min(0),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  icon: z.string().min(1),
});

const iconMap = {
  wallet: WalletIcon,
  landmark: Landmark,
  smartphone: Smartphone,
  "credit-card": CreditCard,
  "trending-up": TrendingUp,
};

const typeLabels: Record<WalletType, string> = {
  CASH: "cash",
  BANK: "bank",
  E_WALLET: "eWallet",
  CREDIT: "credit",
  INVESTMENT: "investment",
};

const defaultForm = {
  name: "",
  type: "CASH" as WalletType,
  initialBalance: "0",
  color: "#6366F1",
  icon: "wallet",
};

export default function WalletsPage() {
  const t = useTranslations("wallets");
  const queryClient = useQueryClient();
  const [showArchived, setShowArchived] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const walletsQuery = useQuery({
    queryKey: ["wallets", { showArchived }],
    queryFn: async () => {
      const response = await browserApiClient.get<Wallet[]>("/wallets", {
        page: "1",
        limit: "100",
        isArchived: String(showArchived),
      });
      return response.data.data ?? [];
    },
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingWallet(null);
    setForm(defaultForm);
    setError(null);
  };

  const openCreate = () => {
    setEditingWallet(null);
    setForm(defaultForm);
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setForm({
      name: wallet.name,
      type: wallet.type,
      initialBalance: String(wallet.initialBalance),
      color: wallet.color ?? "#6366F1",
      icon: wallet.icon ?? "wallet",
    });
    setError(null);
    setDialogOpen(true);
  };

  const invalidateWallets = async (message: string) => {
    await queryClient.invalidateQueries({ queryKey: ["wallets"] });
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = walletSchema.safeParse(form);
      if (!parsed.success) {
        throw new Error(t("validationError"));
      }
      const payload = {
        name: parsed.data.name,
        type: parsed.data.type,
        initialBalance: parsed.data.initialBalance,
        color: parsed.data.color,
        icon: parsed.data.icon,
      };
      return editingWallet
        ? browserApiClient.patch(`/wallets/${editingWallet.id}`, payload)
        : browserApiClient.post("/wallets", payload);
    },
    onSuccess: async () => {
      closeDialog();
      await invalidateWallets(editingWallet ? t("updated") : t("created"));
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : t("saveError"));
    },
  });

  const defaultMutation = useMutation({
    mutationFn: (id: string) => browserApiClient.patch(`/wallets/${id}/set-default`),
    onSuccess: () => invalidateWallets(t("defaultUpdated")),
    onError: () => setToast(t("saveError")),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => browserApiClient.patch(`/wallets/${id}`, { isArchived: true }),
    onSuccess: () => invalidateWallets(t("archived")),
    onError: () => setToast(t("saveError")),
  });

  const wallets = walletsQuery.data ?? [];
  const hasWallets = wallets.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <BrandLogo />
            <Link href="/dashboard" className="hidden text-sm text-slate-400 hover:text-white sm:block">{t("dashboard")}</Link>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <NotificationBell />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-400">{t("eyebrow")}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="mt-2 text-sm text-slate-400">{t("subtitle")}</p>
          </div>
          <Button onClick={openCreate} className="bg-indigo-600 text-white hover:bg-indigo-500">
            <Plus className="mr-2 h-4 w-4" />
            {t("create")}
          </Button>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
            {t("showArchived")}
          </label>
          {walletsQuery.isFetching && <span className="text-xs text-slate-500">{t("loading")}</span>}
        </div>

        {walletsQuery.isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-52 animate-pulse rounded-2xl bg-slate-800" />)}
          </div>
        ) : !hasWallets ? (
          <Card className="border-dashed border-slate-700 bg-slate-900/70">
            <CardContent className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-5 rounded-2xl bg-indigo-500/10 p-5 text-indigo-400"><WalletIcon className="h-10 w-10" /></div>
              <h2 className="text-xl font-semibold">{t("emptyTitle")}</h2>
              <p className="mt-2 max-w-md text-sm text-slate-400">{t("emptyDescription")}</p>
              <Button onClick={openCreate} className="mt-6 bg-indigo-600 text-white hover:bg-indigo-500">
                <Plus className="mr-2 h-4 w-4" /> {t("createFirst")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {wallets.map((wallet) => {
              const Icon = iconMap[wallet.icon as keyof typeof iconMap] ?? WalletIcon;
              return (
                <Card key={wallet.id} className="overflow-hidden border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
                  <div className="h-1" style={{ backgroundColor: wallet.color ?? "#6366F1" }} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl p-3" style={{ backgroundColor: `${wallet.color ?? "#6366F1"}22`, color: wallet.color ?? "#818CF8" }}><Icon className="h-6 w-6" /></div>
                        <div>
                          <h2 className="font-semibold text-white">{wallet.name}</h2>
                          <p className="text-xs text-slate-400">{t(`types.${typeLabels[wallet.type]}`)}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={t("actions")} />}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(wallet)}><Pencil className="mr-2 h-4 w-4" />{t("edit")}</DropdownMenuItem>
                          {!wallet.isDefault && <DropdownMenuItem onClick={() => defaultMutation.mutate(wallet.id)}><Star className="mr-2 h-4 w-4" />{t("setDefault")}</DropdownMenuItem>}
                          {!wallet.isArchived && <DropdownMenuItem onClick={() => archiveMutation.mutate(wallet.id)}><Archive className="mr-2 h-4 w-4" />{t("archive")}</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-8 flex items-end justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">{t("currentBalance")}</p>
                        <p className="mt-1 text-3xl font-bold text-white">{Number(wallet.balance).toLocaleString("vi-VN")} <span className="text-base font-medium text-indigo-400">₫</span></p>
                      </div>
                      {wallet.isDefault && <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2.5 py-1 text-xs font-medium text-indigo-300"><Star className="h-3 w-3 fill-current" />{t("default")}</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {toast && <div role="status" className="fixed bottom-5 right-5 z-50 rounded-lg border border-emerald-500/30 bg-emerald-950 px-4 py-3 text-sm text-emerald-200 shadow-xl">{toast}</div>}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="border-slate-700 bg-slate-900 text-slate-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingWallet ? t("editTitle") : t("createTitle")}</DialogTitle>
            <DialogDescription className="text-slate-400">{t("formDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <label className="grid gap-1.5 text-sm font-medium">{t("name")}<Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={t("namePlaceholder")} /></label>
            <label className="grid gap-1.5 text-sm font-medium">{t("type")}<select disabled={Boolean(editingWallet)} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as WalletType })} className="h-8 rounded-lg border border-input bg-slate-800 px-2.5 text-sm"><option value="CASH">{t("types.cash")}</option><option value="BANK">{t("types.bank")}</option><option value="E_WALLET">{t("types.eWallet")}</option><option value="CREDIT">{t("types.credit")}</option><option value="INVESTMENT">{t("types.investment")}</option></select></label>
            <label className="grid gap-1.5 text-sm font-medium">{t("initialBalance")}<Input type="number" min="0" value={form.initialBalance} onChange={(event) => setForm({ ...form, initialBalance: event.target.value })} /></label>
            <div className="grid grid-cols-[1fr_auto] items-end gap-4"><label className="grid gap-1.5 text-sm font-medium">{t("icon")}<select value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} className="h-8 rounded-lg border border-input bg-slate-800 px-2.5 text-sm"><option value="wallet">{t("icons.wallet")}</option><option value="landmark">{t("icons.landmark")}</option><option value="smartphone">{t("icons.smartphone")}</option><option value="credit-card">{t("icons.creditCard")}</option><option value="trending-up">{t("icons.investment")}</option></select></label><label className="grid gap-1.5 text-sm font-medium">{t("color")}<input type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} className="h-8 w-14 cursor-pointer rounded border border-slate-600 bg-transparent p-0.5" /></label></div>
            {error && <p className="text-sm text-rose-400">{error}</p>}
          </div>
          <DialogFooter><Button variant="outline" onClick={closeDialog}>{t("cancel")}</Button><Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-indigo-600 text-white hover:bg-indigo-500">{saveMutation.isPending ? t("saving") : t("save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
