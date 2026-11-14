"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { flexRender } from "@tanstack/react-table";
import {
  useLegacyTable as useReactTable,
  getCoreRowModel,
  type LegacyColumnDef as ColumnDef,
} from "@tanstack/react-table/legacy";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import {
  FolderTree,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Tag,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { browserApiClient } from "@/src/lib/bff";
import { Skeleton } from "@/src/components/ui/skeleton";

interface SystemCategoryItem {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
  isSystem: boolean;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const t = useTranslations("categories");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SystemCategoryItem | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<SystemCategoryItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    type: "INCOME" | "EXPENSE";
    icon: string;
    color: string;
  }>({
    name: "",
    type: "EXPENSE",
    icon: "Folder",
    color: "#10B981",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const { data, isLoading, isFetching, refetch } = useQuery<SystemCategoryItem[]>({
    queryKey: ["admin", "categories", { search, typeFilter }],
    queryFn: async () => {
      const res = await browserApiClient.get<{ data: SystemCategoryItem[] }>(
        "/admin/categories",
        { search, type: typeFilter },
      );
      return (res.data as any).data || res.data;
    },
  });

  const categories = data || [];
  const filteredCategories = categories.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || c.type === typeFilter;
    return matchSearch && matchType;
  });

  // Mutation: Tạo Category
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await browserApiClient.post("/admin/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      showToast(t("createSuccess"));
      setIsCreateOpen(false);
      setFormData({ name: "", type: "EXPENSE", icon: "Folder", color: "#10B981" });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || t("createError"));
    },
  });

  // Mutation: Sửa Category
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      await browserApiClient.patch(`/admin/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      showToast(t("updateSuccess"));
      setEditingCategory(null);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || t("updateError"));
    },
  });

  // Mutation: Xóa Category
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await browserApiClient.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      showToast(t("deleteSuccess"));
      setDeletingCategory(null);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || t("deleteError"));
    },
  });

  const columns: ColumnDef<SystemCategoryItem>[] = [
    {
      accessorKey: "name",
      header: t("colName"),
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white font-bold text-xs shadow-md"
              style={{ backgroundColor: c.color }}
            >
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{c.name}</p>
              <p className="text-[10px] text-slate-400 font-mono">ID: {c.id}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: t("colType"),
      cell: ({ row }) => {
        const isIncome = row.original.type === "INCOME";
        return isIncome ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
            <ArrowDownRight className="h-3 w-3" />
            {t("income")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/20">
            <ArrowUpRight className="h-3 w-3" />
            {t("expense")}
          </span>
        );
      },
    },
    {
      accessorKey: "color",
      header: t("colColor"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full border border-white/20 shadow-xs"
            style={{ backgroundColor: row.original.color }}
          />
          <span className="text-xs font-mono text-slate-300 uppercase">
            {row.original.color}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("colCreatedAt"),
      cell: ({ row }) => (
        <span className="text-xs text-slate-400 font-mono">
          {format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm")}
        </span>
      ),
    },
    {
      id: "actions",
      header: t("colActions"),
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingCategory(c);
                setFormData({
                  name: c.name,
                  type: c.type,
                  icon: c.icon || "Folder",
                  color: c.color || "#10B981",
                });
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-[#334155] hover:text-white transition-colors"
              title={t("editTitle")}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setDeletingCategory(c)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
              title={t("deleteConfirmTitle")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredCategories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-semibold text-slate-950 shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#334155]/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FolderTree className="h-6 w-6 text-emerald-400" />
            {t("title")}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-[#334155] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all hover:text-white shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-emerald-400" : ""}`} />
            {isFetching ? t("loading") : t("refresh")}
          </button>

          <button
            onClick={() => {
              setFormData({ name: "", type: "EXPENSE", icon: "Folder", color: "#10B981" });
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            {t("addCategory")}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl p-4 bg-[#1E293B] border border-[#334155] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full h-10 rounded-xl border border-[#334155] bg-[#0F172A] pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:border-emerald-500/50 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">{t("filterType")}</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-xl border border-[#334155] bg-[#0F172A] px-3 text-xs text-slate-200 focus:border-emerald-500/50 focus:outline-hidden"
          >
            <option value="ALL">{t("allTypes")}</option>
            <option value="INCOME">{t("incomeType")}</option>
            <option value="EXPENSE">{t("expenseType")}</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl bg-[#1E293B] border border-[#334155] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0F172A]/70">
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/60">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((_, c) => (
                      <td key={c} className="px-6 py-4">
                        <Skeleton className="h-5 w-full bg-slate-700/50 rounded-md" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 text-xs">
                    {t("noCategories")}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#0F172A]/40 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT DIALOG */}
      {(isCreateOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0F172A] border border-[#334155] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#334155] pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="h-5 w-5 text-emerald-400" />
                {editingCategory ? t("editTitle") : t("createTitle")}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCategory(null);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#1E293B] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">{t("nameLabel")}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("namePlaceholder")}
                  className="w-full h-10 rounded-xl border border-[#334155] bg-[#1E293B] px-3 text-xs text-white focus:border-emerald-500/50 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">{t("typeLabel")}</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full h-10 rounded-xl border border-[#334155] bg-[#1E293B] px-3 text-xs text-white focus:border-emerald-500/50 focus:outline-hidden"
                >
                  <option value="EXPENSE">{t("expenseType")}</option>
                  <option value="INCOME">{t("incomeType")}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">{t("colorLabel")}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-14 rounded-xl border border-[#334155] bg-[#1E293B] p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 h-10 rounded-xl border border-[#334155] bg-[#1E293B] px-3 text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#334155]">
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCategory(null);
                }}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-[#1E293B]"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => {
                  if (!formData.name.trim()) {
                    showToast(t("nameRequired"));
                    return;
                  }
                  if (editingCategory) {
                    updateMutation.mutate({ id: editingCategory.id, data: formData });
                  } else {
                    createMutation.mutate(formData);
                  }
                }}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0F172A] border border-[#334155] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="rounded-xl p-2.5 bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t("deleteConfirmTitle")}</h3>
                <p className="text-xs text-slate-400 font-mono">{deletingCategory.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              {t("deleteConfirmDesc")}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingCategory(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-[#1E293B]"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingCategory.id)}
                disabled={deleteMutation.isPending}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {deleteMutation.isPending ? t("deleting") : t("deleteConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
