"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Activity,
  Server,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Cpu,
  Radio,
} from "lucide-react";
import { browserApiClient } from "@/src/lib/bff";
import { Skeleton } from "@/src/components/ui/skeleton";
import type { ApiResponse } from "@/src/types";

interface PerformanceMetricsResponse {
  metrics: {
    uptime: number;
    totalRequests: number;
    errorRate: number;
    responseTime: number;
    memoryUsedMb: number;
  };
  infrastructure: Array<{
    name: string;
    url: string;
    port: number;
    status: "HEALTHY" | "DEGRADED" | "OFFLINE" | "UNKNOWN";
    latencyMs: number;
    statusCode: number;
  }>;
}

export default function AdminPerformancePage() {
  const t = useTranslations("performance");
  const [iframeKey, setIframeKey] = useState(0);

  const { data, isLoading, isFetching, refetch } = useQuery<PerformanceMetricsResponse>({
    queryKey: ["admin", "performance"],
    queryFn: async () => {
      const res = await browserApiClient.get<ApiResponse<PerformanceMetricsResponse> | PerformanceMetricsResponse>(
        "/admin/metrics",
      );
      const resData = res.data;
      return (
        typeof resData === "object" && resData !== null && "data" in resData
          ? (resData as ApiResponse<PerformanceMetricsResponse>).data
          : resData
      ) as PerformanceMetricsResponse;
    },
    refetchInterval: 10000,
  });

  const metrics = data?.metrics;
  const infrastructure = data?.infrastructure || [];

  const formatUptime = (seconds: number = 0) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    return `${minutes}m ${secs}s`;
  };

  const handleReloadIframes = () => {
    setIframeKey((k) => k + 1);
    refetch();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#334155]/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-emerald-400" />
            {t("title")}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <button
          onClick={handleReloadIframes}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-[#334155] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all hover:text-white shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-emerald-400" : ""}`} />
          {isFetching ? t("scanning") : t("refresh")}
        </button>
      </div>

      {/* PHẦN 1: 4 STATCARDS METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Uptime */}
        <div className="rounded-2xl p-5 bg-[#1E293B] border border-[#334155] shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t("uptimeTitle")}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-slate-700/60" />
            ) : (
              <div className="text-2xl font-extrabold tracking-tight text-white font-mono">
                {formatUptime(metrics?.uptime)}
              </div>
            )}
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {t("nodeHealthy")}
            </div>
          </div>
        </div>

        {/* Card 2: Total Requests */}
        <div className="rounded-2xl p-5 bg-[#1E293B] border border-[#334155] shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t("totalRequestsTitle")}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-slate-700/60" />
            ) : (
              <div className="text-2xl font-extrabold tracking-tight text-white font-mono">
                {metrics?.totalRequests?.toLocaleString() ?? 0}
              </div>
            )}
            <div className="mt-2 text-xs text-slate-400">
              {t("prometheusMetric")}
            </div>
          </div>
        </div>

        {/* Card 3: Error Rate */}
        <div className="rounded-2xl p-5 bg-[#1E293B] border border-[#334155] shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t("errorRateTitle")}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-slate-700/60" />
            ) : (
              <div className="text-2xl font-extrabold tracking-tight text-white font-mono">
                {metrics?.errorRate ?? 0}%
              </div>
            )}
            <div className="mt-2 text-xs text-emerald-400 font-medium">
              {(metrics?.errorRate ?? 0) < 1 ? t("errorLow") : t("errorNeedMonitor")}
            </div>
          </div>
        </div>

        {/* Card 4: Response Time */}
        <div className="rounded-2xl p-5 bg-[#1E293B] border border-[#334155] shadow-lg relative overflow-hidden group hover:border-teal-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t("responseTimeTitle")}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-slate-700/60" />
            ) : (
              <div className="text-2xl font-extrabold tracking-tight text-white font-mono">
                {metrics?.responseTime ?? 15} ms
              </div>
            )}
            <div className="mt-2 text-xs text-slate-400">
              {t("heapMemory", { mb: metrics?.memoryUsedMb ?? 80 })}
            </div>
          </div>
        </div>
      </div>

      {/* PHẦN 2: BẢNG TRẠNG THÁI INFRASTRUCTURE PING */}
      <div className="rounded-2xl bg-[#1E293B] border border-[#334155] shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">{t("infraTitle")}</h2>
          </div>
          <span className="text-xs text-slate-400">{t("autoPing")}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0F172A]/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3.5">{t("colService")}</th>
                <th className="px-6 py-3.5">{t("colEndpoint")}</th>
                <th className="px-6 py-3.5">{t("colPort")}</th>
                <th className="px-6 py-3.5">{t("colLatency")}</th>
                <th className="px-6 py-3.5 text-right">{t("colStatus")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/60 text-xs">
              {infrastructure.map((svc, idx) => {
                const isHealthy = svc.status === "HEALTHY";
                return (
                  <tr key={idx} className="hover:bg-[#0F172A]/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${isHealthy ? "bg-emerald-400" : "bg-rose-500"}`} />
                      {svc.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300 text-xs">
                      {svc.url}
                    </td>
                    <td className="px-6 py-4 font-mono text-emerald-400 font-semibold">
                      :{svc.port}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {svc.latencyMs} ms
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isHealthy ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          {t("healthy")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/20">
                          <XCircle className="h-3 w-3" />
                          {t("offline")}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PHẦN 3: GRAFANA IFRAMES */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-400" />
              {t("grafanaTitle")}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t("grafanaDesc")}
            </p>
          </div>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            {t("openGrafanaTab")}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Iframe 1: CPU & Memory (cAdvisor) */}
          <div className="rounded-2xl bg-[#1E293B] border border-[#334155] shadow-xl overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-400" />
                {t("cadvisorTitle")}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">cadvisor-dashboard</span>
            </div>
            <div className="relative w-full rounded-xl overflow-hidden border border-[#334155] bg-[#090D16]">
              <iframe
                key={`cadvisor-${iframeKey}`}
                src="http://localhost:3001/d/cadvisor-dashboard?kiosk"
                className="w-full h-[450px] border-none"
                title="cAdvisor Grafana Dashboard"
                loading="lazy"
              />
              <div className="p-3 bg-[#0F172A] border-t border-[#334155] text-[11px] text-slate-400 flex items-center justify-between">
                <span>URL: http://localhost:3001/d/cadvisor-dashboard?kiosk</span>
                <span className="text-emerald-400 font-mono">{t("autoKiosk")}</span>
              </div>
            </div>
          </div>

          {/* Iframe 2: API Traffic Dashboard */}
          <div className="rounded-2xl bg-[#1E293B] border border-[#334155] shadow-xl overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-teal-400" />
                {t("apiTrafficTitle")}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">api-dashboard</span>
            </div>
            <div className="relative w-full rounded-xl overflow-hidden border border-[#334155] bg-[#090D16]">
              <iframe
                key={`api-${iframeKey}`}
                src="http://localhost:3001/d/api-dashboard?kiosk"
                className="w-full h-[450px] border-none"
                title="API Traffic Grafana Dashboard"
                loading="lazy"
              />
              <div className="p-3 bg-[#0F172A] border-t border-[#334155] text-[11px] text-slate-400 flex items-center justify-between">
                <span>URL: http://localhost:3001/d/api-dashboard?kiosk</span>
                <span className="text-teal-400 font-mono">{t("autoKiosk")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
