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
}
export const adminService = new AdminService();
