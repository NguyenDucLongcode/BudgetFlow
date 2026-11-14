export interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  provider: "LOCAL" | "GOOGLE" | "GITHUB";
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail extends AdminUserItem {
  timezone?: string;
  sessions?: Array<{
    id: string;
    deviceId: string;
    userAgent: string | null;
    ipAddress: string | null;
    lastLoginAt: string;
    lastActiveAt: string;
    createdAt: string;
  }>;
}

export interface UsersApiResponse {
  users: AdminUserItem[];
  counts: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    admin: number;
    user: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
