"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authService } from "./auth.service";
import { authKeys } from "./auth.keys";

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
    mutationFn: authService.logout,

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: authKeys.profile(),
      });
    },
  });
}
