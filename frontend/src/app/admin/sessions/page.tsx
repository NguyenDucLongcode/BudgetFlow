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
  ShieldCheck,
  Smartphone,
  Laptop,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { browserApiClient } from "@/src/lib/bff";
import { Skeleton } from "@/src/components/ui/skeleton";
import type { ApiResponse } from "@/src/types";

interface SessionItem {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  deviceId: string;
  userAgent: string | null;
  ipAddress: string | null;
  lastLoginAt: string;
  lastActiveAt: string;
  createdAt: string;
  isOnline: boolean;
}

interface SessionsApiResponse {
  sessions: SessionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminSessionsPage() {
  const t = useTranslations("sessions");
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const [confirmRevokeSession, setConfirmRevokeSession] = useState<SessionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const { data, isLoading, isFetching, refetch } = useQuery<SessionsApiResponse>({
    queryKey: ["admin", "sessions", { page }],
    queryFn: async () => {
      const res = await browserApiClient.get<ApiResponse<SessionsApiResponse> | SessionsApiResponse>(
        "/admin/sessions",
        { page, limit: 15 },
      );
      const resData = res.data;
      return (
        typeof resData === "object" && resData !== null && "data" in resData
          ? (resData as ApiResponse<SessionsApiResponse>).data
          : resData
      ) as SessionsApiResponse;
    },
    refetchInterval: 15000,
  });

  const revokeMutation = useMutation({
    mutationFn: async ({ sessionId, userId }: { sessionId: string; userId: string }) => {
      await browserApiClient.delete(`/admin/sessions/${sessionId}?userId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      showToast(t("revokeSuccess"));
      setConfirmRevokeSession(null);
    },
    onError: (err: unknown) => {
      let msg = t("revokeError");
      if (typeof err === "object" && err !== null) {
        const errObj = err as Record<string, unknown>;
        const resp = errObj.response as Record<string, unknown> | undefined;
        const respData = resp?.data as Record<string, unknown> | undefined;
        if (typeof respData?.message === "string") msg = respData.message;
      }
      showToast(msg);
    },
  });

  const parseDevice = (ua: string | null) => {
    if (!ua) return { icon: Laptop, name: "Web Browser", os: "Unknown OS" };
    const isMobile = /Android|iPhone|iPad/i.test(ua);
    const isMac = /Macintosh|Mac OS/i.test(ua);
    const isWindows = /Windows NT/i.test(ua);
    const isChrome = /Chrome/i.test(ua);
    const isFirefox = /Firefox/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !isChrome;

    const osName = isWindows ? "Windows" : isMac ? "macOS" : isMobile ? "Mobile" : "Linux";
    const browserName = isChrome ? "Chrome" : isFirefox ? "Firefox" : isSafari ? "Safari" : "Browser";

    return {
      icon: isMobile ? Smartphone : Laptop,
      name: browserName,
      os: osName,
    };
  };

  const allSessions = data?.sessions || [];
  const filteredSessions = allSessions.filter(
    (s) =>
      s.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      s.userName.toLowerCase().includes(search.toLowerCase()) ||
      s.deviceId.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnDef<SessionItem>[] = [
    {
      accessorKey: "userEmail",
      header: t("colAccount"),
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="min-w-[180px]">
            <p className="text-xs font-bold text-white truncate">{s.userName}</p>
            <p className="text-[11px] text-slate-400 truncate">{s.userEmail}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "deviceId",
      header: t("colDeviceId"),
      cell: ({ row }) => {
        const id = row.original.deviceId;
        return (
          <span
            className="rounded-md bg-[#0F172A] px-2 py-1 text-[11px] font-mono text-emerald-400 border border-[#334155]/60 cursor-pointer"
            title={id}
            onClick={() => {
              navigator.clipboard?.writeText(id);
              showToast(t("copiedDeviceId"));
            }}
          >
            {id.substring(0, 10)}...{id.substring(id.length - 4)}
          </span>
        );
      },
    },
    {
      accessorKey: "userAgent",
      header: t("colDeviceBrowser"),
      cell: ({ row }) => {
        const { icon: DeviceIcon, name, os } = parseDevice(row.original.userAgent);
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F172A] text-teal-400 border border-[#334155]/60">
              <DeviceIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">{name}</p>
              <p className="text-[10px] text-slate-400">{os}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "ipAddress",
      header: t("colIp"),
      cell: ({ row }) => (
        <span className="text-xs font-mono text-slate-300">
          {row.original.ipAddress || "127.0.0.1"}
        </span>
      ),
    },
    {
      accessorKey: "lastActiveAt",
      header: t("colLastActive"),
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  s.isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  s.isOnline ? "text-emerald-400" : "text-slate-400"
                }`}
              >
                {s.isOnline ? t("online") : t("offline")}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {format(new Date(s.lastActiveAt), "dd/MM/yyyy HH:mm:ss")}
            </p>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: t("colActions"),
      cell: ({ row }) => {
        const s = row.original;
        return (
          <button
            onClick={() => setConfirmRevokeSession(s)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2.5 py-1 text-xs font-semibold transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("revoke")}
          </button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredSessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const onlineCount = allSessions.filter((s) => s.isOnline).length;

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
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
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
          {isFetching ? t("syncing") : t("refresh")}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 bg-[#1E293B] border border-[#334155]">
          <span className="text-xs text-slate-400">{t("metricTotalSessions")}</span>
          <div className="text-2xl font-bold text-white mt-1">
            {allSessions.length}
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-[#1E293B] border border-[#334155]">
          <span className="text-xs text-slate-400">{t("metricOnlineSessions")}</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
            {onlineCount}
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-[#1E293B] border border-[#334155]">
          <span className="text-xs text-slate-400">{t("metricSecurityStatus")}</span>
          <div className="text-xs font-semibold text-teal-400 mt-2">
            {t("metricSecurityDesc")}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl p-4 bg-[#1E293B] border border-[#334155] shadow-lg flex items-center gap-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 outline-hidden"
        />
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
                Array.from({ length: 4 }).map((_, i) => (
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
                    {t("noSessions")}
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
      </div>

      {/* CONFIRM REVOKE DIALOG */}
      {confirmRevokeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0F172A] border border-[#334155] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="rounded-xl p-2.5 bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t("confirmModalTitle")}</h3>
                <p className="text-xs text-slate-400">{t("confirmModalSubtitle")}</p>
              </div>
            </div>

            <div className="rounded-xl p-3 bg-[#1E293B] border border-[#334155] text-xs text-slate-300 space-y-1 font-mono">
              <p>User: {confirmRevokeSession.userEmail}</p>
              <p>Device: {confirmRevokeSession.deviceId}</p>
              <p>IP: {confirmRevokeSession.ipAddress}</p>
            </div>

            <p className="text-xs text-slate-400">
              {t("confirmModalDesc")}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmRevokeSession(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors"
              >
                {t("confirmCancel")}
              </button>
              <button
                onClick={() =>
                  revokeMutation.mutate({
                    sessionId: confirmRevokeSession.id,
                    userId: confirmRevokeSession.userId,
                  })
                }
                disabled={revokeMutation.isPending}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {revokeMutation.isPending ? t("revoking") : t("confirmRevoke")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
