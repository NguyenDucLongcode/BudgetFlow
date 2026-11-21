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
    if (res.data?.data?.deviceId && typeof window !== "undefined") {
      localStorage.setItem("x-device-id", res.data.data.deviceId);
    }
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
  redirectTo = "/login?error=session_expired",
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem("x-device-id");
    activeQueryClient.removeQueries({ queryKey: authKeys.profile() });
    activeQueryClient.clear();
    document.cookie = "device_id=; path=/; max-age=0";
    document.cookie = "refresh_token=; path=/; max-age=0";
    document.cookie = "XSRF-TOKEN=; path=/; max-age=0";
  } catch (err) {
    console.error("[clearAuthState] Error clearing client cookies:", err);
  }

  window.location.replace(redirectTo);
}
