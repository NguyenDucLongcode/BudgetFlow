"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { flexRender } from "@tanstack/react-table";
import {
  useLegacyTable as useReactTable,
  getCoreRowModel,
  type LegacyColumnDef as ColumnDef,
} from "@tanstack/react-table/legacy";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import {
  FileText,
  Search,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Code2,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { browserApiClient } from "@/src/lib/bff";
import { Skeleton } from "@/src/components/ui/skeleton";

interface AuditLogItem {
  id: string;
  createdAt: string;
  userId: string | null;
  userEmail: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
}

interface AuditLogsApiResponse {
  logs: AuditLogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminAuditLogsPage() {
  const t = useTranslations("auditLogs");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery<AuditLogsApiResponse>({
    queryKey: ["admin", "audit-logs", { page, search, actionFilter, entityFilter }],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(page),
        limit: "15",
      };
      if (search.trim()) params.search = search.trim();
      if (actionFilter !== "ALL") params.action = actionFilter;
      if (entityFilter !== "ALL") params.entity = entityFilter;

      const res = await browserApiClient.get<{ data: AuditLogsApiResponse }>(
        "/admin/audit-logs",
        params,
      );
      return (res.data as any).data || res.data;
    },
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination;

  const copyMetadata = () => {
    if (!selectedLog) return;
    navigator.clipboard?.writeText(JSON.stringify(selectedLog.metadata, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
      case "CREATE_CATEGORY":
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
            CREATE
          </span>
        );
      case "UPDATE":
      case "UPDATE_USER":
        return (
          <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20">
            UPDATE
          </span>
        );
      case "DELETE":
      case "REVOKE_SESSION":
        return (
          <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/20">
            {action}
          </span>
        );
      case "LOGIN":
      case "REFRESH_TOKEN":
        return (
          <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-400 border border-blue-500/20">
            {action}
          </span>
        );
      case "TOGGLE_ACTIVE":
        return (
          <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-bold text-purple-400 border border-purple-500/20">
            TOGGLE_STATUS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-500/10 px-2 py-0.5 text-[11px] font-semibold text-slate-300 border border-slate-500/20">
            {action}
          </span>
        );
    }
  };

  const columns: ColumnDef<AuditLogItem>[] = [
    {
      accessorKey: "createdAt",
      header: t("colTime"),
      cell: ({ row }) => (
        <span className="text-xs text-slate-400 font-mono">
          {format(new Date(row.original.createdAt), "HH:mm:ss dd/MM/yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "userEmail",
      header: t("colActor"),
      cell: ({ row }) => {
        const isSystem = !row.original.userId || row.original.userEmail.includes("system");
        return (
          <div>
            <p className="text-xs font-semibold text-white truncate">
              {row.original.userName}
            </p>
            <p className={`text-[11px] truncate ${isSystem ? "text-purple-400 font-medium" : "text-slate-400"}`}>
              {row.original.userEmail}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: t("colAction"),
      cell: ({ row }) => renderActionBadge(row.original.action),
    },
    {
      accessorKey: "entity",
      header: t("colEntity"),
      cell: ({ row }) => (
        <span className="rounded-md bg-[#0F172A] px-2 py-0.5 text-[11px] font-semibold text-teal-400 border border-[#334155]/60">
          {row.original.entity}
        </span>
      ),
    },
    {
      accessorKey: "entityId",
      header: t("colEntityId"),
      cell: ({ row }) => (
        <span className="text-[11px] font-mono text-slate-400">
          {row.original.entityId}
        </span>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: t("colIp"),
      cell: ({ row }) => (
        <span className="text-xs font-mono text-slate-300">
          {row.original.ipAddress}
        </span>
      ),
    },
    {
      id: "actions",
      header: t("colDetails"),
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedLog(row.original)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] hover:bg-[#334155] text-slate-200 hover:text-white border border-[#334155] px-2.5 py-1 text-xs font-medium transition-colors"
        >
          <Eye className="h-3.5 w-3.5 text-emerald-400" />
          JSON
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#334155]/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-emerald-400" />
            {t("title")}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-[#334155] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all hover:text-white shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-emerald-400" : ""}`} />
          {isFetching ? t("loading") : t("refresh")}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl p-4 bg-[#1E293B] border border-[#334155] shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t("searchPlaceholder")}
            className="w-full h-10 rounded-xl border border-[#334155] bg-[#0F172A] pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:border-emerald-500/50 focus:outline-hidden"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-[#334155] bg-[#0F172A] px-3 text-xs text-slate-200 focus:border-emerald-500/50 focus:outline-hidden"
          >
            <option value="ALL">{t("allActions")}</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="TOGGLE_ACTIVE">TOGGLE_ACTIVE</option>
            <option value="REVOKE_SESSION">REVOKE_SESSION</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-[#334155] bg-[#0F172A] px-3 text-xs text-slate-200 focus:border-emerald-500/50 focus:outline-hidden"
          >
            <option value="ALL">{t("allEntities")}</option>
            <option value="User">User</option>
            <option value="UserSession">UserSession</option>
            <option value="Category">Category</option>
            <option value="Wallet">Wallet</option>
            <option value="System">System</option>
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
                      className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((_, c) => (
                      <td key={c} className="px-5 py-4">
                        <Skeleton className="h-5 w-full bg-slate-700/50 rounded-md" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400 text-xs">
                    {t("noLogs")}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#0F172A]/40 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3.5 text-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-[#334155]/60 bg-[#0F172A]/50 text-xs text-slate-400">
            <div>
              {t("showing")}{" "}
              <span className="font-semibold text-slate-200">
                {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-slate-200">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              {t("ofTotalEvents", { total: pagination.total })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1 || isFetching}
                className="inline-flex items-center gap-1 rounded-xl bg-[#1E293B] border border-[#334155] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-[#334155] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                {t("prev")}
              </button>

              <span className="px-3 py-1 text-xs font-mono font-bold text-emerald-400">
                {pagination.page} / {pagination.totalPages || 1}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={pagination.page >= pagination.totalPages || isFetching}
                className="inline-flex items-center gap-1 rounded-xl bg-[#1E293B] border border-[#334155] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-[#334155] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {t("next")}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* METADATA JSON DIALOG */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0F172A] border border-[#334155] p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#334155] pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{t("metadataTitle")}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {t("logId")}: {selectedLog.id} | {t("action")}: {selectedLog.action}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyMetadata}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 border border-[#334155] px-2.5 py-1 text-xs font-medium transition-colors"
                >
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? t("copied") : t("copy")}
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-[#1E293B] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl bg-[#090D16] border border-[#334155]/60 p-4 font-mono text-xs text-emerald-400 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
              <pre>{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#334155]">
              <span>{t("recordedFromIp", { ip: selectedLog.ipAddress })}</span>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl bg-[#1E293B] hover:bg-[#334155] px-4 py-1.5 text-xs font-semibold text-slate-200 transition-colors"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
