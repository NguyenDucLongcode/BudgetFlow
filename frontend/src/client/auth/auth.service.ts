import { QueryClient } from "@tanstack/react-query";

import { browserApiClient } from "@/src/lib/bff";
import {
  AuthResponse,
  LoginDto,
  RegisterDto,
  RegisterResponse,
  UserProfile,
} from "@/src/types/api";
import { authKeys } from "./auth.keys";
import { queryClient } from "@/src/lib/react-query/query-client";

class AuthService {
  async login(data: LoginDto) {
    const res = await browserApiClient.post<AuthResponse>("/auth/login", data);

    return res.data;
  }

  logout() {
    console.log("Logging out user and clearing auth state");
    return browserApiClient.post<void>("/auth/logout");
  }

  logoutAll() {
    return browserApiClient.post<void>("/auth/logout-all");
  }

  async getProfile() {
    const res = await browserApiClient.get<UserProfile>("/users/me");

    return res.data;
  }

  async register(data: RegisterDto) {
    const res = await browserApiClient.post<RegisterResponse>(
      "/auth/register",
      data,
    );

    return res.data;
  }
}

export const authService = new AuthService();

export function clearAuthState(
  activeQueryClient: QueryClient = queryClient,
  redirectTo = "/login",
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("x-device-id");
  activeQueryClient.removeQueries({
    queryKey: authKeys.profile(),
  });

  window.location.replace(redirectTo);
}
