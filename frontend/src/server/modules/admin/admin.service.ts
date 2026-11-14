import { serverApiClient } from "@/src/lib/bff/server-api-client";
import {
  AdminPaginatedResponse,
  AdminPaginationUsersDto,
} from "@/src/types/api";

class AdminService {
  async getUsers(params: AdminPaginationUsersDto) {
    const res = await serverApiClient.get<AdminPaginatedResponse>(
      "/admin/users",
      params,
    );
    return res.data;
  }

  async getUser(id: string) {
    const res = await serverApiClient.get<any>(`/admin/users/${id}`);
    return res.data;
  }

  async toggleActive(id: string, csrfToken?: string, status?: string) {
    const res = await serverApiClient.patch<any>(
      `/admin/users/${id}/toggle-active`,
      status ? { status } : {},
      csrfToken
        ? {
            headers: {
              "x-xsrf-token": csrfToken,
            },
          }
        : undefined,
    );
    return res.data;
  }

  async getUserSessions(id: string) {
    const res = await serverApiClient.get<any>(`/admin/users/${id}/sessions`);
    return res.data;
  }

  async revokeUserSession(
    userId: string,
    sessionId: string,
    csrfToken?: string,
  ) {
    const res = await serverApiClient.delete<any>(
      `/admin/users/${userId}/sessions/${sessionId}`,
      csrfToken
        ? {
            headers: {
              "x-xsrf-token": csrfToken,
            },
          }
        : undefined,
    );
    return res.data;
  }

  async revokeAllUserSessions(userId: string, csrfToken?: string) {
    const res = await serverApiClient.delete<any>(
      `/admin/users/${userId}/sessions`,
      csrfToken
        ? {
            headers: {
              "x-xsrf-token": csrfToken,
            },
          }
        : undefined,
    );
    return res.data;
  }
}

export const adminService = new AdminService();
