import { Role } from "./enums";

export interface UserSession {
  id: string;
  userId: string;
  deviceId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  isRemember?: boolean;
  lastLoginAt: string;
  lastActiveAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminUserSession {
  id: string;
  userId: string;
  deviceId: string;
  userAgent: string | null;
  ipAddress: string | null;
  lastLoginAt: string;
  lastActiveAt: string;
  createdAt: string;
}

export interface AccessTokenSession {
  accessToken: string;
  userId: string;
  role: Role;
  deviceId: string;
  expiresAt: number;
}

export interface SessionItem {
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

export interface SessionsApiResponse {
  sessions: SessionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
