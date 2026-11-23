"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useLegacyTable as useReactTable,
  getCoreRowModel,
  type LegacyColumnDef as ColumnDef,
} from "@tanstack/react-table/legacy";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import {
  Users,
  Search,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Mail,
  Smartphone,
  Globe,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  X,
  Laptop,
} from "lucide-react";
import { browserApiClient } from "@/src/lib/bff";
import { Skeleton } from "@/src/components/ui/skeleton";
import type { ApiResponse } from "@/src/types";
import {
  UserStatusDropdown,
  UserVerifyCell,
  UserRow,
} from "./components";
import type {
  AdminUserItem,
  UserDetail,
  UsersApiResponse,
} from "./types";

export default function UsersAdminPage() {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Sheet Detail State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Users List
  const { data, isLoading, isFetching, refetch } = useQuery<UsersApiResponse>({
    queryKey: ["admin", "users", { page, limit, search, roleFilter, statusFilter }],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(limit),
      };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== "ALL") params.role = roleFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await browserApiClient.get<ApiResponse<UsersApiResponse> | UsersApiResponse>(
        "/admin/users",
        params,
      );
      const resData = res.data;
      return (
        typeof resData === "object" && resData !== null && "data" in resData
          ? (resData as ApiResponse<UsersApiResponse>).data
          : resData
      ) as UsersApiResponse;
    },
  });

  // Fetch Single User Detail for Sheet
  const { data: userDetail, isLoading: isLoadingDetail } = useQuery<UserDetail>({
    queryKey: ["admin", "user", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) throw new Error("No user selected");
      const res = await browserApiClient.get<ApiResponse<UserDetail> | UserDetail>(
        `/admin/users/${selectedUserId}`,
      );
      const resData = res.data;
      return (
        typeof resData === "object" && resData !== null && "data" in resData
          ? (resData as ApiResponse<UserDetail>).data
          : resData
      ) as UserDetail;
    },
    enabled: !!selectedUserId,
  });

  // Mutation: Khóa / Mở khóa tài khoản (toggle active / set status)
  const toggleStatusMutation = useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string;
      status?: "ACTIVE" | "SUSPENDED";
    }) => {
      await browserApiClient.patch(
        `/admin/users/${userId}/status`,
        status ? { status } : {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      if (selectedUserId) {
        queryClient.invalidateQueries({ queryKey: ["admin", "user", selectedUserId] });
      }
      showToast(t("statusUpdateSuccess"));
      setActionMenuOpenId(null);
    },
    onError: (err: unknown) => {
      let msg = t("statusUpdateError");
      if (typeof err === "object" && err !== null) {
        const errObj = err as Record<string, unknown>;
        const resp = errObj.response as Record<string, unknown> | undefined;
        const respData = resp?.data as Record<string, unknown> | undefined;
        if (typeof respData?.message === "string") msg = respData.message;
      }
      showToast(msg, true);
    },
  });

  // Mutation: Thu hồi phiên đăng nhập của User
  const revokeSessionMutation = useMutation({
    mutationFn: async ({ userId, sessionId }: { userId: string; sessionId: string }) => {
      await browserApiClient.delete(`/admin/sessions/${sessionId}?userId=${userId}`);
    },
    onSuccess: () => {
      if (selectedUserId) {
        queryClient.invalidateQueries({ queryKey: ["admin", "user", selectedUserId] });
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
      showToast(t("sessionRevokeSuccess"));
    },
    onError: (err: unknown) => {
      let msg = t("sessionRevokeError");
      if (typeof err === "object" && err !== null) {
        const errObj = err as Record<string, unknown>;
        const resp = errObj.response as Record<string, unknown> | undefined;
        const respData = resp?.data as Record<string, unknown> | undefined;
        if (typeof respData?.message === "string") msg = respData.message;
      }
      showToast(msg, true);
    },
  });

  // Helper Initials
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Helper Provider Icon
  const renderProvider = (provider?: string) => {
    switch (provider) {
      case "GOOGLE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Globe className="h-3.5 w-3.5 text-amber-400" />
            Google
          </span>
        );
      case "GITHUB":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Globe className="h-3.5 w-3.5 text-indigo-400" />
            GitHub
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Mail className="h-3.5 w-3.5 text-emerald-400" />
            Email
          </span>
        );
    }
  };

  // Table Columns Definition
  const columns: ColumnDef<AdminUserItem>[] = [
    {
      id: "user",
      header: t("colUser"),
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            {u.avatar ? (
              <img
                src={u.avatar}
                alt={u.name}
                className="h-9 w-9 rounded-full object-cover border border-[#334155]"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                {getInitials(u.name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{u.name || t("unnamedUser")}</p>
              <p className="truncate text-[11px] text-slate-400">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: t("colRole"),
      cell: ({ row }) => {
        const role = row.original.role;
        return role === "ADMIN" ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-bold text-purple-400 border border-purple-500/20">
            <ShieldAlert className="h-3 w-3" />
            ADMIN
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-3 w-3" />
            USER
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("colStatus"),
      cell: ({ row }) => (
        <UserStatusDropdown
          userId={row.original.id}
          status={row.original.status}
          onStatusChange={async (userId, newStatus) => {
            await toggleStatusMutation.mutateAsync({ userId, status: newStatus });
          }}
          disabled={toggleStatusMutation.isPending}
        />
      ),
    },
    {
      accessorKey: "provider",
      header: t("colProvider"),
      cell: ({ row }) => renderProvider(row.original.provider),
    },
    {
      accessorKey: "verifiedAt",
      header: t("colVerify"),
      cell: ({ row }) => (
        <UserVerifyCell
          email={row.original.email}
          verifiedAt={row.original.verifiedAt}
          onToast={(msg, isErr) => showToast(msg, isErr)}
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("colCreatedAt"),
      cell: ({ row }) => {
        try {
          return (
            <span className="text-xs text-slate-400 font-mono">
              {format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm")}
            </span>
          );
        } catch {
          return <span className="text-xs text-slate-400">N/A</span>;
        }
      },
    },
    {
      id: "actions",
      header: t("colActions"),
      cell: ({ row }) => {
        const u = row.original;
        const isOpen = actionMenuOpenId === u.id;
        return (
          <div className="relative text-right">
            <button
              onClick={() => setActionMenuOpenId(isOpen ? null : u.id)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-[#334155] hover:text-white transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setActionMenuOpenId(null)}
                />
                <div className="absolute right-0 top-8 z-30 w-48 rounded-xl bg-[#0F172A] border border-[#334155] p-1.5 shadow-2xl space-y-1 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setActionMenuOpenId(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 hover:bg-[#1E293B] hover:text-white transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5 text-emerald-400" />
                    {t("viewDetails")}
                  </button>

                  <button
                    onClick={() => {
                      if (u.status === "PENDING") {
                        showToast(t("pendingNotAllowed"), true);
                        return;
                      }
                      const newStatus = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
                      toggleStatusMutation.mutate({ userId: u.id, status: newStatus });
                    }}
                    disabled={toggleStatusMutation.isPending || u.status === "PENDING"}
                    className={
                      u.status === "PENDING"
                        ? "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 cursor-not-allowed opacity-60"
                        : "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 hover:bg-[#1E293B] hover:text-white transition-colors"
                    }
                  >
                    {u.status === "PENDING" ? (
                      <>
                        <Lock className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-slate-500">{tCommon("pending")}</span>
                      </>
                    ) : u.status === "ACTIVE" ? (
                      <>
                        <Lock className="h-3.5 w-3.5 text-rose-400" />
                        <span className="text-rose-400">{t("lockAccount")}</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{t("unlockAccount")}</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl animate-in slide-in-from-bottom-5 ${
            toast.isError
              ? "bg-rose-500 text-white"
              : "bg-emerald-500 text-slate-950"
          }`}
        >
          {toast.isError ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-emerald-400" />
            {t("title")}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t("subtitle")}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-xl border border-[#334155] bg-[#1E293B] px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-[#334155] hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          {tCommon("refresh")}
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#334155] bg-[#1E293B] p-4 lg:flex-row lg:items-center lg:justify-between">
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
            className="h-10 w-full rounded-xl border border-[#334155] bg-[#0F172A] pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:outline-hidden"
          />
        </div>

        {/* Dropdowns Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">{t("statusFilter")}</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-[#334155] bg-[#0F172A] px-3 text-xs text-slate-200 focus:border-emerald-500/50 focus:outline-hidden"
            >
              <option value="ALL">{t("allStatus")}</option>
              <option value="ACTIVE">{t("activeStatus")}</option>
              <option value="PENDING">{t("pendingStatus")}</option>
              <option value="SUSPENDED">{t("suspendedStatus")}</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">{t("roleFilter")}</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-[#334155] bg-[#0F172A] px-3 text-xs text-slate-200 focus:border-emerald-500/50 focus:outline-hidden"
            >
              <option value="ALL">{t("allRoles")}</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-[#334155] bg-[#1E293B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-[#334155] bg-[#0F172A]/80">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : (header.column.columnDef.header as React.ReactNode)}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-[#334155]/60">
                    <td className="px-4 py-3.5"><Skeleton className="h-9 w-40 bg-slate-800" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-6 w-16 bg-slate-800" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-6 w-20 bg-slate-800" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-6 w-16 bg-slate-800" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-6 w-24 bg-slate-800" /></td>
                    <td className="px-4 py-3.5"><Skeleton className="h-6 w-28 bg-slate-800" /></td>
                    <td className="px-4 py-3.5 text-right"><Skeleton className="h-8 w-8 ml-auto bg-slate-800 rounded-lg" /></td>
                  </tr>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <UserRow key={row.id} row={row} />
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-xs text-slate-400">
                    {t("noUsersFound")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-[#334155] bg-[#0F172A]/40 text-xs text-slate-400">
          <div>
            {t("pageSummary", {
              page: data?.pagination?.page || page,
              totalPages: data?.pagination?.totalPages || 1,
              total: data?.pagination?.total || 0,
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-1.5 text-slate-300 hover:bg-[#334155] hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              {tCommon("previous")}
            </button>
            <button
              onClick={() => setPage((p) => (data?.pagination?.hasNextPage ? p + 1 : p))}
              disabled={!data?.pagination?.hasNextPage}
              className="inline-flex items-center gap-1 rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-1.5 text-slate-300 hover:bg-[#334155] hover:text-white disabled:opacity-40 transition-colors"
            >
              {tCommon("next")}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* USER DETAIL SHEET / DRAWER */}
      {selectedUserId && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedUserId(null)}
          />

          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#0F172A] border-l border-[#334155] shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#334155] pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                {t("userDetailTitle")}
              </h3>
              <button
                onClick={() => setSelectedUserId(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#1E293B] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full bg-slate-800 rounded-xl" />
                <Skeleton className="h-40 w-full bg-slate-800 rounded-xl" />
                <Skeleton className="h-40 w-full bg-slate-800 rounded-xl" />
              </div>
            ) : userDetail ? (
              <div className="space-y-6">
                {/* Profile Card */}
                <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    {userDetail.avatar ? (
                      <img
                        src={userDetail.avatar}
                        alt={userDetail.name}
                        className="h-14 w-14 rounded-full object-cover border-2 border-emerald-500/40"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-lg font-bold font-mono border-2 border-emerald-500/30">
                        {getInitials(userDetail.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-bold text-white truncate">{userDetail.name || t("unnamedUser")}</h4>
                      <p className="text-xs text-slate-400 truncate">{userDetail.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/20">
                          {userDetail.role}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                            userDetail.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : userDetail.status === "SUSPENDED"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {userDetail.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Meta Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#334155]/60 text-xs">
                    <div>
                      <span className="text-slate-400">{tCommon("status")}:</span>
                      <p
                        className={`font-semibold mt-0.5 ${
                          userDetail.status === "ACTIVE"
                            ? "text-emerald-400"
                            : userDetail.status === "SUSPENDED"
                              ? "text-rose-400"
                              : "text-amber-400"
                        }`}
                      >
                        {userDetail.status}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">{t("timezone")}</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{userDetail.timezone || "Asia/Ho_Chi_Minh"}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">{t("colCreatedAt")}:</span>
                      <p className="font-semibold text-slate-200 mt-0.5 font-mono">
                        {format(new Date(userDetail.createdAt), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">{t("verifiedEmail")}</span>
                      <p className="font-semibold text-slate-200 mt-0.5">
                        {userDetail.verifiedAt ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {tCommon("verified")}
                          </span>
                        ) : (
                          <span className="text-amber-400">{tCommon("unverified")}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SESSIONS & DEVICES LIST */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-emerald-400" />
                      {t("sessionsAndDevices", { count: userDetail.sessions?.length || 0 })}
                    </h4>
                  </div>

                  {(!userDetail.sessions || userDetail.sessions.length === 0) ? (
                    <div className="rounded-xl p-4 bg-[#1E293B]/60 border border-[#334155] text-center text-xs text-slate-400">
                      {t("noSessions")}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userDetail.sessions.map((sess) => (
                        <div
                          key={sess.id}
                          className="rounded-xl p-3.5 bg-[#1E293B] border border-[#334155] space-y-2 hover:border-[#475569] transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-white flex items-center gap-1.5">
                              <Laptop className="h-3.5 w-3.5 text-emerald-400" />
                              {sess.userAgent?.includes("Mobile") ? t("mobileDevice") : t("desktopBrowser")}
                            </span>
                            <button
                              onClick={() => revokeSessionMutation.mutate({ userId: userDetail.id, sessionId: sess.id })}
                              disabled={revokeSessionMutation.isPending}
                              className="rounded-lg bg-rose-500/10 px-2 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                            >
                              {t("revoke")}
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                            <p className="truncate">{t("device")} {sess.deviceId}</p>
                            <p>{t("ip")} {sess.ipAddress || "127.0.0.1"}</p>
                            <p className="text-[10px] text-slate-400">
                              {t("lastActive")} {format(new Date(sess.lastActiveAt), "dd/MM/yyyy HH:mm:ss")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
