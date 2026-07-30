"use client";

import { useQuery } from "@tanstack/react-query";

import { adminUserService } from "./admin-user.service";
import type { AdminPaginationUsersDto } from "@/src/types";
import { adminUserKeys } from "./adminUserKeys";

export function useUsers(params: AdminPaginationUsersDto) {
  return useQuery({
    queryKey: adminUserKeys.list(params),

    queryFn: () => adminUserService.getUsers(params),

    placeholderData: (previous) => previous,

    staleTime: 60 * 1000,
  });
}
