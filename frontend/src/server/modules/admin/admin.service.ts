import { serverApiClient } from "@/src/lib/bff/server-api-client";
import {
  User,
  AdminPaginatedResponse,
  AdminPaginationUsersDto,
  AdminUserSession,
  ApiResponse,
} from "@/src/types";

class AdminService {
  async getUsers(params: AdminPaginationUsersDto) {
    const res = await serverApiClient.get<AdminPaginatedResponse>(
      "/admin/users",
      params,
    );
    return res.data;
  }

  async getUser(id: string) {
    const res = await serverApiClient.get<ApiResponse<User>>(
      `/admin/users/${id}`,
    );
    return res.data;
  }

  async toggleActive(id: string, status?: string) {
    const res = await serverApiClient.patch<ApiResponse<User>>(
      `/admin/users/${id}/toggle-active`,
      status ? { status } : {},
    );
    return res.data;
  }

  async getUserSessions(id: string) {
    const res = await serverApiClient.get<ApiResponse<AdminUserSession[]>>(
      `/admin/users/${id}/sessions`,
    );
    return res.data;
  }

  async revokeUserSession(userId: string, sessionId: string) {
    const res = await serverApiClient.delete<ApiResponse<null>>(
      `/admin/users/${userId}/sessions/${sessionId}`,
    );
    return res.data;
  }

  async revokeAllUserSessions(userId: string) {
    const res = await serverApiClient.delete<ApiResponse<null>>(
      `/admin/users/${userId}/sessions`,
    );
    return res.data;
  }
}

export const adminService = new AdminService();
