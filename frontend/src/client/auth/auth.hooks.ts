"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authService } from "./auth.service";
import { authKeys } from "./auth.keys";

export function useProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: authService.getProfile,
    ...(options?.enabled !== undefined && { enabled: options.enabled }),
    retry: false,
    staleTime: 5 * 60 * 1000,
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
