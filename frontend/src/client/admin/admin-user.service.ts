import { browserApiClient } from "@/src/lib/bff";

import type { AdminPaginatedResponse } from "@/src/types/api";

import type { AdminPaginationUsersDto } from "@/src/types";

class AdminUserService {
  async getUsers(params: AdminPaginationUsersDto) {
    const res = await browserApiClient.get<AdminPaginatedResponse>(
      "/admin/users",
      {
        params,
      },
    );

    return res.data;
  }
}

export const adminUserService = new AdminUserService();
