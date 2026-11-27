"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authService, clearAuthState } from "./auth.service";
import { authKeys } from "./auth.keys";

type LogoutOptions = {
  all?: boolean;
  redirectTo?: string;
};

export function useProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: authService.getProfile,
    ...(options?.enabled !== undefined && { enabled: options.enabled }),
    staleTime: 30 * 60 * 1000, // 30 phút mới refetch
    gcTime: 24 * 60 * 60 * 1000, // Giữ cache 24h
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authKeys.profile(),
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    onMutate: async () => {
      // Dừng toàn bộ polling / in-flight queries (đặc biệt là notifications) trước khi xóa token
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      await queryClient.cancelQueries();
      queryClient.removeQueries({ queryKey: ["notifications"] });
      queryClient.removeQueries({ queryKey: authKeys.profile() });
    },
    mutationFn: (options?: LogoutOptions) =>
      options?.all ? authService.logoutAll() : authService.logout(),

    onSettled: (_data, _error, options) => {
      clearAuthState(queryClient, options?.redirectTo ?? "/login");
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authService.register,
  });
}
