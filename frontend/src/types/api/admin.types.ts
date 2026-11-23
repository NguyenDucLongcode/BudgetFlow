import { Role } from "../enums";
import { User } from "../user";
import { PaginationResponse } from "./api.types";

export type UserCounts = {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  admins: number;
};

export type AdminPaginationUsersDto = {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  status?: string;
};

export interface AdminPaginatedResponse {
  users: User[];
  pagination: PaginationResponse;
  counts: UserCounts;
}

export interface AuditLogItem {
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
  metadata: Record<string, unknown>;
}

export interface AuditLogsApiResponse {
  logs: AuditLogItem[];
  pagination: PaginationResponse;
}

export interface PerformanceMetricsResponse {
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
